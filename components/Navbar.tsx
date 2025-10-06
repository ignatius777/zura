"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext"; // ✅ import cart context

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { cart } = useCart(); // ✅ get cart from context
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0); // ✅ sum quantities

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About Us" },
  ];

  return (
    <nav className="bg-[#030712] text-white shadow-md sticky top-0 z-50 border-b border-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            className="p-2 rounded hover:bg-gray-800"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 md:static">
          <Link href="/">
            <Image
              src="/zura_logo_white.svg"
              alt="Zura Logo"
              width={60}
              height={40}
              priority
            />
          </Link>
        </div>

        {/* Cart Icon (Mobile) */}
        <div className="md:hidden relative">
          <Link href="/cart" className="flex items-center gap-1 hover:text-yellow-400">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-8">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`hover:text-yellow-400 transition ${
                    active ? "font-semibold text-yellow-400" : ""
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          {/* Cart on desktop */}
          <li className="relative">
            <Link
              href="/cart"
              className={`flex items-center gap-1 hover:text-yellow-400 transition ${
                pathname === "/cart" ? "font-semibold text-yellow-400" : ""
              }`}
            >
              <ShoppingCart size={18} /> Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-yellow-400 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile Menu Links */}
      {open && (
        <div className="md:hidden bg-gray-800 px-6 py-4 space-y-4">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`block hover:text-yellow-400 transition ${
                  active ? "font-semibold text-yellow-400" : ""
                }`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
