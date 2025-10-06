"use client";

import Link from "next/link";
import Image from "next/image"; // ✅ import Next.js Image
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-gray-600">Start shopping to add items here!</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

      <ul className="divide-y divide-gray-200 border rounded-lg">
        {cart.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-4"
          >
            {/* Image + Details */}
            <div className="flex items-center space-x-4">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}  // ✅ required for Next.js
                  height={64} // ✅ required for Next.js
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-600">
                  {item.quantity} × KES {item.price}
                </p>
              </div>
            </div>

            <button
              onClick={() => removeFromCart(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center mt-6">
        <h2 className="text-xl font-bold">Total: KES {total.toFixed(2)}</h2>
        <div className="space-x-4">
          <button
            onClick={clearCart}
            className="px-4 py-2 text-pink-600 rounded hover:bg-gray-300"
          >
            Clear Cart
          </button>
          <Link
            href="/checkout"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
