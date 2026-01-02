import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserDataFromInitData } from "@/lib/auth";

type RouteContext = {
   params: Promise<{
      transactionID: string;
   }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
   try {
      const { params } = context;
      const { transactionID } = await params;
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
         where: { id: parseInt(transactionID) },
      });

      if (!transaction || transaction.userId !== userData.id.toString()) {
         return NextResponse.json(
            { error: "Transaction not found" },
            { status: 404 }
         );
      }

      if (transaction.status === "COMPLETED") {
         return NextResponse.json({ status: "ok" });
      }

      await prisma.$transaction(async (tx) => {
         await tx.transaction.update({
            where: { id: parseInt(transactionID) },
            data: { status: "COMPLETED" },
         });

         await tx.user.update({
            where: { id: userData.id.toString() },
            data: { balance: { increment: transaction.amount } },
         });
      });

      return NextResponse.json({ status: "ok" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
   } catch (error: any) {
      console.error("Error completing transaction:", error);
      return NextResponse.json(
         { error: "Internal Server Error", message: error.message },
         { status: 500 }
      );
   }
}
