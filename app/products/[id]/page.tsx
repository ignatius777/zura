// app/products/[id]/page.tsx
import { getProduct, getProducts } from "@/lib/woocommerce";
import AddToCartControls from "@/components/AddToCartControls";
import ProductImages from "@/components/ProductImages"; // ✅ new client component

// ✅ WooCommerce product type
type WooProductExtended = {
  id: number;
  name: string;
  price: string | number;
  images?: { src: string }[];
  short_description?: string;
  description?: string;
};

// ✅ Generate static params for SSG
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const products = await getProducts();
    return products.map((product) => ({ id: product.id.toString() }));
  } catch (err) {
    console.error("❌ Failed to generate params:", err);
    return [];
  }
}

// ✅ Ensure data is fresh on Vercel (dynamic fetch or ISR)
export const dynamic = "force-dynamic"; 

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  let product: WooProductExtended | null = null;

  try {
    product = await getProduct(Number(params.id));
  } catch (err) {
    console.error("❌ Failed to fetch product:", err);
  }

  if (!product) {
    return (
      <p className="text-center mt-10 text-red-500">
        Product not found or WooCommerce API unreachable.
      </p>
    );
  }

  const price =
    typeof product.price === "string"
      ? product.price
      : product.price?.toString() || "0";

  const images = product.images || [];
  const mainImage = images[0]?.src || "/placeholder.png";

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* ✅ Left: Images (interactive client component) */}
      <ProductImages images={images} name={product.name} />

      {/* ✅ Right: Details */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
        <p className="text-xl text-gray-700 mb-4">KES {price}</p>

        {product.short_description && (
          <div
            className="prose mb-6"
            dangerouslySetInnerHTML={{ __html: product.short_description }}
          />
        )}

        {product.description && (
          <div
            className="prose mb-6"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        {/* Add to Cart */}
        <AddToCartControls
          productId={product.id}
          name={product.name}
          price={Number(price)}
          image={mainImage}
        />
      </div>
    </div>
  );
}
