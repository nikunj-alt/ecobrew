import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private/order surfaces shouldn't be crawled.
      disallow: ["/admin", "/checkout", "/api/", "/auth/"],
    },
    ...(SITE ? { sitemap: `${SITE}/sitemap.xml` } : {}),
  };
}
