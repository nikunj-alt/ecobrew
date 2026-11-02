import { supabase, isSupabaseConfigured } from "../supabase";
import type { Category, Product } from "../types";
import { products as staticProducts } from "../data/products";

function mapRow(row: any): Product {
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
    related: Array.isArray(row.related) ? row.related : [],
  };
}

/** Load the catalog: Supabase first, static data as fallback. */
export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return staticProducts;
  try {
    const { data, error } = await (supabase as any)
      .from("ecobrew_products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.warn("Failed to fetch products from Supabase, using static catalog:", error.message);
      return staticProducts;
    }
    if (data && data.length > 0) return data.map(mapRow);
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
    const { error } = await (supabase as any).from("ecobrew_products").upsert([
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
    const { error } = await (supabase as any).from("ecobrew_products").delete().eq("slug", slug);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}
