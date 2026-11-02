import { products } from "./data/products";
import type { CartItem } from "./types";

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, category: string, limit = 3) {
  const rest = products.filter((p) => p.slug !== slug && p.category === category);
  if (rest.length >= limit) return rest.slice(0, limit);
  const others = products.filter((p) => p.slug !== slug && p.category !== category);
  return [...rest, ...others].slice(0, limit);
}

export function lineTotal(product: NonNullable<ReturnType<typeof getProduct>>, qty: number) {
  return product.price * qty;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const product = getProduct(item.slug);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}
