import { NextRequest, NextResponse } from "next/server";
import { getUserDataFromInitData } from "@/lib/auth";
import prisma from "@/prisma/prismaConf";
import crypto from "crypto";

const COINPAL_SECRET_KEY = process.env.COINPAL_SECRET_KEY;
const COINPAL_API_URL = "https://pay.coinpal.io/gateway/pay/checkout";
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
      return NextResponse.json({ error: "Invalid user data" }, { status: 401 });
    }

    const { amount } = await req.json();
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }


    const orderNo = `user_${userData.id}_${amount}_${Date.now()}`;
    const orderCurrency = "USD"; // Or any other currency
    const notifyURL = `${process.env.NEXT_PUBLIC_URL}/api/coinpal/webhook`;
    const redirectURL = `${process.env.NEXT_PUBLIC_URL}/wallet`;

    const signString =
      COINPAL_SECRET_KEY +
      MERCHANT_NO +
      orderNo +
      String(amount) + // Ensure amount is a string for signature
      orderCurrency;
    const sign = crypto.createHash("sha256").update(signString).digest("hex");

    const formData = new URLSearchParams();
    formData.append("version", "2");
    formData.append("merchantNo", MERCHANT_NO);
    formData.append("orderNo", orderNo);
    formData.append("orderCurrencyType", "fiat");
    formData.append("orderCurrency", orderCurrency);
    formData.append("orderAmount", String(amount));
    formData.append("notifyURL", notifyURL);
    formData.append("redirectURL", redirectURL);
    formData.append(
      "orderDescription",
      `Deposit of ${amount} for user ${userData.id}`
    );
    formData.append("sign", sign);

    const response = await fetch(COINPAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      redirect: "manual", // Important to handle redirects manually
    });

    if (response.status >= 300 && response.status < 400 && response.headers.has("location")) {
      return NextResponse.json({ paymentUrl: response.headers.get("location") });
    }
    
    const responseText = await response.text();

    if (response.ok) {
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.nextStepContent) {
          return NextResponse.json({ paymentUrl: jsonResponse.nextStepContent });
        } else if (jsonResponse.checkoutUrl) {
          return NextResponse.json({ paymentUrl: jsonResponse.checkoutUrl });
        } else if (jsonResponse.url) {
          return NextResponse.json({ paymentUrl: jsonResponse.url });
        }
      } catch (error) {
        // Not a JSON response, but it was a 2xx response.
        // It might be a redirect URL in the body
        if (response.url) {
            return NextResponse.json({ paymentUrl: response.url });
        }
      }
    }

    // If response is not ok, log the error and send a more informative error
    console.error("CoinPal API Error:", responseText);
    return NextResponse.json(
      { error: "Failed to create payment", details: responseText },
      { status: response.status }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
