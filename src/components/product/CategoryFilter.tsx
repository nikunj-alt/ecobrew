"use client";

import { useMemo, useState } from "react";
import type { Product, Category } from "@/lib/types";
import { categories, categoryLabels } from "@/lib/data/products";
import ProductGrid from "./ProductGrid";

export default function CategoryFilter({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Category | "all">("all");

  const filtered = useMemo(
    () => (active === "all" ? products : products.filter((p) => p.category === active)),
    [products, active],
  );

  const tabs: (Category | "all")[] = ["all", ...categories];

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === tab
                ? "bg-leaf-deep text-oat"
                : "bg-white/50 text-moss hover:bg-white/80 hover:text-leaf-deep"
            }`}
          >
            {tab === "all" ? "All" : categoryLabels[tab]}
          </button>
        ))}
      </div>
      <p className="mb-6 text-sm text-moss">{filtered.length} product{filtered.length === 1 ? "" : "s"}</p>
      <ProductGrid products={filtered} />
    </div>
  );
}
