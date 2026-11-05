import type { MetadataRoute } from "next";
import {
  getSupabaseServer,
  isSupabaseServerConfigured,
} from "@/lib/services/supabase-server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "";

// Static routes that should be explicitly listed.
const STATIC_PATHS: { path: string; priority: number; freq: "weekly" | "monthly" }[] = [
  { path: "", priority: 1, freq: "monthly" },
  { path: "/products", priority: 0.8, freq: "weekly" },
  { path: "/about", priority: 0.5, freq: "monthly" },
  { path: "/process", priority: 0.5, freq: "monthly" },
  { path: "/contact", priority: 0.5, freq: "monthly" },
  { path: "/my-orders", priority: 0.3, freq: "monthly" },
  { path: "/cookie-policy", priority: 0.2, freq: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!SITE) return [];

  const urls: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority, freq }) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));

  // Product pages are DB-driven (admin-managed), so pull live slugs from
  // Supabase rather than a hardcoded list. Falls back to the static catalog
  // if the server client isn't configured.
  if (isSupabaseServerConfigured()) {
    try {
      const { data } = await getSupabaseServer()
        .from("ecobrew_products")
        .select("slug");
      if (data) {
        for (const row of data) {
          urls.push({
            url: `${SITE}/products/${row.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      }
    } catch (err) {
      console.warn("sitemap: could not fetch product slugs, using static catalog.", err);
    }
  }

  return urls;
}
