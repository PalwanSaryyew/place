import { NextRequest, NextResponse } from "next/server";
import { getUserDataFromInitData } from "@/lib/auth";
import coinpal from "coinpal-sdk";
const { CoinPal } = coinpal;
const COINPAL_SECRET_KEY = process.env.COINPAL_SECRET_KEY;
const MERCHANT_NO = process.env.COINPAL_MERCHANT_NO;
const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;

export async function POST(req: NextRequest) {
   try {
      if (!COINPAL_SECRET_KEY) {
         throw new Error("COINPAL_SECRET_KEY is not set");
      }
      if (!MERCHANT_NO) {
         throw new Error("COINPAL_MERCHANT_NO is not set");
      }
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

      const { amount } = await req.json();
      if (!amount || typeof amount !== "number" || amount <= 0) {
         return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      const coinpal = new CoinPal({
         merchantNo: MERCHANT_NO,
         secret: COINPAL_SECRET_KEY,
      });

      const orderNo = `user_${userData.id}_${amount}_${Date.now()}`;
      const orderCurrency = "USD";
      const notifyURL = `${process.env.NEXT_PUBLIC_URL}/api/coinpal/webhook`;
      const redirectURL = `${process.env.NEXT_PUBLIC_URL}/wallet`;

      const paymentData = {
         orderNo,
         orderCurrency,
         orderAmount: String(amount),
         notifyURL,
         redirectURL,
         orderDescription: `Deposit of ${amount} for user ${userData.id}`,
      };

      const paymentResponse = await coinpal.createPayment(paymentData);

      if (paymentResponse && paymentResponse.checkoutUrl) {
         return NextResponse.json({ paymentUrl: paymentResponse.checkoutUrl });
      } else {
         console.error("CoinPal SDK response error:", paymentResponse);
         return NextResponse.json(
            {
               error: "Payment URL not found in CoinPal response",
               details: paymentResponse,
            },
            { status: 500 }
         );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
   } catch (error: any) {
      console.error("Error creating payment:", error);
      return NextResponse.json(
         { error: "Internal Server Error", message: error.message },
         { status: 500 }
      );
   }
}
