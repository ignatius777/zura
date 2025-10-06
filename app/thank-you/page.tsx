import React, { Suspense } from "react";
import PaymentStatusChecker from "./PaymentStatusChecker";

export default function ThankYouPage() {
  return (
    <Suspense fallback={<p className="text-center mt-12">Loading payment status...</p>}>
      <PaymentStatusChecker />
    </Suspense>
  );
}
