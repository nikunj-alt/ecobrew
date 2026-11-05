"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  getLoggedInUser,
  setLoggedInUser,
  UserAccount,
} from "@/lib/services/auth";

interface AuthState {
  /** The server-verified current identity (local account or Google). */
  user: UserAccount | null;
  /** True while the identity is being loaded from /api/auth/me. */
  loading: boolean;
  /** Re-fetch the identity from the server. */
  refresh: () => Promise<void>;
  /** Begin Google OAuth. */
  signIn: (from?: string) => void;
  /** Clear both the account and Google sessions. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  refresh: async () => {},
  signIn: () => {},
  signOut: async () => {},
});

/**
 * Single source of truth for "who is signed in" on the client.
 *
 * The server's /api/auth/me returns whichever server-verified identity is
 * present — a local account (httpOnly ecobrew_account cookie) or a Google
 * session (httpOnly ecobrew_session cookie). We hydrate that into the same
 * UserAccount shape the rest of the app expects so both login methods work
 * everywhere (header, orders, checkout, contact, in-transit band).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        user?: (Partial<UserAccount> & { provider?: string }) | null;
      };
      const me = data.user ?? null;

      if (!me) {
        // No server identity — clear any stale client-side account.
        setLoggedInUser(null);
        setUser(null);
        return;
      }

      const base: UserAccount = {
        userId: me.userId || "",
        name: me.name || "",
        email: me.email || "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      };

      // For local accounts, enrich with the full profile kept client-side
      // (phone/address/city/state/pincode) when it matches the same userId.
      const local = getLoggedInUser();
      const enriched =
        me.provider === "account" && local && local.userId === base.userId
          ? { ...base, ...local }
          : base;

      setLoggedInUser(enriched);
      setUser(enriched);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback((from?: string) => {
    const q = from ? `?from=${encodeURIComponent(from)}` : "";
    window.location.assign(`/auth/google${q}`);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore network errors — local state is cleared regardless */
    }
    setLoggedInUser(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
