"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PaymentStatus = "pending" | "completed" | "failed";

interface CheckOrderResponse {
  status: PaymentStatus;
  message?: string;
}

export default function PaymentStatusChecker() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutRequestId = searchParams.get("checkoutRequestId");

  const [status, setStatus] = useState<PaymentStatus>("pending");
  const [message, setMessage] = useState("Checking payment status...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkoutRequestId) {
      setStatus("failed");
      setMessage("❌ Missing checkoutRequestId.");
      setLoading(false);
      return;
    }

    const checkPayment = async () => {
      try {
        const res = await fetch(
          `/api/check-order?checkoutRequestId=${checkoutRequestId}`
        );
        const data: CheckOrderResponse = await res.json();

        if (data.status === "completed") {
          setStatus("completed");
          setMessage("✅ Payment successful!");
          setLoading(false);
          return true;
        } else if (data.status === "failed") {
          setStatus("failed");
          setMessage("❌ Payment failed or cancelled.");
          setLoading(false);
          return true;
        } else {
          setStatus("pending");
          setMessage("⏳ Payment is still pending. Please complete on your phone.");
          return false;
        }
      } catch (error: unknown) {
        console.error("Error checking payment:", error);
        setMessage("⚠️ Unable to check payment status. Retrying...");
        return false;
      }
    };

    // initial check immediately
    let stopped = false;

    const interval = setInterval(async () => {
      if (stopped) return;
      const done = await checkPayment();
      if (done) clearInterval(interval);
    }, 3000);

    // first check immediately without waiting 3s
    //checkPayment();

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [checkoutRequestId]);

  return (
    <div className="max-w-2xl mx-auto p-8 mt-12 bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-xl text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-6xl">
          {status === "completed" ? "✅" : status === "failed" ? "❌" : "💳"}
        </div>

        <h1 className="text-4xl font-extrabold text-gray-800">
          {status === "completed" ? "Thank You!" : "Payment Status"}
        </h1>

        <p className="text-lg text-gray-700 max-w-md">{message}</p>

        {loading && status === "pending" && (
          <div className="mt-4 animate-spin text-green-500 text-3xl">⏳</div>
        )}

        {status === "completed" && (
          <button
            className="mt-6 px-8 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
            onClick={() => router.push("/")}
          >
            Continue Shopping
          </button>
        )}

        {status === "failed" && (
          <button
            className="mt-6 px-8 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-md hover:bg-red-700 transition-all duration-200 transform hover:scale-105"
            onClick={() => router.push("/checkout")}
          >
            Retry Payment
          </button>
        )}
      </div>
    </div>
  );
}
