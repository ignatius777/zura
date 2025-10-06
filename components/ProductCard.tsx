"use client";

import Link from "next/link";

type ProductCardProps = {
  id: number;
  name: string;
  price: string;
  image?: string;
};

export default function ProductCard({ id, name, price, image }: ProductCardProps) {
  return (
    <div className="border rounded-xl p-4 shadow hover:shadow-lg transition">
      {image && (
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      )}
      <h2 className="text-lg font-semibold">{name}</h2>
      <p className="text-gray-600 mb-3">KES {price}</p>

      <Link
        href={`/products/${id}`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        View Details
      </Link>
    </div>
  );
}
