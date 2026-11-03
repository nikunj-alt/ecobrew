"use client";

import { useCallback, useEffect, useState } from "react";

export interface ClientSessionUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  userId: string;
}

/**
 * React hook exposing the server-side Google OAuth session (httpOnly cookie).
 * The id/email are read from /api/session — never stored in localStorage.
 */
export function useSession() {
  const [user, setUser] = useState<ClientSessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/session", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(
    (from?: string) => {
      const q = from ? `?from=${encodeURIComponent(from)}` : "";
      window.location.assign(`/auth/google${q}`);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await fetch("/auth/logout", { method: "GET" });
    setUser(null);
  }, []);

  return { user, loading, refresh, signIn, signOut };
}
