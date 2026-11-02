"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { useCart } from "@/components/cart/CartProvider";
import CartCount from "@/components/cart/CartCount";
import { LeafIcon, CartIcon } from "@/components/icons";
import Container from "./Container";

export default function Header() {
  const pathname = usePathname();
  const { openCart } = useCart();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 border-b border-moss/15 bg-oat/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf-deep text-sprout">
            <LeafIcon className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-xl font-medium text-leaf-deep">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                isActive(link.href)
                  ? "font-medium text-leaf-deep"
                  : "text-moss hover:text-leaf-deep"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={openCart}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-moss transition-colors hover:bg-white/50 hover:text-leaf-deep"
          aria-label="Open cart"
        >
          <CartIcon className="h-5 w-5" />
          <CartCount />
        </button>
      </Container>
    </header>
  );
}
