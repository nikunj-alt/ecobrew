import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeSupabaseCode } from "@/lib/auth/supabase";
import { setSessionCookie, clearSessionCookie, SessionUser } from "@/lib/auth/session";
import { ensureUserRow } from "@/lib/server/users";

/** Derive the stable EcoBrew account id from the verified Supabase email. */
function userIdFromEmail(email: string): string {
  const local = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
  return local.length >= 3 ? local.slice(0, 24) : `g_${email.slice(0, 20).replace(/[^a-z0-9_-]/g, "")}`;
}

function fail(req: NextRequest, reason: string) {
  const url = new URL(req.nextUrl.origin);
  url.pathname = "/";
  url.search = new URLSearchParams({ auth: "error", detail: reason }).toString();
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const code = params.get("code");
    const oauthError = params.get("error_description") || params.get("error");
    if (oauthError) {
      console.warn("Supabase Google OAuth error:", oauthError);
      return fail(req, "declined");
    }
    if (!code) return fail(req, "missing");

    const jar = await cookies();
    const storedState = jar.get("ecobrew_oauth")?.value;
    if (!storedState) return fail(req, "state");

    // The cookie carries the PKCE verifier (and optional `from` target) that
    // never left the server; without it the code can never be exchanged.
    let verifier = "";
    let fromTarget: string | null = null;
    try {
      const decoded = JSON.parse(
        Buffer.from(storedState, "base64url").toString("utf8"),
      );
      if (decoded && typeof decoded.v === "string") verifier = decoded.v;
      if (decoded && typeof decoded.from === "string" && decoded.from)
        fromTarget = decoded.from;
    } catch {
      /* fall through — verifier stays empty and the exchange fails safely */
    }
    if (!verifier) return fail(req, "state");

    jar.delete("ecobrew_oauth");

    // Server-side exchange; the browser only ever contributed `code`.
    const tokens = await exchangeSupabaseCode(code, verifier);
    const supabaseUser = tokens.user!;
    const email = supabaseUser.email;
    const confirmed =
      Boolean(supabaseUser.email_confirmed_at) ||
      supabaseUser.user_metadata?.email_verified === true;
    if (!email || !confirmed) return fail(req, "email");

    const meta = supabaseUser.user_metadata ?? {};
    const sessionUser: SessionUser = {
      sub: supabaseUser.id,
      email,
      name:
        meta.full_name ||
        meta.name ||
        meta.user_name ||
        email.split("@")[0],
      picture: meta.avatar_url || meta.picture,
      userId: userIdFromEmail(email),
    };
    await setSessionCookie(sessionUser);

    // Ensure the FK target exists so this user can place orders (Fix: Google
    // users previously had no ecobrew_users row and checkout hit a FK error).
    await ensureUserRow({
      userId: sessionUser.userId,
      name: sessionUser.name,
      email: sessionUser.email,
    });

    // Route the user back where they started.
    let target = "/";
    if (fromTarget && fromTarget.startsWith("/") && !fromTarget.startsWith("//")) {
      target = fromTarget.slice(0, 512);
    }
    return NextResponse.redirect(new URL(target, req.nextUrl.origin));
  } catch (e) {
    console.error("OAuth callback failed:", e);
    await clearSessionCookie().catch(() => {});
    return fail(req, "server");
  }
}
