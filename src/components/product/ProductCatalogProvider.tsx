"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Category, Product } from "@/lib/types";
import { fetchProducts } from "@/lib/services/products";
import { products as staticProducts } from "@/lib/data/products";

interface CatalogContextValue {
  products: Product[];
  loading: boolean;
  getProduct: (slug: string) => Product | undefined;
  getRelatedProducts: (slug: string, category: Category, limit?: number) => Product[];
  reload: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(staticProducts);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const fetched = await fetchProducts();
      setProducts(fetched.length ? fetched : staticProducts);
    } catch {
      // keep whatever we have
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const bySlug = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of products) map.set(p.slug, p);
    return map;
  }, [products]);

  const getProduct = useCallback((slug: string) => bySlug.get(slug), [bySlug]);

  const getRelatedProducts = useCallback(
    (slug: string, category: Category, limit = 3) => {
      const rest = products.filter((p) => p.slug !== slug && p.category === category);
      if (rest.length >= limit) return rest.slice(0, limit);
      const others = products.filter((p) => p.slug !== slug && p.category !== category);
      return [...rest, ...others].slice(0, limit);
    },
    [products],
  );

  const value = useMemo(
    () => ({ products, loading, getProduct, getRelatedProducts, reload }),
    [products, loading, getProduct, getRelatedProducts, reload],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useProductCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useProductCatalog must be used within ProductCatalogProvider");
  return ctx;
}
