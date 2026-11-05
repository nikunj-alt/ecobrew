import { NextRequest, NextResponse } from "next/server";
import { createPkcePair, buildSupabaseAuthorizeUrl } from "@/lib/auth/supabase";

export async function GET(req: NextRequest) {
  try {
    const { verifier, challenge } = createPkcePair();

    // Remember where to send the user after login (e.g. /checkout).
    const from = new URL(req.url).searchParams.get("from");
    const stateExtra = Buffer.from(
      JSON.stringify({ v: verifier, from: from ?? "" }),
    ).toString("base64url");

    // redirect_to must be one of the URLs allowed in the Supabase auth config.
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const redirectTo = `${origin.replace(/\/+$/, "")}/auth/callback`;

    const res = NextResponse.redirect(
      buildSupabaseAuthorizeUrl(redirectTo, challenge),
    );
    res.cookies.set("ecobrew_oauth", stateExtra, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    return res;
  } catch (e) {
    console.error("OAuth start failed:", e);
    return NextResponse.redirect(new URL("/?auth=error", req.url));
  }
}
