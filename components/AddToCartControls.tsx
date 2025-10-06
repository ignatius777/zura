"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

type AddToCartControlsProps = {
  productId: number;
  name: string;
  price: number;
  image?: string; // optional image URL
};

export default function AddToCartControls({
  productId,
  name,
  price,
  image,
}: AddToCartControlsProps) {
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  const handleAddToCart = () => {
    addToCart({ id: productId, name, price, quantity, image }); // ✅ still adds correctly

    // Show notification
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000); // auto-hide after 2s
  };

  const cartHasItems = cart && cart.length > 0; // ✅ safe check

  return (
    <div className="flex flex-col gap-4 mt-6 relative">
      {/* Quantity Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-1 bg-red-400 rounded"
        >
          -
        </button>
        <span className="text-lg">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="px-3 py-1 bg-green-400 rounded"
        >
          +
        </button>
      </div>

      {/* Add + View Cart Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700"
        >
          Add to Cart
        </button>

        <Link
          href="/cart"
          className={`px-6 py-3 rounded-lg font-bold shadow ${
            cartHasItems
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          aria-disabled={!cartHasItems}
        >
          View Cart
        </Link>
      </div>

      {/* ✅ Toast Notification */}
      {showToast && (
        <div className="absolute top-0 right-0 bg-black text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          ✅ {name} added to cart!
        </div>
      )}
    </div>
  );
}
