"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import Button from "@/components/ui/Button";
import { CartIcon } from "@/components/icons";

export default function AddToCartButton({ slug, inStock }: { slug: string; inStock: boolean }) {
  const { addItem, openCart } = useCart();
  const [qty, setQty] = useState(1);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex h-12 items-center rounded-full border border-moss/30 bg-white/50">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-4 text-xl text-moss hover:text-leaf-deep"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-8 text-center font-medium">{qty}</span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="px-4 text-xl text-moss hover:text-leaf-deep"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <Button
        size="lg"
        disabled={!inStock}
        onClick={() => {
          addItem(slug, qty);
          openCart();
        }}
      >
        <CartIcon className="h-5 w-5" />
        {inStock ? "Add to cart" : "Back soon"}
      </Button>
    </div>
  );
}
