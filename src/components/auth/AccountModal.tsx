"use client";

import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { setLoggedInUser } from "@/lib/services/auth";
import type { UserAccount } from "@/lib/services/auth";
import { useSession } from "@/hooks/useSession";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserAccount) => void;
}

export default function AccountModal({ isOpen, onClose, onSuccess }: AccountModalProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useSession();

  // Registration extra fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [idStatus, setIdStatus] = useState<"idle" | "checking" | "taken" | "ok">("idle");

  // Live uniqueness check on the chosen User ID (debounced)
  const checkId = useCallback(async (id: string) => {
    const clean = id.trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,24}$/.test(clean)) {
      setIdStatus("idle");
      return;
    }
    setIdStatus("checking");
    const taken = await fetch(`/api/auth/check-userid?userId=${encodeURIComponent(clean)}`)
      .then((r) => r.json())
      .then((d) => Boolean(d.taken))
      .catch(() => false);
    setIdStatus(taken ? "taken" : "ok");
  }, []);

  // Reset form state only when the modal opens (not on every keystroke).
  // Scheduled on a microtask so no state is set synchronously inside the effect.
  useEffect(() => {
    if (!isOpen) return;
    Promise.resolve().then(() => {
      setError("");
      setUserId("");
      setPassword("");
      setIdStatus("idle");
    });
  }, [isOpen]);

  // Debounced live uniqueness check on the typed User ID.
  useEffect(() => {
    if (!isOpen || !userId) return;
    Promise.resolve().then(() => setIdStatus("checking"));
    const t = setTimeout(() => checkId(userId), 400);
    return () => clearTimeout(t);
  }, [isOpen, userId, checkId]);

  if (!isOpen) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; user?: UserAccount; error?: string };
    setLoading(false);
    if (res.ok && data.ok && data.user) {
      setLoggedInUser(data.user);
      if (onSuccess) onSuccess(data.user);
      onClose();
    } else {
      setError(data.error || "Login failed.");
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanId = userId.trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,24}$/.test(cleanId)) {
      setError("User ID must be 3–24 chars: lowercase letters, numbers, _ . - only.");
      setLoading(false);
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      setLoading(false);
      return;
    }
    // Final uniqueness guarantee right before insert (server-checked).
    const preTaken = await fetch(`/api/auth/check-userid?userId=${encodeURIComponent(cleanId)}`)
      .then((r) => r.json())
      .then((d) => Boolean(d.taken))
      .catch(() => false);
    if (preTaken) {
      setError(`User ID "${cleanId}" is already taken. Every user must have a unique ID — try another.`);
      setIdStatus("taken");
      setLoading(false);
      return;
    }

    const newAccount: UserAccount = {
      userId: cleanId,
      password,
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAccount),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    setLoading(false);
    if (res.ok && data.ok) {
      setLoggedInUser(newAccount);
      if (onSuccess) onSuccess(newAccount);
      onClose();
    } else {
      setError(data.error || "Registration failed. User ID might already exist.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-biophilic bg-oat p-6 shadow-2xl ring-1 ring-leaf-deep/15 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-moss/15">
          <h3 className="font-display text-xl font-medium text-leaf-deep">
            {tab === "login" ? "Sign in" : "Create an account"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-moss hover:bg-white/50 hover:text-leaf-deep"
          >
            ✕
          </button>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => signIn()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-leaf-deep shadow-sm ring-1 ring-leaf-deep/15 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
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
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-moss/15" />
            </div>
            <span className="relative bg-oat px-3 text-xs uppercase tracking-wider text-moss">Or with user ID</span>
          </div>
        </div>

        <div className="flex rounded-xl bg-white/50 p-1">
          <button
            onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === "login" ? "bg-leaf-deep text-oat shadow-sm" : "text-moss hover:text-leaf-deep"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              tab === "register" ? "bg-leaf-deep text-oat shadow-sm" : "text-moss hover:text-leaf-deep"
            }`}
          >
            Create account
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-moss mb-1">
                User ID
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. rahul_eco2026"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoComplete="username"
              />
              <p className="mt-1 text-xs text-moss/70">Every user gets a unique ID.</p>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-moss mb-1">
                Password
              </label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-moss mb-1">
                User ID *
              </label>
              <Input
                type="text"
                required
                placeholder="Choose unique ID (e.g. ananya123)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoComplete="username"
                className={
                  idStatus === "taken"
                    ? "border-red-400"
                    : idStatus === "ok"
                      ? "border-sprout"
                      : ""
                }
              />
              <p className={`mt-1 text-xs ${
                idStatus === "taken" ? "text-red-500" : idStatus === "ok" ? "text-sprout-dark" : "text-moss/70"
              }`}>
                {idStatus === "checking"
                  ? "Checking availability…"
                  : idStatus === "taken"
                    ? "This ID is already taken — choose another."
                    : idStatus === "ok"
                      ? "✓ Available — this ID is yours."
                      : "3–24 chars: lowercase, numbers, _ . - — checked live against the database."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-moss mb-1">
                Password *
              </label>
              <Input
                type="password"
                required
                placeholder="At least 4 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-moss mb-1">Full Name</label>
                <Input type="text" placeholder="Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-moss mb-1">Email</label>
                <Input type="email" placeholder="rahul@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-moss mb-1">Phone Number</label>
              <Input type="text" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div>
              <label className="block text-xs font-medium text-moss mb-1">Delivery Address</label>
              <Input type="text" placeholder="House/Flat, Street" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-moss mb-1">City</label>
                <Input type="text" placeholder="Delhi" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-moss mb-1">State</label>
                <Input type="text" placeholder="Delhi" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-moss mb-1">Pincode</label>
                <Input type="text" placeholder="110001" value={pincode} onChange={(e) => setPincode(e.target.value)} />
              </div>
            </div>

            <div className="pt-3">
              <Button type="submit" disabled={loading || idStatus === "taken"} className="w-full">
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
