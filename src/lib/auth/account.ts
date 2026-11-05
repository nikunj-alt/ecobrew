import "server-only";
import { cookies } from "next/headers";
import { encodeToken, decodeToken } from "./session";

export const ACCOUNT_COOKIE = "ecobrew_account";
const ACCOUNT_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface AccountSession {
  userId: string;
  name: string;
  email: string;
}

/**
 * Server-side session for local (username/password) accounts. Set only after a
 * successful server-side login/register, so server routes can trust it.
 */
export async function setAccountCookie(account: AccountSession): Promise<void> {
  (await cookies()).set(
    ACCOUNT_COOKIE,
    encodeToken({ ...account }, ACCOUNT_MAX_AGE),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ACCOUNT_MAX_AGE,
    },
  );
}

export async function getAccountSession(): Promise<AccountSession | null> {
  const token = (await cookies()).get(ACCOUNT_COOKIE)?.value;
  if (!token) return null;
  const payload = decodeToken(token);
  if (!payload || typeof payload.userId !== "string") return null;
  return {
    userId: payload.userId,
    name: typeof payload.name === "string" ? payload.name : "",
    email: typeof payload.email === "string" ? payload.email : "",
  };
}

export async function clearAccountCookie(): Promise<void> {
  (await cookies()).delete(ACCOUNT_COOKIE);
}
