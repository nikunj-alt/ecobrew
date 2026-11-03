import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForUser } from "@/lib/auth/google";
import { setSessionCookie, clearSessionCookie, SessionUser } from "@/lib/auth/session";

/** Derive the stable EcoBrew account id from the verified Google email. */
function userIdFromEmail(email: string): string {
  const local = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
  return local.length >= 3 ? local.slice(0, 24) : `g_${email.slice(0, 20).replace(/[^a-z0-9_-]/g, "")}`;
}

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    const code = params.get("code");
    const returnedState = params.get("state");
    const error = params.get("error");

    if (error) {
      console.warn("Google OAuth error:", error);
      return NextResponse.redirect(new URL("/?auth=error=declined", req.url));
    }
    if (!code || !returnedState) {
      return NextResponse.redirect(new URL("/?auth=error=missing", req.url));
    }

    const jar = await cookies();
    const storedState = jar.get("ecobrew_oauth")?.value;
    if (!storedState) {
      return NextResponse.redirect(new URL("/?auth=error=invalid", req.url));
    }

    // state carries a bundled PKCE verifier (and optional `from` target).
    const parts = storedState.split(".");
    let verifier = storedState;
    let fromTarget: string | null = null;
    if (parts.length === 2) {
      try {
        const decoded = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
        if (decoded && typeof decoded.v === "string") verifier = decoded.v;
        if (decoded && typeof decoded.from === "string") fromTarget = decoded.from;
      } catch {
        /* malformed — fall through with plain state verification below */
      }
    }
    if (verifier !== returnedState) {
      return NextResponse.redirect(new URL("/?auth=error=state", req.url));
    }

    jar.delete("ecobrew_oauth");

    // Server-side exchange; never trust anything from the client beyond `code`.
    const userInfo = await exchangeCodeForUser(code, verifier);
    if (!userInfo.email_verified) {
      return NextResponse.redirect(new URL("/?auth=error=email", req.url));
    }

    const sessionUser: SessionUser = {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name || userInfo.email.split("@")[0],
      picture: userInfo.picture,
      userId: userIdFromEmail(userInfo.email),
    };
    await setSessionCookie(sessionUser);

    // Route the user back where they started.
    let target = "/";
    if (fromTarget && fromTarget.startsWith("/") && !fromTarget.startsWith("//")) {
      target = fromTarget.slice(0, 512);
    }
    return NextResponse.redirect(new URL(target, req.url));
  } catch (e) {
    console.error("OAuth callback failed:", e);
    await clearSessionCookie().catch(() => {});
    return NextResponse.redirect(new URL("/?auth=error=server", req.url));
  }
}
