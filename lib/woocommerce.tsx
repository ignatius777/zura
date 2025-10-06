// lib/woocommerce.ts
import axios, { AxiosError } from "axios";

//
// 🔹 Types
//
export interface WooImage {
  id: number;
  src: string;
  alt?: string;
}

export interface WooProduct {
  id: number;
  name: string;
  price: string;
  images?: WooImage[];
}

export interface WooCartItem {
  key: string;
  id: number;
  name: string;
  quantity: number;
  totals: {
    line_total: string;
  };
}

export interface WooCart {
  items: WooCartItem[];
  items_count: number;
  items_weight: number;
  needs_payment: boolean;
  needs_shipping: boolean;
  total_items: string;
  total_price: string;
}

// Ensure URL has no trailing slash
const storeUrl = process.env.WOOCOMMERCE_STORE_URL?.replace(/\/$/, "");

if (!storeUrl) {
  throw new Error("❌ Missing WOOCOMMERCE_STORE_URL in .env.local");
}

const api = axios.create({
  baseURL: `${storeUrl}/wp-json/wc/v3`,
  auth: {
    username: process.env.WOOCOMMERCE_CONSUMER_KEY || "",
    password: process.env.WOOCOMMERCE_CONSUMER_SECRET || "",
  },
});

//
// 📦 PRODUCTS
//

// Fetch all products
export async function getProducts(): Promise<WooProduct[]> {
  try {
    const res = await api.get<WooProduct[]>("/products", {
      params: { per_page: 20 },
    });
    return res.data;
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(
      "❌ WooCommerce API error [getProducts]:",
      error.response?.data || error.message || error
    );
    return [];
  }
}

// Fetch a single product by ID
export async function getProduct(
  id: string | number
): Promise<WooProduct | null> {
  try {
    const res = await api.get<WooProduct>(`/products/${id}`);
    return res.data;
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(
      `❌ WooCommerce API error [getProduct ${id}]:`,
      error.response?.data || error.message || error
    );
    return null;
  }
}

//
// 🛒 CART (using WooCommerce Store API v1)
//

const storeApi = axios.create({
  baseURL: `${storeUrl}/wp-json/wc/store/v1`,
  withCredentials: true, // needed for cart session
});

// Get cart contents
export async function getCart(): Promise<WooCart | null> {
  try {
    const res = await storeApi.get<WooCart>("/cart");
    return res.data;
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(
      "❌ WooCommerce Store API error [getCart]:",
      error.response?.data || error.message || error
    );
    return null;
  }
}

// Add product to cart
export async function addToCart(
  productId: number,
  quantity: number = 1
): Promise<WooCart | null> {
  try {
    const res = await storeApi.post<WooCart>("/cart/add-item", {
      id: productId,
      quantity,
    });
    return res.data;
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(
      `❌ WooCommerce Store API error [addToCart ${productId}]:`,
      error.response?.data || error.message || error
    );
    return null;
  }
}

// Update quantity of a cart item
export async function updateCartItem(
  itemKey: string,
  quantity: number
): Promise<WooCart | null> {
  try {
    const res = await storeApi.post<WooCart>("/cart/update-item", {
      key: itemKey,
      quantity,
    });
    return res.data;
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(
      `❌ WooCommerce Store API error [updateCartItem ${itemKey}]:`,
      error.response?.data || error.message || error
    );
    return null;
  }
}

// Remove item from cart
export async function removeCartItem(itemKey: string): Promise<WooCart | null> {
  try {
    const res = await storeApi.post<WooCart>("/cart/remove-item", { key: itemKey });
    return res.data;
  } catch (err: unknown) {
    const error = err as AxiosError;
    console.error(
      `❌ WooCommerce Store API error [removeCartItem ${itemKey}]:`,
      error.response?.data || error.message || error
    );
    return null;
  }
}
