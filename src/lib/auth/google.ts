import { createHash, randomBytes, createVerify, createPublicKey } from "node:crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

export function requireGoogleConfig() {
  const url = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  const redirect = process.env.GOOGLE_REDIRECT_URI;
  if (!url || !secret || !redirect) {
    throw new Error(
      "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI must be set.",
    );
  }
  return { clientId: url, clientSecret: secret, redirectUri: redirect };
}

/** RFC 7636 PKCE pair: code challenge stored on the client, verifier sent at token time. */
export function createPkcePair() {
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256")
    .update(verifier)
    .digest("base64url")
    .replace(/=+$/, "");
  return { verifier, challenge };
}

export function buildAuthUrl(state: string, challenge: string): string {
  const { clientId, redirectUri } = requireGoogleConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "online",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

/**
 * Exchange an authorization code for tokens, then verify the ID token with
 * Google's published JWKS and return the verified profile. Never trusts the
 * client: the code, verifier and nonce are all server-side inputs.
 */
export async function exchangeCodeForUser(
  code: string,
  verifier: string,
): Promise<GoogleUserInfo> {
  const { clientId, clientSecret, redirectUri } = requireGoogleConfig();
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  const tokenData = await tokenRes.json().catch(() => ({}));
  if (!tokenRes.ok || !tokenData.id_token) {
    throw new Error(`Google token exchange failed (${tokenRes.status}).`);
  }
  return verifyIdToken(tokenData.id_token);
}

/** Verify the JWT signature against Google's JWKS, plus iss/aud/exp checks. */
async function verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
  const { clientId } = requireGoogleConfig();
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid ID token shape.");

  const header = JSON.parse(
    Buffer.from(parts[0], "base64url").toString("utf8"),
  ) as { alg?: string; kid?: string };
  if (header.alg !== "RS256") throw new Error("Unexpected ID token alg.");
  const payload = JSON.parse(
    Buffer.from(parts[1], "base64url").toString("utf8"),
  ) as any;
  if (payload.aud !== clientId) throw new Error("ID token audience mismatch.");
  if (payload.iss !== "https://accounts.google.com" && payload.iss !== "accounts.google.com") {
    throw new Error("ID token issuer mismatch.");
  }
  const exp = Number(payload.exp ?? 0);
  if (!exp || Date.now() / 1000 >= exp) throw new Error("ID token expired.");
  if (payload.iat && Date.now() / 1000 < Number(payload.iat) - 300) {
    throw new Error("ID token issued in the future.");
  }

  // Fetch Google's public signing keys and verify the RS256 signature.
  const certsRes = await fetch(GOOGLE_JWKS_URL);
  const { keys } = (await certsRes.json()) as { keys: Array<Record<string, string>> };
  const key = keys.find((k) => k.kid === header.kid);
  if (!key) throw new Error("No matching Google signing key.");

  const verify = createVerify("RSA-SHA256");
  verify.update(`${parts[0]}.${parts[1]}`);
  verify.end();
  const publicKey = createPublicKey({
    key: { kty: "RSA", n: key.n, e: key.e },
    format: "jwk",
  });
  if (!verify.verify(publicKey, Buffer.from(parts[2], "base64url"))) {
    throw new Error("ID token signature invalid.");
  }

  return {
    sub: String(payload.sub),
    email: String(payload.email ?? ""),
    email_verified: Boolean(payload.email_verified),
    name: String(payload.name ?? ""),
    picture: typeof payload.picture === "string" ? payload.picture : undefined,
  };
}
