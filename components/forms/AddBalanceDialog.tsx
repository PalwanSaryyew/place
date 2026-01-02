"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useWebApp } from "@/context/WebAppContext";
import { useRouter } from "next/navigation";

export function AddBalanceDialog() {
  const t = useTranslations("wallet");
  const { initData, webApp } = useWebApp();
  const router = useRouter();
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const commission = 1; // 1%

  const totalAmount = useMemo(() => {
    return amount + (amount * commission) / 100;
  }, [amount]);

  const handlePayment = async (status: "success" | "fail") => {
    if (!initData) {
      setError("Telegram user data not available. Please try again later.");
      return;
    }

    if (amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cryptomus/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          initData: initData,
        },
        body: JSON.stringify({ amount: amount, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment");
      }

      if (data.paymentUrl) {
        webApp?.openLink(data.paymentUrl);
      } else {
        throw new Error("Payment URL not found in response.");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Error adding balance:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t("add_balance")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("add_balance")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              {t("amount")}
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("commission")}</Label>
            <div className="col-span-3">{commission}%</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("total_amount")}</Label>
            <div className="col-span-3">{totalAmount} USDT</div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => handlePayment("success")}
            disabled={loading}
            variant="success"
          >
            {loading ? "Processing..." : t("pay_success")}
          </Button>
          <Button
            onClick={() => handlePayment("fail")}
            disabled={loading}
            variant="destructive"
          >
            {loading ? "Processing..." : t("pay_fail")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}