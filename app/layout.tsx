import "./globals.css";
import Navbar from "../components/Navbar";
import { CartProvider } from "@/context/CartContext";
import Footer from "@/components/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: "Zura E-commerce",
  description: "Built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
    <html lang="en">
      <body className="bg-gray-950">
        <SpeedInsights />
        <CartProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto p-6">{children}</main>
        </CartProvider>
        <Footer/>
      </body>
      
    </html>
    </>
    
  );
}
