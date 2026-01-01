"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useWebApp } from "@/context/WebAppContext";

const TransactionStatusPage = ({
  params,
}: {
  params: { transactionID: string };
}) => {
  const [status, setStatus] = useState("PENDING");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { initData } = useWebApp();

  useEffect(() => {
    if (!initData) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `/api/wallet/${params.transactionID}`,
          {
            headers: {
              initData: initData,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch transaction status");
        }

        const data = await response.json();
        setStatus(data.status);
        if (data.status === "COMPLETED" || data.status === "FAILED") {
          clearInterval(interval);
        }
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Unknown error");
        clearInterval(interval);
      }
    };

    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [params.transactionID, initData]);

  const handleGoBack = () => {
    router.push("/wallet");
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>
            Please wait while we process your payment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-500">{error}</div>}
          {status === "PENDING" && <div>Payment Pending...</div>}
          {status === "COMPLETED" && (
            <div>
              <div>Payment Successful!</div>
              <Button onClick={handleGoBack} className="mt-4">
                Go back to Wallet
              </Button>
            </div>
          )}
          {status === "FAILED" && (
            <div>
              <div>Payment Failed. Please try again.</div>
              <Button onClick={handleGoBack} className="mt-4">
                Go back to Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionStatusPage;
