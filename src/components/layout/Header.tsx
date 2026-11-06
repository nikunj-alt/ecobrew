"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { useCart } from "@/components/cart/CartProvider";
import CartCount from "@/components/cart/CartCount";
import { CartIcon } from "@/components/icons";
import Container from "./Container";
import AccountModal from "@/components/auth/AccountModal";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Header() {
  const { openCart } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, signOut, refresh } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-moss/15 bg-oat/85 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 py-1">
            <img
              src="/logo.png"
              alt="EcoBrew Logo"
              className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-leaf-deep/15"
            />
            <span className="font-display text-xl font-medium tracking-tight text-leaf-deep">
              {SITE_NAME}
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
            <Suspense fallback={null}>
              <ActiveNavLinks />
            </Suspense>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-xs font-medium text-leaf-deep shadow-sm ring-1 ring-leaf-deep/20 hover:bg-white"
                >
                  <span className="h-2 w-2 rounded-full bg-sprout animate-pulse" />
                  <span>@{user.userId}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-oat p-2 shadow-xl ring-1 ring-leaf-deep/15">
                    <div className="px-3 py-2 text-xs text-moss border-b border-moss/15">
                      <p className="font-medium text-leaf-deep">{user.name || user.userId}</p>
                      <p className="truncate">{user.email || "Supabase Account"}</p>
                    </div>
                    <Link
                      href="/my-orders"
                      onClick={() => setDropdownOpen(false)}
                      className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-leaf-deep hover:bg-white/70 transition-colors"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="rounded-full border border-leaf-deep/25 px-5 py-2 text-xs font-semibold tracking-wide text-leaf-deep transition-colors hover:bg-leaf-deep/10"
              >
                Sign in
              </button>
            )}

            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-moss transition-colors hover:bg-white/50 hover:text-leaf-deep"
              aria-label="Open cart"
            >
              <CartIcon className="h-5 w-5" />
              <CartCount />
            </button>
          </div>
        </Container>
      </header>

      <AccountModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => refresh()}
      />
    </>
  );
}

// Nav link highlighting depends on the current path, which is only known at
// request time for dynamic routes (e.g. /products/[slug]). Reading usePathname
// here — the smallest leaf that needs it — and wrapping it in <Suspense> keeps
// the rest of the header prerendered instead of blocking the static shell.
function ActiveNavLinks() {
  const pathname = usePathname();
  return (
    <>
      {NAV_LINKS.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm transition-colors ${
              isActive
                ? "font-medium text-leaf-deep"
                : "text-moss hover:text-leaf-deep"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
