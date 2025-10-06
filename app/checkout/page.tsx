"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface STKPushResponse {
  checkoutRequestId: string;
  customerMessage?: string;
  error?: string;
}

interface PollResponse {
  status: "pending" | "completed" | "failed";
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed" | "failed" | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string>("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatPhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("07")) cleaned = "254" + cleaned.slice(1);
    else if (cleaned.startsWith("7")) cleaned = "254" + cleaned;
    return cleaned;
  };

  // Poll payment status until it completes or fails
  const pollPaymentStatus = async (checkoutRequestId: string) => {
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/check-order?checkoutRequestId=${checkoutRequestId}`);
          const data: PollResponse = await res.json();

          if (data.status === "completed") {
            clearInterval(interval);
            setPaymentStatus("completed");
            setPaymentMessage("✅ Payment successful!");
            resolve();
          } else if (data.status === "failed") {
            clearInterval(interval);
            setPaymentStatus("failed");
            setPaymentMessage("❌ Payment failed or cancelled.");
            reject(new Error("Payment failed"));
          } else {
            // still pending → keep polling
            setPaymentStatus("pending");
            setPaymentMessage("⏳ Payment is still pending. Complete on your phone.");
          }
        } catch (err) {
          console.error("Error polling payment:", err);
          clearInterval(interval);
          setPaymentStatus("failed");
          setPaymentMessage("⚠️ Error checking payment status");
          reject(err);
        }
      }, 3000);
    });
  };

  const createOrder = async () => {
    const orderData = {
      payment_method: "mpesa",
      payment_method_title: "M-Pesa STK Push",
      set_paid: true,
      billing: {
        first_name: form.name,
        email: form.email,
        phone: form.phone,
        address_1: form.address,
      },
      line_items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Failed to create order");
    return data;
  };

  const handlePlaceOrder = async () => {
    if (!form.name || !form.email || !form.phone || !form.address) {
      alert("Please fill all fields");
      return;
    }

    const formattedPhone = formatPhoneNumber(form.phone);
    if (!/^2547\d{8}$/.test(formattedPhone)) {
      alert("❌ Please enter a valid Safaricom number (e.g. 07XXXXXXXX)");
      return;
    }

    setLoading(true);
    setPaymentStatus("pending");
    setPaymentMessage("⏳ Initiating payment...");

    try {
      // Call STK Push API
      const res = await fetch("/api/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: Date.now(),
          name: form.name,
          email: form.email,
          phone: formattedPhone,
          address: form.address,
          cart: cart.map((item) => ({
            product_id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          amount: total,
        }),
      });

      const data: STKPushResponse = await res.json();

      if (!res.ok || !data.checkoutRequestId) {
        throw new Error(data.error || "STK Push failed ❌");
      }

      setPaymentMessage(data.customerMessage || "✅ STK Push sent! Enter your PIN.");

      // Poll for payment
      await pollPaymentStatus(data.checkoutRequestId);

      // After successful payment → create WooCommerce order
      const order = await createOrder();
      console.log("WooCommerce order created:", order);

      clearCart();
      setForm({ name: "", email: "", phone: "", address: "" });
      router.push(`/thank-you?order=${order.id}&checkoutRequestId=${data.checkoutRequestId}`);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) setPaymentMessage(err.message);
      else setPaymentMessage("Payment failed ❌");
      setPaymentStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8 text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Cart Summary */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            <ul className="divide-y divide-gray-300">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between py-2 items-center">
                  <div className="flex items-center space-x-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded border border-gray-300"
                      />
                    )}
                    <span className="text-gray-800 font-medium">
                      {item.name} x {item.quantity}
                    </span>
                  </div>
                  <span className="text-gray-800 font-semibold">
                    KES {item.price * item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-right font-bold mt-4 text-gray-900 text-lg">
            Total: KES {total}
          </p>
        </div>

        {/* Checkout Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Billing Details</h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <textarea
              placeholder="Address"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || loading}
            className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:text-gray-700"
          >
            {loading ? "Processing..." : `Pay KES ${total} via M-Pesa`}
          </button>

          {paymentMessage && (
            <p className="mt-4 text-center font-medium text-gray-800">{paymentMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
