"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { SupabaseClient, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Category, Product } from "@/lib/types";
import type { ProductRow } from "@/lib/supabase-types";
import { fetchProducts, mapProductRow } from "@/lib/services/products";
import { products as staticProducts } from "@/lib/data/products";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
  const loadedFromDb = useRef(false);

  const reload = useCallback(async () => {
    try {
      const fetched = await fetchProducts();
      loadedFromDb.current = fetched.length > 0;
      setProducts(fetched.length ? fetched : staticProducts);
    } catch {
      // keep whatever we have
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const fetched = await fetchProducts();
        loadedFromDb.current = fetched.length > 0;
        if (!alive) return;
        setProducts(fetched.length ? fetched : staticProducts);
      } catch {
        // keep whatever we have
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Live updates: Supabase Realtime pushes product inserts/updates/deletes to
  // every open catalogue (customer pages and the admin panel) instantly.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const s = supabase as SupabaseClient;
    if (typeof s.channel !== "function" || typeof s.removeAllChannels !== "function") return;

    let cancelled = false;
    const channel = s
      .channel("ecobrew-catalog-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ecobrew_products" },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (cancelled || !loadedFromDb.current) {
            if (cancelled) return;
            reload();
            return;
          }
          setProducts((prev) => {
            if (payload.eventType === "DELETE") {
              const slug = payload.old?.slug as string | undefined;
              const next = prev.filter((p) => p.slug !== slug);
              return next.length ? next : staticProducts;
            }
            const row = payload.new as unknown as ProductRow | undefined;
            if (!row?.slug) return prev;
            const mapped = mapProductRow(row);
            const exists = prev.some((p) => p.slug === mapped.slug);
            const next = exists
              ? prev.map((p) => (p.slug === mapped.slug ? mapped : p))
              : [...prev, mapped];
            return next;
          });
        },
      )
      .subscribe((status: string) => {
        // If realtime ever drops, a quiet refetch keeps the view honest.
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") reload();
      });

    return () => {
      cancelled = true;
      try {
        s.removeChannel(channel);
      } catch {}
    };
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
