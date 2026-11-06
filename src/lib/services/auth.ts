/**
 * Client-side auth helpers — a thin, safe subset of the former service.
 *
 * Everything that touched Supabase directly or stored credentials in the
 * browser has been removed. The app authenticates via server API routes
 * (/api/auth/*), which set httpOnly cookies; this module only mirrors the
 * verified identity locally for UI rendering, and never stores passwords.
 */

export interface UserAccount {
  userId: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  /** Which identity the server verified: "account" (local) or "google". */
  provider?: string;
}

/** Normalize a user-chosen ID: lowercase, trimmed, restricted charset. */
export function normalizeUserId(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUserId(id: string): boolean {
  return /^[a-z0-9_.-]{3,24}$/.test(id);
}

const LOCAL_SESSION_KEY = "ecobrew_current_user";

/** Strip any credential fields before persisting (never store passwords). */
function sanitize(user: UserAccount): UserAccount {
  const copy = { ...user };
  delete copy.password;
  return copy;
}

/**
 * Read the locally cached identity. Only used to enrich the server-verified
 * `/api/auth/me` response with profile details — never as a source of truth.
 */
export function getLoggedInUser(): UserAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      sessionStorage.getItem(LOCAL_SESSION_KEY) || localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLoggedInUser(user: UserAccount | null) {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      sessionStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sanitize(user)));
    } else {
      sessionStorage.removeItem(LOCAL_SESSION_KEY);
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch {}
}
