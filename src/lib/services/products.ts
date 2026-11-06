import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../supabase";
import type { Category, Product } from "../types";
import type { ProductRow } from "../supabase-types";
import { products as staticProducts } from "../data/products";

const db = supabase as SupabaseClient;

export function mapProductRow(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category as Category,
    price: Number(row.price),
    shortDescription: row.short_description || "",
    description: row.description || "",
    image: row.image || "",
    impact: row.impact || undefined,
    inStock: row.in_stock !== false,
    featured: row.featured === true,
    related: (Array.isArray(row.related) ? row.related : []).filter(
      (x): x is string => typeof x === "string",
    ),
  };
}

/** Load the catalog: Supabase first, static data as fallback. */
export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return staticProducts;
  try {
    const { data, error } = await db
      .from("ecobrew_products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.warn("Failed to fetch products from Supabase, using static catalog:", error.message);
      return staticProducts;
    }
    if (data && data.length > 0) return data.map(mapProductRow);
    return staticProducts;
  } catch (e) {
    console.warn("Failed to fetch products, using static catalog:", e);
    return staticProducts;
  }
}

/** Create or update a product (admin). */
export async function upsertProduct(
  product: Partial<Product> & { slug: string },
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }
  try {
    const { error } = await db.from("ecobrew_products").upsert([
      {
        slug: product.slug,
        name: product.name ?? "",
        category: product.category ?? "decor",
        price: Number(product.price ?? 0),
        short_description: product.shortDescription ?? "",
        description: product.description ?? "",
        image: product.image ?? "/logo.png",
        impact: product.impact ?? "",
        in_stock: product.inStock ?? true,
        featured: product.featured ?? false,
        related: product.related ?? [],
      },
    ]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/** Delete a product (admin). */
export async function deleteProduct(
  slug: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }
  try {
    const { error } = await db.from("ecobrew_products").delete().eq("slug", slug);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/** Flip only the stock flag of a product (admin quick action). */
export async function setProductStock(
  slug: string,
  inStock: boolean,
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }
  try {
    const { error } = await db
      .from("ecobrew_products")
      .update({ in_stock: inStock })
      .eq("slug", slug);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // matches the storage bucket limit
// SVG excluded: it can embed scripts and uploaded images render site-side.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

/** Upload an image to the public product-images bucket (admin). */
export async function uploadProductImage(
  slug: string,
  file: File,
): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { error: "Only PNG, JPEG, WebP or GIF images are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Image must be 5 MB or smaller." };
  }
  try {
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${slug.replace(/[^a-z0-9-]/gi, "_")}/${Date.now()}.${ext}`;
    const { error } = await db.storage
      .from("product-images")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) return { error: error.message };
    const { data } = db.storage.from("product-images").getPublicUrl(path);
    return { url: data?.publicUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed." };
  }
}
