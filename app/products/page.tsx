// app/products/page.tsx
import { getProducts } from "@/lib/woocommerce";
import ProductCard from "@/components/ProductCard";

// ✅ WooCommerce product type
type Product = {
  id: number;
  name: string;
  price: string | number;
  images?: { src: string }[];
};

// ✅ Ensure Next.js fetches fresh product data
export const dynamic = "force-dynamic"; 
// OR use ISR instead: export const revalidate = 60;

export default async function ProductsPage() {
  let products: Product[] = [];

  try {
    products = await getProducts();
  } catch (err) {
    console.error("❌ Error fetching products:", err);
  }

  if (!products?.length) {
    return <p className="text-center mt-10">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {products.map((product) => {
        const price =
          typeof product.price === "string"
            ? product.price
            : product.price?.toString() || "0";
        const image = product.images?.[0]?.src || "/placeholder.png";

        return (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={price}
            image={image}
          />
        );
      })}
    </div>
  );
}
