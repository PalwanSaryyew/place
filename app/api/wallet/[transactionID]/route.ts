// Trigger recompilation
import { NextRequest, NextResponse } from "next/server";
import { getUserDataFromInitData } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ transactionID: string }> }
) {
  try {
    const { transactionID } = await context.params;
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

    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionID,
        userId: userData.id.toString(),
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: transaction.status });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching transaction status:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}