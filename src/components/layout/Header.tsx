"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { useCart } from "@/components/cart/CartProvider";
import CartCount from "@/components/cart/CartCount";
import { CartIcon } from "@/components/icons";
import AccountModal from "@/components/auth/AccountModal";
import SettingsModal from "@/components/settings/SettingsModal";
import QuickSearchModal from "@/components/search/QuickSearchModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAppSettings } from "@/context/AppSettingsContext";

export default function Header() {
  const { openCart } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user, signOut, refresh } = useAuth();
  const { settings, updateSetting, openSettings, openSearch } = useAppSettings();

  const [weatherOpen, setWeatherOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isHindi = settings.language === "hi";

  const handleLogout = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-3 z-40 px-3 sm:px-6">
        <div className="glass-strong mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-white/40 px-4 sm:px-6 shadow-natural backdrop-blur-xl transition-all">
          
          {/* Left: Brand Logo & Title with live green dot */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-emerald-500/30 group-hover:ring-emerald-500 transition-all">
                <Image
                  src="/logo.png"
                  alt="EcoBrew Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-lg font-bold tracking-tight text-soil">
                  EcoBrew
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Bal Vigyan Live" />
              </div>
            </Link>

            {/* Weather / Location Pill (Video 00:56) */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setWeatherOpen(!weatherOpen)}
                className="flex items-center gap-2 rounded-full bg-black/5 hover:bg-black/10 px-3 py-1.5 text-xs font-medium text-soil transition-all border border-black/5"
              >
                <span>⛈️</span>
                <span>{settings.locationName || "Indore"}</span>
                <span className="text-stone">&bull;</span>
                <span className="font-semibold text-leaf-deep">26° Thunderstorm</span>
                <span className="text-[10px] text-stone">▾</span>
              </button>

              {weatherOpen && (
                <div
                  className="glass-strong absolute left-0 mt-2 w-72 rounded-2xl p-4 shadow-natural border border-white/30 z-50 text-xs animate-in fade-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-leaf-deep/10 pb-2.5">
                    <div>
                      <p className="font-semibold text-leaf-deep">{settings.locationName} &bull; Bal Vigyan Stall</p>
                      <p className="text-[11px] text-stone">Live weather telemetry</p>
                    </div>
                    <span className="text-2xl">⛈️</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3 text-stone">
                    <div className="rounded-xl bg-white/60 p-2">
                      <p className="text-[10px] uppercase text-tea font-semibold">Temperature</p>
                      <p className="text-sm font-bold text-soil">26°C (Feels 28°)</p>
                    </div>
                    <div className="rounded-xl bg-white/60 p-2">
                      <p className="text-[10px] uppercase text-tea font-semibold">Precipitation</p>
                      <p className="text-sm font-bold text-soil">12 mm rain</p>
                    </div>
                    <div className="rounded-xl bg-white/60 p-2">
                      <p className="text-[10px] uppercase text-tea font-semibold">Air Quality</p>
                      <p className="text-sm font-bold text-emerald-700">42 AQI &bull; Good</p>
                    </div>
                    <div className="rounded-xl bg-white/60 p-2">
                      <p className="text-[10px] uppercase text-tea font-semibold">Humidity</p>
                      <p className="text-sm font-bold text-soil">78%</p>
                    </div>
                  </div>
                  <div className="mt-3 text-[10px] text-stone/80 text-center">
                    Ideal atmospheric moisture for chai leaf curing
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Pill (Video 00:58) */}
          <div className="flex-1 max-w-sm mx-4 hidden md:block">
            <button
              type="button"
              onClick={openSearch}
              className="flex w-full items-center justify-between rounded-full bg-white/60 hover:bg-white px-4 py-2 text-xs text-stone border border-black/5 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-tea group-hover:text-leaf-deep transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search products, craft, circular advisory...</span>
              </div>
              <kbd className="hidden sm:inline-block rounded-md bg-black/5 px-2 py-0.5 font-mono text-[10px] text-stone group-hover:bg-leaf-deep group-hover:text-white transition-colors">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Navigation Links for Desk */}
          <nav className="hidden xl:flex items-center gap-5 text-xs font-semibold" aria-label="Main">
            <Suspense fallback={null}>
              <ActiveNavLinks />
            </Suspense>
          </nav>

          {/* Right Action Icons & User Account */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Mobile search trigger */}
            <button
              type="button"
              onClick={openSearch}
              className="flex h-9 w-9 items-center justify-center rounded-full text-stone hover:bg-black/5 hover:text-soil md:hidden"
              aria-label="Search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Language switcher button */}
            <button
              type="button"
              onClick={() => updateSetting("language", isHindi ? "en" : "hi")}
              className="hidden sm:flex items-center gap-1 rounded-full bg-white/60 hover:bg-white px-3 py-1.5 text-xs font-semibold text-soil border border-black/5 shadow-sm transition-all"
              title="Change Language"
            >
              <span>🌐</span>
              <span>{isHindi ? "हिंदी" : "Eng"}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone hover:bg-white/80 hover:text-soil transition-all"
                aria-label="Notifications"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
              </button>

              {notifOpen && (
                <div
                  className="glass-strong absolute right-0 mt-2 w-80 rounded-2xl p-4 shadow-natural border border-white/30 z-50 text-xs animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-leaf-deep/10 pb-2">
                    <span className="font-semibold text-leaf-deep">Notifications</span>
                    <span className="text-[10px] text-tea font-bold uppercase tracking-wider">Bal Vigyan 2026</span>
                  </div>
                  <div className="mt-3 space-y-2.5">
                    <div className="rounded-xl bg-white/70 p-2.5 border border-leaf-deep/5">
                      <p className="font-medium text-soil">New Batch Finished! 🍵</p>
                      <p className="text-[11px] text-stone mt-0.5">Leaf Pen Stands from 200 chai glasses are ready to ship.</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-2.5 border border-leaf-deep/5">
                      <p className="font-medium text-soil">Bal Vigyan Booth #42</p>
                      <p className="text-[11px] text-stone mt-0.5">Student live demonstration scheduled tomorrow at 11:00 AM.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Gear (Video 01:44) */}
            <button
              type="button"
              onClick={openSettings}
              className="flex h-9 w-9 items-center justify-center rounded-full text-stone hover:bg-white/80 hover:text-soil transition-all"
              aria-label="Settings"
              title="Appearance & Settings"
            >
              <span className="text-base">⚙️</span>
            </button>

            {/* User Account / Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-leaf-deep shadow-sm ring-1 ring-leaf-deep/20 hover:bg-white transition-all"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>@{user.userId}</span>
                </button>

                {userMenuOpen && (
                  <div className="glass-strong absolute right-0 mt-2 w-52 rounded-2xl p-2 shadow-natural border border-white/30 z-50 animate-in fade-in">
                    <div className="px-3 py-2 text-xs border-b border-leaf-deep/10">
                      <p className="font-semibold text-leaf-deep">{user.name || user.userId}</p>
                      <p className="truncate text-stone text-[11px]">{user.email || "EcoBrew Member"}</p>
                    </div>
                    <Link
                      href="/my-orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="mt-1 flex items-center gap-2 w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-soil hover:bg-white/80 transition-colors"
                    >
                      <span>📦</span>
                      <span>My Orders</span>
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-stone hover:bg-white/80 transition-colors"
                    >
                      <span>🔒</span>
                      <span>Admin Portal</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="mt-1 flex items-center gap-2 w-full rounded-xl px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="rounded-full bg-leaf-deep hover:bg-sprout-dark px-4 py-1.5 text-xs font-semibold text-white shadow-soft transition-all"
              >
                Sign in
              </button>
            )}

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-stone hover:bg-white/80 hover:text-soil transition-all"
              aria-label="Open cart"
            >
              <CartIcon className="h-4 w-4" />
              <CartCount />
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <AccountModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => refresh()}
      />
      <SettingsModal />
      <QuickSearchModal />
    </>
  );
}

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
            className={`transition-colors py-1 ${
              isActive
                ? "text-leaf-deep font-bold border-b-2 border-leaf-deep"
                : "text-stone hover:text-leaf-deep"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
