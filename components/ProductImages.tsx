// components/ProductImages.tsx
"use client";

import { useState } from "react";

type Props = {
  images: { src: string }[];
  name: string;
};

export default function ProductImages({ images, name }: Props) {
  const [mainImage, setMainImage] = useState(images[0]?.src || "/placeholder.png");

  return (
    <div>
      {/* Main image with zoom effect */}
      <div className="overflow-hidden rounded-lg border">
        <img
          src={mainImage}
          alt={name}
          className="w-full h-[450px] object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 mt-4">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.src}
              alt={`${name} ${idx + 1}`}
              onClick={() => setMainImage(img.src)} // ✅ Switch on click
              className={`w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 ${
                img.src === mainImage ? "ring-2 ring-blue-500" : ""
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
