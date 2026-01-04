import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNo, orderStatus } = body;

    if (!orderNo || !orderStatus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: orderNo },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status === "COMPLETED") {
      return NextResponse.json({
        message: "Transaction already completed",
        transaction,
      });
    }

    if (orderStatus === "completed" || orderStatus === "success") {
      await prisma.transaction.update({
        where: { id: orderNo },
        data: { status: "COMPLETED" },
      });
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { balance: { increment: transaction.amount } },
      });
    } else if (orderStatus === "failed" || orderStatus === "expired") {
      await prisma.transaction.update({
        where: { id: orderNo },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}