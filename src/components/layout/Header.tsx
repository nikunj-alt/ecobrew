"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, SITE_NAME } from "@/lib/constants";
import { useCart } from "@/components/cart/CartProvider";
import CartCount from "@/components/cart/CartCount";
import { CartIcon } from "@/components/icons";
import Container from "./Container";
import AccountModal from "@/components/auth/AccountModal";
import { getLoggedInUser, setLoggedInUser, UserAccount } from "@/lib/services/auth";

export default function Header() {
  const pathname = usePathname();
  const { openCart } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setUser(getLoggedInUser());
  }, [pathname]);

  const handleLogout = () => {
    setLoggedInUser(null);
    setUser(null);
    setDropdownOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
                className="rounded-full bg-leaf-deep/10 px-3.5 py-1.5 text-xs font-medium text-leaf-deep hover:bg-leaf-deep/20 transition-colors"
              >
                Account / Login
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
        onSuccess={(u) => setUser(u)}
      />
    </>
  );
}
