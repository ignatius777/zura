import { getProducts } from "../lib/woocommerce";

// ✅ Define a Product type
type Product = {
  id: number;
  name: string;
  price: string;
  images?: { src: string }[];
};

export default async function ProductList() {
  // ✅ Tell TS that products is Product[]
  const products: Product[] = await getProducts();

  if (!products.length) {
    return <p className="text-center mt-6">No products found</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg shadow p-4">
          <div className="relative w-full h-48 mb-4">
            <img
              src={product.images?.[0]?.src || "/placeholder.png"}
              alt={product.name}
              className="rounded-md object-cover w-full h-full"
            />
          </div>
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-gray-600">KSh {product.price}</p>
        </div>
      ))}
    </div>
  );
}
