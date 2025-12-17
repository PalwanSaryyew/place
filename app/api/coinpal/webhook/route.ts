import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prismaConf";

export async function POST(req: NextRequest) {
  try {
    // In a real application, you should validate the webhook signature here.
    const { orderNo, status } = await req.json();

    if (!orderNo || !status) {
      return NextResponse.json(
        { error: "Missing orderNo or status" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, userId, amountStr, timestamp] = orderNo.split("_");
    const amount = parseFloat(amountStr);

    if (status === "completed") {
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
