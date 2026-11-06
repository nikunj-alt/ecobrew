"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useProductCatalog } from "@/components/product/ProductCatalogProvider";
import { processSteps } from "@/lib/data/process";

export default function QuickSearchModal() {
  const { isSearchOpen, closeSearch } = useAppSettings();
  const { products } = useProductCatalog();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setQuery(""), 0);
    return () => clearTimeout(t);
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const clean = query.trim().toLowerCase();

  const filteredProducts = clean
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(clean) ||
          p.category.toLowerCase().includes(clean) ||
          p.description.toLowerCase().includes(clean)
      )
    : products.slice(0, 4);

  const filteredSteps = clean
    ? processSteps.filter(
        (s) =>
          s.title.toLowerCase().includes(clean) ||
          s.body.toLowerCase().includes(clean)
      )
    : processSteps.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 bg-black/60 p-4 backdrop-blur-md transition-all">
      <div
        className="glass-strong relative w-full max-w-2xl overflow-hidden rounded-2xl p-4 shadow-2xl border border-white/20 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-leaf-deep/15 pb-4">
          <svg className="h-5 w-5 text-tea shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, circular crafts, 7-step method..."
            className="w-full bg-transparent text-base sm:text-lg font-medium text-soil placeholder:text-stone/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-stone hover:text-soil px-1.5 py-0.5 rounded bg-black/5"
            >
              Clear
            </button>
          )}
          <button
            onClick={closeSearch}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone hover:bg-black/5 hover:text-soil text-sm"
          >
            ✕
          </button>
        </div>

        {/* Results Container */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-5 pr-1">
          {/* Products section */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-tea mb-2">
              <span>Products ({filteredProducts.length})</span>
              <Link href="/products" onClick={closeSearch} className="text-leaf-deep hover:underline">
                View all &rarr;
              </Link>
            </div>
            {filteredProducts.length === 0 ? (
              <p className="text-xs text-stone py-2">No matching pieces found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredProducts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    onClick={closeSearch}
                    className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/60 transition-colors border border-transparent hover:border-leaf-deep/10"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-kraft">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-leaf-deep truncate">{p.name}</p>
                      <p className="text-xs text-stone">₹{p.price} · {p.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Process & Knowledge section */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-tea mb-2">
              <span>The 7-Step Method</span>
              <Link href="/process" onClick={closeSearch} className="text-leaf-deep hover:underline">
                Explore full process &rarr;
              </Link>
            </div>
            <div className="space-y-1.5">
              {filteredSteps.map((s) => (
                <Link
                  key={s.n}
                  href="/process"
                  onClick={closeSearch}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-white/60 transition-colors"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tea/15 text-xs font-bold text-tea">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-leaf-deep">{s.title}</p>
                    <p className="text-xs text-moss line-clamp-1">{s.body}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="border-t border-leaf-deep/10 pt-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone mb-2 block">
              Quick Navigation
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link
                href="/products"
                onClick={closeSearch}
                className="rounded-full bg-white/70 px-3 py-1 text-leaf-deep hover:bg-sprout hover:text-white transition-colors"
              >
                Shop Range
              </Link>
              <Link
                href="/process"
                onClick={closeSearch}
                className="rounded-full bg-white/70 px-3 py-1 text-leaf-deep hover:bg-sprout hover:text-white transition-colors"
              >
                How It&apos;s Made
              </Link>
              <Link
                href="/about"
                onClick={closeSearch}
                className="rounded-full bg-white/70 px-3 py-1 text-leaf-deep hover:bg-sprout hover:text-white transition-colors"
              >
                Our Story
              </Link>
              <Link
                href="/find-us"
                onClick={closeSearch}
                className="rounded-full bg-white/70 px-3 py-1 text-leaf-deep hover:bg-sprout hover:text-white transition-colors"
              >
                Find Us / Bal Vigyan
              </Link>
              <Link
                href="/contact"
                onClick={closeSearch}
                className="rounded-full bg-white/70 px-3 py-1 text-leaf-deep hover:bg-sprout hover:text-white transition-colors"
              >
                Help & Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="mt-4 flex items-center justify-between border-t border-leaf-deep/10 pt-3 text-[11px] text-stone">
          <span>Press <kbd className="rounded bg-black/5 px-1 py-0.5 font-mono">ESC</kbd> to close</span>
          <span>BhoomiX &bull; EcoBrew Search</span>
        </div>
      </div>
    </div>
  );
}
