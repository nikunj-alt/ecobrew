"use client";

import React, { useState, useEffect, useCallback, type FormEvent } from "react";
import Image from "next/image";
import { setLoggedInUser, type UserAccount } from "@/lib/services/auth";
import { useSession } from "@/hooks/useSession";
import { LiquidMetalShader } from "@/components/ui/liquid-metal-shader";
import { useAppSettings } from "@/context/AppSettingsContext";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserAccount) => void;
}

type AuthView = "welcome" | "login" | "register";

export default function AccountModal({ isOpen, onClose, onSuccess }: AccountModalProps) {
  const { settings, updateSetting } = useAppSettings();
  const [view, setView] = useState<AuthView>("welcome");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const address = "EcoBrew Studio & Warehouse";
  const city = "Indore";
  const state = "Madhya Pradesh";
  const pincode = "452001";

  const [toastMessage, setToastMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [idStatus, setIdStatus] = useState<"idle" | "checking" | "taken" | "ok">("idle");
  const { signIn: googleSignIn } = useSession();

  const isHindi = settings.language === "hi";

  const showToast = useCallback((text: string, type: "error" | "success" = "error") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  // Debounced live check on User ID
  const checkId = useCallback(async (id: string) => {
    const clean = id.trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,24}$/.test(clean)) {
      setIdStatus("idle");
      return;
    }
    setIdStatus("checking");
    try {
      const res = await fetch(`/api/auth/check-userid?userId=${encodeURIComponent(clean)}`);
      const data = await res.json();
      setIdStatus(data.taken ? "taken" : "ok");
      if (data.taken) {
        showToast("That username is already taken. Try another one.", "error");
      }
    } catch {
      setIdStatus("idle");
    }
  }, [showToast]);

  useEffect(() => {
    if (!isOpen) return;
    Promise.resolve().then(() => {
      setView("welcome");
      setUserId("");
      setPassword("");
      setName("");
      setEmail("");
      setPhone("");
      setToastMessage(null);
      setLoading(false);
      setIdStatus("idle");
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !userId || view !== "register") return;
    const t = setTimeout(() => checkId(userId), 350);
    return () => clearTimeout(t);
  }, [isOpen, userId, view, checkId]);

  if (!isOpen) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep("Authenticating your credentials...");
    setToastMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; user?: UserAccount; error?: string };

      if (res.ok && data.ok && data.user) {
        setLoadingStep("Redirecting to dashboard...");
        showToast(`✓ Welcome back, @${data.user.userId}!`, "success");
        setTimeout(() => {
          setLoggedInUser(data.user!);
          if (onSuccess) onSuccess(data.user!);
          setLoading(false);
          onClose();
        }, 800);
      } else {
        setLoading(false);
        showToast(data.error || "Invalid user ID or password.", "error");
      }
    } catch {
      setLoading(false);
      showToast("Network error. Please try again.", "error");
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep("Verifying account uniqueness...");
    setToastMessage(null);

    const cleanId = userId.trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,24}$/.test(cleanId)) {
      setLoading(false);
      showToast("Username must be 3–24 characters: lowercase, numbers, _ . -", "error");
      return;
    }
    if (password.length < 4) {
      setLoading(false);
      showToast("Password must be at least 4 characters.", "error");
      return;
    }

    try {
      const preTaken = await fetch(`/api/auth/check-userid?userId=${encodeURIComponent(cleanId)}`)
        .then((r) => r.json())
        .then((d) => Boolean(d.taken))
        .catch(() => false);

      if (preTaken) {
        setLoading(false);
        setIdStatus("taken");
        showToast("That username is already taken. Try another one.", "error");
        return;
      }

      setLoadingStep("Provisioning circular account...");
      const newAccount: UserAccount = {
        userId: cleanId,
        password,
        name: name || cleanId,
        email: email || `${cleanId}@ecobrew.local`,
        phone,
        address,
        city: city || "Indore",
        state: state || "Madhya Pradesh",
        pincode: pincode || "452001",
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccount),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (res.ok && data.ok) {
        setLoadingStep("✓ Account created! Redirecting...");
        showToast("✓ Account created! Redirecting...", "success");
        setTimeout(() => {
          setLoggedInUser(newAccount);
          if (onSuccess) onSuccess(newAccount);
          setLoading(false);
          onClose();
        }, 900);
      } else {
        setLoading(false);
        showToast(data.error || "Registration failed. Try a different username.", "error");
      }
    } catch {
      setLoading(false);
      showToast("Registration error. Please retry.", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md transition-all">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_center,rgba(30,122,95,0.25)_0%,transparent_70%)]" />

      {/* Floating Toast notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 z-60 flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all animate-bounce ${
            toastMessage.type === "success"
              ? "bg-emerald-900/90 text-emerald-200 border border-emerald-500/40"
              : "bg-red-900/90 text-red-200 border border-red-500/40"
          }`}
        >
          <span>{toastMessage.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Card */}
      <div
        className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 shadow-natural transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/85 p-6 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-sprout animate-ping" />
              <span className="h-3 w-3 rounded-full bg-sprout animate-ping delay-150" />
              <span className="h-3 w-3 rounded-full bg-sprout animate-ping delay-300" />
            </div>
            <p className="mt-4 text-sm font-medium text-leaf-deep">{loadingStep || "Processing..."}</p>
          </div>
        )}

        {/* Top Header Banner with LiquidMetalShader */}
        <div className="relative h-28 w-full overflow-hidden border-b border-white/20">
          <LiquidMetalShader
            className="absolute inset-0 h-full w-full opacity-90"
            baseColor="#113a2d"
            metalColor="#2d6e57"
            highlightColor="#d5ecd9"
            speed={0.65}
            distortion={0.55}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

          {/* Banner content */}
          <div className="relative flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg">
                <Image src="/logo.png" alt="EcoBrew" width={26} height={26} className="rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-lg font-bold tracking-tight text-white drop-shadow">
                    EcoBrew
                  </span>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                </div>
                <p className="text-[11px] font-medium text-white/80">Circular Goods</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language switcher pill */}
              <button
                type="button"
                onClick={() => updateSetting("language", isHindi ? "en" : "hi")}
                className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-md border border-white/25 hover:bg-black/60 transition-colors"
                title="Switch language"
              >
                <span>🌐</span>
                <span>{isHindi ? "हिंदी" : "Eng"}</span>
              </button>

              {/* Close button */}
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white/80 backdrop-blur-md hover:bg-black/50 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* View 1: Welcome Gate (Screen recording 00:05 - 00:16) */}
        {view === "welcome" && (
          <div className="p-6 sm:p-8">
            <div className="text-center">
              <h3 className="font-display text-2xl font-semibold text-soil">
                {isHindi ? "जारी रखने के लिए साइन इन करें" : "Sign in to continue"}
              </h3>
              <p className="mt-1 text-xs text-moss">
                {isHindi
                  ? "आपका सर्कुलर साथी — चाय के कचरे से टिकाऊ कलाकृतियों तक"
                  : "Your circular companion — from spent chai to sustainable craft"}
              </p>
            </div>

            {/* 3 Value props with checkmarks */}
            <div className="my-6 space-y-3 rounded-2xl bg-white/60 p-4 border border-leaf-deep/10 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ✓
                </span>
                <p className="text-xs font-medium text-leaf-deep">
                  {isHindi ? "100% उपयोग की गई चाय पत्ती का पुनर्चक्रण" : "100% upcycled spent chai leaves"}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ✓
                </span>
                <p className="text-xs font-medium text-leaf-deep">
                  {isHindi ? "शून्य प्लास्टिक या रासायनिक गोंद" : "Zero plastic or chemical binders"}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ✓
                </span>
                <p className="text-xs font-medium text-leaf-deep">
                  {isHindi ? "हस्तनिर्मित, स्थायी सामग्री" : "Handcrafted from upcycled material"}
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => setView("register")}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-leaf-deep via-sprout to-sprout-dark px-6 py-3.5 text-sm font-semibold text-white shadow-natural hover:shadow-lg transition-all"
            >
              <span>{isHindi ? "आरंभ करें →" : "Get Started →"}</span>
            </button>

            {/* Secondary Action */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setView("login")}
                className="text-xs font-semibold text-moss hover:text-leaf-deep underline transition-colors"
              >
                {isHindi ? "पहले से खाता है? साइन इन करें" : "Already have an account? Sign in"}
              </button>
            </div>

            {/* Demo quick login hint */}
            <div className="mt-5 border-t border-leaf-deep/10 pt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setUserId("demo");
                  setPassword("demo123");
                  setView("login");
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <span>⚡</span>
                <span>Quick Demo: @demo / demo123</span>
              </button>
            </div>
          </div>
        )}

        {/* View 2: Login or Register Screen (Screen recording 00:17 - 00:54) */}
        {(view === "login" || view === "register") && (
          <div className="p-6 sm:p-7">
            {/* Top row with Back button */}
            <div className="flex items-center justify-between pb-3">
              <button
                type="button"
                onClick={() => setView("welcome")}
                className="flex items-center gap-1 text-xs font-medium text-stone hover:text-leaf-deep transition-colors"
              >
                <span>&larr;</span>
                <span>Back</span>
              </button>
              <h4 className="font-display text-base font-semibold text-leaf-deep">
                {view === "login" ? "Sign In" : "Create Account"}
              </h4>
              <div className="w-8" />
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => googleSignIn()}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-2.5 text-xs font-semibold text-soil shadow-sm border border-leaf-deep/15 hover:bg-stone-50 transition-all"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-3.5 flex items-center justify-center">
              <div className="w-full border-t border-leaf-deep/15" />
              <span className="absolute bg-white px-2 text-[10px] uppercase font-bold tracking-wider text-stone">
                or use username
              </span>
            </div>

            {/* Login / Register tab toggles */}
            <div className="flex rounded-xl bg-black/5 p-1 mb-4">
              <button
                onClick={() => setView("login")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  view === "login" ? "bg-white text-leaf-deep shadow-sm" : "text-stone hover:text-soil"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setView("register")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  view === "register" ? "bg-white text-leaf-deep shadow-sm" : "text-stone hover:text-soil"
                }`}
              >
                Register
              </button>
            </div>

            {view === "login" ? (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone mb-1">
                    Username / EcoBrew ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. demo"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full rounded-xl border border-leaf-deep/20 bg-white/90 px-3.5 py-2 text-sm text-soil shadow-sm focus:border-leaf-deep focus:outline-none focus:ring-1 focus:ring-leaf-deep"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-leaf-deep/20 bg-white/90 px-3.5 py-2 text-sm text-soil shadow-sm focus:border-leaf-deep focus:outline-none focus:ring-1 focus:ring-leaf-deep"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setUserId("demo");
                      setPassword("demo123");
                    }}
                    className="text-tea font-semibold hover:underline"
                  >
                    Auto-fill Demo
                  </button>
                  <span className="text-stone">EcoBrew</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-leaf-deep py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-natural hover:bg-sprout-dark transition-all"
                >
                  Sign In &rarr;
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-leaf-deep/20 bg-white/90 px-3.5 py-2 text-sm text-soil shadow-sm focus:border-leaf-deep focus:outline-none focus:ring-1 focus:ring-leaf-deep"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone mb-1">
                    Choose Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. eco_aarav"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2 text-sm text-soil shadow-sm focus:outline-none ${
                      idStatus === "taken"
                        ? "border-red-400 bg-red-50/50"
                        : idStatus === "ok"
                        ? "border-emerald-400 bg-emerald-50/50"
                        : "border-leaf-deep/20 bg-white/90"
                    }`}
                  />
                  <p className={`mt-1 text-[11px] ${idStatus === "taken" ? "text-red-600 font-medium" : idStatus === "ok" ? "text-emerald-700 font-medium" : "text-stone"}`}>
                    {idStatus === "checking"
                      ? "Checking availability..."
                      : idStatus === "taken"
                      ? "That username is already taken. Try another one."
                      : idStatus === "ok"
                      ? "✓ Available — this username is yours."
                      : "3–24 characters: lowercase, numbers, _ . -"}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="aarav@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-leaf-deep/20 bg-white/90 px-3.5 py-2 text-sm text-soil shadow-sm focus:border-leaf-deep focus:outline-none focus:ring-1 focus:ring-leaf-deep"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 4 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-leaf-deep/20 bg-white/90 px-3.5 py-2 text-sm text-soil shadow-sm focus:border-leaf-deep focus:outline-none focus:ring-1 focus:ring-leaf-deep"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || idStatus === "taken"}
                  className="w-full rounded-xl bg-gradient-to-r from-leaf-deep to-sprout py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-natural hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Register &rarr;
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
