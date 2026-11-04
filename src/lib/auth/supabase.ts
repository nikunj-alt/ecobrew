import { createHash, randomBytes } from "node:crypto";

/**
 * Server-side Supabase Auth helpers.
 *
 * The whole Google OAuth flow is delegated to Supabase Auth:
 *   1. Our server creates a PKCE pair and redirects the browser to
 *      `${SUPABASE_URL}/auth/v1/authorize?provider=google&code_challenge=...&code_challenge_method=S256`
 *   2. Supabase sends the user to Google and back.
 *   3. Supabase redirects to our `/auth/callback?code=<auth_code>`.
 *   4. Our server exchanges the auth code for tokens using the
 *      verifier that never left the server, then derives the verified
 *      profile from the response. Nothing from the client is trusted:
 *      the code, verifier and cookie are all server-side inputs.
 */

export interface SupabaseAuthConfig {
  url: string;
  anonKey: string;
}

export function requireSupabaseAuthConfig(): SupabaseAuthConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) must be set.",
    );
  }
  return { url: url.replace(/\/+$/, ""), anonKey };
}

/** RFC 7636 PKCE pair: verifier stays server-side, challenge goes in the authorize URL. */
export function createPkcePair() {
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256")
    .update(verifier)
    .digest("base64url")
    .replace(/=+$/, "");
  return { verifier, challenge };
}

export function buildSupabaseAuthorizeUrl(
  redirectTo: string,
  challenge: string,
): string {
  const { url, anonKey } = requireSupabaseAuthConfig();
  const params = new URLSearchParams({
    provider: "google",
    code_challenge: challenge,
    code_challenge_method: "S256",
    redirect_to: redirectTo,
  });
  return `${url}/auth/v1/authorize?${params.toString()}`;
}

export interface SupabaseAuthUserMetadata {
  full_name?: string;
  name?: string;
  user_name?: string;
  avatar_url?: string;
  picture?: string;
  email_verified?: boolean;
}

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: SupabaseAuthUserMetadata;
}

export interface SupabaseTokenResponse {
  access_token: string;
  refresh_token: string;
  user?: SupabaseAuthUser;
}

/**
 * Exchange the auth code Supabase returned to /auth/callback for tokens and
 * the verified user profile, using the server-held PKCE verifier.
 */
export async function exchangeSupabaseCode(
  authCode: string,
  verifier: string,
): Promise<SupabaseTokenResponse> {
  const { url, anonKey } = requireSupabaseAuthConfig();
  const tokenRes = await fetch(
    `${url}/auth/v1/token?grant_type=pkce`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        auth_code: authCode,
        code_verifier: verifier,
      }),
    },
  );
  const data = (await tokenRes.json().catch(() => ({}))) as
    | Partial<SupabaseTokenResponse>
    | Record<string, string>;

  if (!tokenRes.ok || !("access_token" in data)) {
    throw new Error(
      `Supabase token exchange failed (${tokenRes.status}).`,
    );
  }
  const tokenData = data as SupabaseTokenResponse;
  if (!tokenData.user?.id) throw new Error("Supabase token response has no user.");
  return tokenData;
}
