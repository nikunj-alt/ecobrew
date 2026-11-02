"use client";

import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { loginUser, registerUser, checkUserIdExists, UserAccount } from "@/lib/services/auth";
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
    const taken = await checkUserIdExists(clean);
    setIdStatus(taken ? "taken" : "ok");
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setUserId("");
    setPassword("");
    setIdStatus("idle");
    const t = setTimeout(() => checkId(userId), 400);
    return () => clearTimeout(t);
  }, [isOpen, userId, checkId]);

  if (!isOpen) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await loginUser(userId, password);
    setLoading(false);
    if (res.success && res.user) {
      if (onSuccess) onSuccess(res.user);
      onClose();
    } else {
      setError(res.error || "Login failed.");
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
    // Final uniqueness guarantee right before insert
    if (await checkUserIdExists(cleanId)) {
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

    const res = await registerUser(newAccount);
    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess(newAccount);
      onClose();
    } else {
      setError(res.error || "Registration failed. User ID might already exist.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-oat p-6 shadow-2xl ring-1 ring-leaf-deep/15 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-moss/15">
          <h3 className="font-display text-xl font-medium text-leaf-deep">
            {tab === "login" ? "Customer Account Login" : "Create Account for Ordering"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-moss hover:bg-white/50 hover:text-leaf-deep"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex rounded-xl bg-white/50 p-1">
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
            Register New ID
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
                Unique User ID
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. rahul_eco2026"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoComplete="username"
              />
              <p className="mt-1 text-xs text-moss/70">Every user has a unique ID (no duplicates allowed).</p>
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
                {loading ? "Signing in..." : "Login to Order"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="mt-6 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-moss mb-1">
                Unique User ID (Required) *
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
                {loading ? "Creating Account..." : "Create Account & Continue"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
