import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type SessionUser = {
  /** Google's stable subject id (sub claim). */
  sub: string;
  email: string;
  name: string;
  picture?: string;
  /** EcoBrew account id (email-derived) used to key orders in ecobrew_users. */
  userId: string;
};

export const SESSION_COOKIE = "ecobrew_session";
export const ADMIN_COOKIE = "ecobrew_admin";
const USER_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const ADMIN_MAX_AGE = 60 * 60 * 8; // 8 hours

function secret(): string {
  const s = process.env.ECOBREW_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ECOBREW_SESSION_SECRET must be set (>=16 chars) to sign session cookies.",
    );
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/**
 * Encode a compact, HMAC-signed token: <b64(payload)>.<b64(sig)>.
 * An `exp` (unix seconds) claim is appended, so tokens self-expire even if a
 * captured value outlives its cookie.
 */
export function encodeToken(payload: Record<string, unknown>, maxAgeSeconds = USER_MAX_AGE): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSeconds }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Verify signature and expiry; returns the decoded payload, or null. */
export function decodeToken(token: string): Record<string, unknown> | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as Record<string, unknown>;
    const exp = payload.exp;
    if (typeof exp === "number" && exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Encode a SessionUser token (used for the ecobrew_session cookie). */
export function encodeSession(user: SessionUser): string {
  return encodeToken({ ...user }, USER_MAX_AGE);
}

/** Verify signature, expiry, and the required user fields. */
export function decodeSession(token: string): SessionUser | null {
  const payload = decodeToken(token);
  if (!payload || typeof payload.sub !== "string" || typeof payload.email !== "string") {
    return null;
  }
  return {
    sub: payload.sub,
    email: payload.email,
    name: typeof payload.name === "string" ? payload.name : "",
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
    userId: typeof payload.userId === "string" ? payload.userId : "",
  };
}

async function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, encodeSession(user), await cookieOptions(USER_MAX_AGE));
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? decodeSession(token) : null;
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/* ----------------------------- Admin session ----------------------------- */

export async function setAdminCookie(): Promise<void> {
  (await cookies()).set(
    ADMIN_COOKIE,
    encodeToken({ role: "admin" }, ADMIN_MAX_AGE),
    await cookieOptions(ADMIN_MAX_AGE),
  );
}

export async function isAdminAuthed(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const payload = decodeToken(token);
  return payload?.role === "admin";
}

export async function clearAdminCookie(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}
