import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "";

const PATHS = ["", "/products", "/about", "/contact", "/my-orders"];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE) return [];
  return PATHS.map((p) => ({
    url: `${SITE}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "/products" ? "weekly" : "monthly",
    priority: p === "" ? 1 : p === "/products" ? 0.8 : 0.5,
  }));
}
