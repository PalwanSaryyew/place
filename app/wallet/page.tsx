"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWebApp } from "@/context/WebAppContext";
import { Transaction } from "@/lib/generated/prisma/client";
import { useEffect, useState } from "react";

const WalletPage = () => {
  const { initData } = useWebApp();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingBalance, setIsAddingBalance] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchWalletData = async (page: number) => {
    try {
      const response = await fetch(`/api/wallet?page=${page}&limit=10`, {
        headers: {
          initData: initData!,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wallet data");
      }

      const data = await response.json();
      setBalance(data.balance);
      setTransactions((prev) => [...prev, ...data.transactions]);
      setHasMore(data.transactions.length > 0);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initData) {
      fetchWalletData(page);
    }
  }, [initData, page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleAddBalance = async () => {
    if (!initData) {
      alert("Telegram user data not available. Please try again later.");
      return;
    }

    setIsAddingBalance(true);
    try {
      const response = await fetch("/api/coinpal/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          initData: initData,
        },
        body: JSON.stringify({ amount: 10 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment");
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error("Payment URL not found in response.");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      console.error("Error adding balance:", errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsAddingBalance(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>
              View your balance and transaction history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
            <CardDescription>
              View your balance and transaction history.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>
            View your balance and transaction history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              Balance: ${balance.toFixed(2)}
            </div>
            <Button onClick={handleAddBalance} disabled={isAddingBalance}>
              {isAddingBalance ? "Adding..." : "Add Balance"}
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Transaction History</h3>
            <ul className="space-y-2">
              {transactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{transaction.type}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      transaction.amount > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}$
                    {transaction.amount.toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
            <Button onClick={loadMore} disabled={!hasMore || loading}>
              {loading ? "Loading..." : "Load More"}
            </Button>
          
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
};

export default WalletPage;
