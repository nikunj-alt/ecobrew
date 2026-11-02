"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cartCount, cartSubtotal } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (slug: string, qty?: number) => void;
  removeItem: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocalStorage<CartItem[]>("ecobrew-cart", []);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (slug: string, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.slug === slug);
        if (existing) {
          return prev.map((i) =>
            i.slug === slug ? { ...i, qty: i.qty + qty } : i,
          );
        }
        return [...prev, { slug, qty }];
      });
    },
    [setItems],
  );

  const removeItem = useCallback(
    (slug: string) => {
      setItems((prev) => prev.filter((i) => i.slug !== slug));
    },
    [setItems],
  );

  const setQty = useCallback(
    (slug: string, qty: number) => {
      setItems((prev) => {
        if (qty <= 0) return prev.filter((i) => i.slug !== slug);
        return prev.map((i) => (i.slug === slug ? { ...i, qty } : i));
      });
    },
    [setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);
  const openCart = useCallback(() => setIsOpen(true), [setIsOpen]);
  const closeCart = useCallback(() => setIsOpen(false), [setIsOpen]);

  const value = useMemo(
    () => ({
      items,
      count: cartCount(items),
      subtotal: cartSubtotal(items),
      isOpen,
      addItem,
      removeItem,
      setQty,
      clear,
      openCart,
      closeCart,
    }),
    [items, isOpen, addItem, removeItem, setQty, clear, openCart, closeCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
