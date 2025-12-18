import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prismaConf";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    console.log("CoinPal Webhook Headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));
    console.log("CoinPal Webhook Body:", bodyText);

    // IMPORTANT: Webhook signature validation is not implemented.
    // This is a security risk. Anyone could call this endpoint and credit a user's account.
    // The signature is present in the body ('sign' parameter), but the method for calculating it
    // on the server for verification is unknown without documentation.
    // Try to read JSON first, otherwise fall back to form data.
    let orderNo: string | null = null;
    let status: string | null = null;

    try {
      const json = JSON.parse(bodyText);
      orderNo = json.orderNo ?? null;
      status = json.status ?? null;
    } catch {
      const formData = await req.formData();
      orderNo = formData.get("orderNo") ? String(formData.get("orderNo")) : null;
      status = formData.get("status") ? String(formData.get("status")) : null;
    }

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
      // Update user's balance and transaction
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            balance: {
              increment: amount,
            },
          },
        });
        await tx.transaction.create({
          data: {
            id: orderNo,
            userId: userId,
            amount: amount,
            type: "DEPOSIT",
          },
        });
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
