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
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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

/** Encode a compact, HMAC-signed session token: <b64(payload)>.<b64(sig)> */
export function encodeSession(user: SessionUser): string {
  const body = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Verify signature and decode; returns null on tamper or expiry-absent/invalid. */
export function decodeSession(token: string): SessionUser | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

async function cookieOptions(maxAge?: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAge ?? MAX_AGE,
  };
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, encodeSession(user), await cookieOptions());
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? decodeSession(token) : null;
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
