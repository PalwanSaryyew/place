import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    console.log(
      "CoinPal Webhook Headers:",
      JSON.stringify(Object.fromEntries(req.headers.entries()))
    );
    console.log("CoinPal Webhook Body:", bodyText);

    const formData = new URLSearchParams(bodyText);
    const sign = formData.get("sign");

    if (!sign) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    formData.delete("sign"); // Remove sign from parameters for validation

    // --- Signature Validation ---
    const COINPAL_SECRET_KEY = process.env.COINPAL_SECRET_KEY;
    if (!COINPAL_SECRET_KEY) {
      console.error("COINPAL_SECRET_KEY is not set for webhook validation");
      throw new Error("COINPAL_SECRET_KEY is not set for webhook validation");
    }

    // Create an array of [key, value] pairs and sort alphabetically by key
    const params: [string, string][] = [];
    for (const [key, value] of formData.entries()) {
      params.push([key, value]);
    }
    params.sort((a, b) => a[0].localeCompare(b[0]));

    // The CoinPal documentation specifies the sorted parameters should be in "key=value&" format, with a trailing ampersand.
    const paramString = params.map(([key, value]) => `${key}=${value}&`).join("");
    const signString = paramString + COINPAL_SECRET_KEY;

    const expectedSign = createHash("sha256").update(signString).digest("hex");

    if (expectedSign !== sign) {
      console.error("Webhook signature validation failed.");
      console.error("String to sign (with secret):", signString);
      console.error("Expected signature:", expectedSign);
      console.error("Received signature:", sign);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }
    console.log("Webhook signature validation successful.");
    // --- End of Signature Validation ---

    const orderNo = formData.get("orderNo");
    const status = formData.get("status");

    if (!orderNo || !status) {
      return NextResponse.json(
        { error: "Missing orderNo or status" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, userId, amountStr, timestamp] = String(orderNo).split("_");
    const amount = parseFloat(amountStr);

    if (status === "paid") {
      // Use a transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // Idempotency check: ensure we haven't processed this transaction before
        const existingTransaction = await tx.transaction.findUnique({
          where: { id: orderNo },
        });

        if (existingTransaction) {
          console.log(`Transaction ${orderNo} has already been processed.`);
          return; // Exit transaction if already processed
        }

        // Update user's balance
        await tx.user.update({
          where: { id: userId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });

        // Record the successful transaction
        await tx.transaction.create({
          data: {
            id: orderNo,
            userId: userId,
            amount: amount,
            type: "DEPOSIT",
          },
        });

        console.log(
          `Successfully processed transaction ${orderNo} for user ${userId}. Balance increased by ${amount}.`
        );
      });
    } else {
      console.log(
        `Webhook received for order ${orderNo} with status: ${status}. No action taken.`
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error handling webhook:", errorMessage);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
