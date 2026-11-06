"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppSettings, LanguageCode } from "@/context/AppSettingsContext";
import { useAuth } from "@/components/auth/AuthProvider";

const LANGUAGES: { code: LanguageCode; name: string; native: string }[] = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
];

export default function SettingsModal() {
  const { settings, updateSetting, resetDefaults, isSettingsOpen, closeSettings } = useAppSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"appearance" | "notifications" | "support" | "orders" | "about">("appearance");

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-md transition-all">
      <div
        className="glass-strong relative flex h-[85vh] max-h-[640px] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/20 shadow-2xl md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar */}
        <div className="w-full border-b border-leaf-deep/10 bg-white/40 p-4 md:w-56 md:border-b-0 md:border-r md:p-6">
          <div className="mb-6 flex items-center justify-between md:block">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-leaf-deep text-white shadow-sm">
                ⚙️
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-leaf-deep">Settings</h3>
                <p className="text-[11px] text-stone">Preferences & layout</p>
              </div>
            </div>
            <button
              onClick={closeSettings}
              className="flex h-8 w-8 items-center justify-center rounded-full text-stone hover:bg-black/5 md:hidden"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-row gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {[
              { id: "appearance", label: "Appearance", icon: "🎨" },
              { id: "notifications", label: "Notifications", icon: "🔔" },
              { id: "orders", label: "My Orders", icon: "📦" },
              { id: "support", label: "Support", icon: "💬" },
              { id: "about", label: "About", icon: "ℹ️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "bg-leaf-deep text-white shadow-sm"
                    : "text-stone hover:bg-white/60 hover:text-leaf-deep"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="relative flex-1 overflow-y-auto p-5 sm:p-8">
          <button
            onClick={closeSettings}
            className="absolute top-6 right-6 hidden h-8 w-8 items-center justify-center rounded-full text-stone transition-colors hover:bg-black/5 hover:text-leaf-deep md:flex"
            aria-label="Close"
          >
            ✕
          </button>

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h4 className="font-display text-xl font-medium text-leaf-deep">Appearance</h4>
                <p className="text-xs text-moss">Customize how EcoBrew looks and responds on your device.</p>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-tea block mb-2.5">
                  Theme mode
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <button
                    onClick={() => updateSetting("theme", "light")}
                    className={`flex items-center gap-3 rounded-2xl p-3.5 border text-left transition-all ${
                      settings.theme === "light"
                        ? "border-tea bg-white shadow-soft ring-2 ring-tea/30"
                        : "border-leaf-deep/15 bg-white/40 hover:bg-white/70"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 text-lg">
                      ☀️
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-leaf-deep">Light Mode</p>
                      <p className="text-[11px] text-stone">Natural cream & sage</p>
                    </div>
                  </button>

                  <button
                    onClick={() => updateSetting("theme", "dark")}
                    className={`flex items-center gap-3 rounded-2xl p-3.5 border text-left transition-all ${
                      settings.theme === "dark"
                        ? "border-tea bg-soil text-white shadow-soft ring-2 ring-tea/30"
                        : "border-leaf-deep/15 bg-white/40 hover:bg-white/70"
                    }`}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-amber-300 text-lg">
                      🌙
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Dark Mode</p>
                      <p className="text-[11px] opacity-75">Misty night pine</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Language Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-tea block mb-2">
                  Language & Locale (23 Languages)
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting("language", e.target.value as LanguageCode)}
                  className="w-full max-w-sm rounded-xl border border-leaf-deep/20 bg-white/80 px-3.5 py-2.5 text-sm font-medium text-soil shadow-sm focus:border-tea focus:outline-none focus:ring-1 focus:ring-tea"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.native} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Interactive Toggles */}
              <div className="space-y-3 pt-2 border-t border-leaf-deep/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-tea block">
                  Accessibility & Motion
                </span>

                {[
                  {
                    key: "animations" as const,
                    title: "Animations & Motion",
                    desc: "Enable fluid micro-interactions and liquid shader flows.",
                  },
                  {
                    key: "compactLayout" as const,
                    title: "Compact Layout",
                    desc: "Increase information density across product and order cards.",
                  },
                  {
                    key: "largerText" as const,
                    title: "Larger Text",
                    desc: "Enhance readability with scaled display typography.",
                  },
                  {
                    key: "highContrast" as const,
                    title: "High Contrast",
                    desc: "Sharpen borders and maximize glass background contrast.",
                  },
                  {
                    key: "useLocation" as const,
                    title: "Use My Location",
                    desc: "Use your location to personalise delivery and store pickup estimates.",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between gap-4 rounded-xl p-2.5 hover:bg-white/50 transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium text-leaf-deep">{item.title}</p>
                      <p className="text-xs text-stone">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings[item.key]}
                      onClick={() => updateSetting(item.key, !settings[item.key])}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings[item.key] ? "bg-sprout" : "bg-black/15"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings[item.key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>

              {/* Reset to defaults */}
              <div className="pt-4 border-t border-leaf-deep/10 flex justify-between items-center">
                <button
                  type="button"
                  onClick={resetDefaults}
                  className="text-xs font-semibold text-stone hover:text-red-600 transition-colors"
                >
                  Reset to defaults
                </button>
                <button
                  type="button"
                  onClick={closeSettings}
                  className="rounded-xl bg-leaf-deep px-5 py-2 text-xs font-semibold text-white shadow-soft hover:bg-sprout-dark transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-display text-xl font-medium text-leaf-deep">Notifications</h4>
                <p className="text-xs text-moss">Stay updated on your orders and new batch drops.</p>
              </div>
              <div className="rounded-2xl bg-white/60 p-4 border border-leaf-deep/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-leaf-deep">Order Status Updates</p>
                    <p className="text-xs text-stone">Real-time alerts when your piece is drying or shipped.</p>
                  </div>
                  <span className="text-xs font-semibold text-sprout">Enabled</span>
                </div>
                <div className="flex items-center justify-between border-t border-leaf-deep/10 pt-3">
                  <div>
                    <p className="text-sm font-medium text-leaf-deep">Product &amp; Drop Alerts</p>
                    <p className="text-xs text-stone">Be first to know about new batches and restocks.</p>
                  </div>
                  <span className="text-xs font-semibold text-sprout">Enabled</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-display text-xl font-medium text-leaf-deep">Order Tracking</h4>
                <p className="text-xs text-moss">Review past orders or monitor your handcrafted chai pieces.</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-6 text-center border border-leaf-deep/10">
                <p className="text-sm text-stone mb-4">
                  {user ? `Logged in as @${user.userId}` : "Sign in to view your personalized orders."}
                </p>
                <Link
                  href="/my-orders"
                  onClick={closeSettings}
                  className="inline-flex rounded-xl bg-leaf-deep px-5 py-2.5 text-xs font-semibold text-white hover:bg-sprout-dark transition-colors"
                >
                  Open My Orders Page &rarr;
                </Link>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-display text-xl font-medium text-leaf-deep">Support & Contact</h4>
                <p className="text-xs text-moss">Connect with our customer care team.</p>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl bg-white/70 p-4 border border-leaf-deep/10">
                  <p className="text-xs font-semibold uppercase text-tea">Email Us</p>
                  <p className="text-sm font-medium text-leaf-deep">ecobrew2026@gmail.com</p>
                  <p className="text-xs text-stone mt-1">Direct contact for project inquiries and bulk orders.</p>
                </div>
                <div className="rounded-xl bg-white/70 p-4 border border-leaf-deep/10">
                  <p className="text-xs font-semibold uppercase text-tea">Partnerships</p>
                  <p className="text-sm font-medium text-leaf-deep">Retail, Corporate Gifting &amp; Bulk Orders</p>
                  <p className="text-xs text-stone mt-1">Custom runs and wholesale pricing for cafes, offices, and retailers.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-display text-xl font-medium text-leaf-deep">About EcoBrew</h4>
                <p className="text-xs text-moss">Version 2.4 — Production Build</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-5 border border-leaf-deep/10 text-xs text-moss space-y-2 leading-relaxed">
                <p>
                  EcoBrew is an independent circular-economy brand built on a simple idea: spent tea leaves are a resource, not rubbish.
                  Chai culture across India generates metric tons of spent wet tea leaves daily, typically landfilled.
                </p>
                <p>
                  EcoBrew provides transparent traceability from chai stall collection to finished artisanal pieces.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
