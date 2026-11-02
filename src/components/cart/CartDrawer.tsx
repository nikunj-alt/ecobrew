"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import CartItem from "./CartItem";
import { formatINR } from "@/lib/utils";
import { CloseIcon, CartIcon } from "@/components/icons";
import Button from "@/components/ui/Button";

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeCart } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-soil/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-oat shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-moss/15 px-6 py-5">
          <h2 className="flex items-center gap-2 text-xl font-medium text-leaf-deep">
            <CartIcon className="h-5 w-5 text-sprout" /> Your cart
          </h2>
          <button
            onClick={closeCart}
            className="rounded-full p-2 text-moss transition-colors hover:bg-white/50 hover:text-leaf-deep"
            aria-label="Close cart"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-kraft">
                <CartIcon className="h-7 w-7 text-moss" />
              </div>
              <div>
                <p className="font-medium text-leaf-deep">Your cart is empty</p>
                <p className="mt-1 text-sm text-moss">
                  Everything here is made from spent tea leaves.
                </p>
              </div>
              <Link href="/products" onClick={closeCart} className="text-sm font-medium text-sprout-dark hover:underline">
                Browse products →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-moss/15">
              {items.map((item) => (
                <CartItem key={item.slug} slug={item.slug} qty={item.qty} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-moss/15 px-6 py-5">
            <div className="flex items-center justify-between text-sm text-moss">
              <span>Subtotal</span>
              <span className="text-lg font-semibold text-leaf-deep">
                {formatINR(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-moss/70">
              Shipping and taxes are finalised at checkout.
            </p>
            <Link href="/checkout" onClick={closeCart} className="mt-4 block">
              <Button fullWidth size="lg">Proceed to checkout</Button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
