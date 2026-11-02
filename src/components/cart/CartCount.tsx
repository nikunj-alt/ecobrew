"use client";

import { useCart } from "./CartProvider";

export default function CartCount() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-tea px-1 text-[11px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
