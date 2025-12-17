import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prismaConf";

export async function POST(req: NextRequest) {
  try {
    // In a real application, you should validate the webhook signature here.
    const { transactionId, status } = await req.json();

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: "Missing transactionId or status" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (status === "completed") {
      // Update user's balance and transaction
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            balance: {
              increment: transaction.amount,
            },
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
