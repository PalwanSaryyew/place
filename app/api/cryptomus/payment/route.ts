import { NextRequest, NextResponse } from "next/server";
import { getUserDataFromInitData } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;

export async function POST(req: NextRequest) {
  try {
    if (!NEXT_PUBLIC_URL) {
      throw new Error("NEXT_PUBLIC_URL is not set");
    }

    const initData = req.headers.get("initData");
    if (!initData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = getUserDataFromInitData(initData);
    if (!userData) {
      return NextResponse.json(
        { error: "Invalid user data" },
        { status: 401 }
      );
    }

    const { amount, status } = await req.json();
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type: "DEPOSIT",
        status: "PENDING",
        userId: userData.id.toString(),
      },
    });

    // Simulate payment URL generation
    const mockPaymentUrl = `${NEXT_PUBLIC_URL}/wallet/${
      transaction.id
    }?status=${status || "success"}`;

    return NextResponse.json({
      paymentUrl: mockPaymentUrl,
      transactionId: transaction.id,
    });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}