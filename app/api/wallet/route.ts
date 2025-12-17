import { NextRequest, NextResponse } from "next/server";
import { getUserDataFromInitData } from "@/lib/auth";
import prisma from "@/prisma/prismaConf";

export async function GET(req: NextRequest) {
  try {
    const initData = req.headers.get("initData");
    if (!initData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = getUserDataFromInitData(initData);
    if (!userData) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id: String(userData.id) },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: String(userData.id) },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalTransactions = await prisma.transaction.count({
      where: { userId: String(userData.id) },
    });

    return NextResponse.json({
      balance: user.balance,
      transactions,
      totalTransactions,
    });
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
