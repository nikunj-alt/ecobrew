import { NextRequest, NextResponse } from "next/server";
import { createPkcePair, buildAuthUrl } from "@/lib/auth/google";

export async function GET(req: NextRequest) {
  try {
    const { verifier, challenge } = createPkcePair();
    // Bind this flow to a fresh random state; verified on return to block CSRF.
    const state = verifier;

    const from = new URL(req.url).searchParams.get("from");
    if (from) {
      // Remember where to send the user after login (e.g. /checkout).
      const stateExtra = Buffer.from(JSON.stringify({ v: verifier, from })).toString(
        "base64url",
      );
      const url = buildAuthUrl(stateExtra, challenge);
      const res = NextResponse.redirect(url);
      res.cookies.set("ecobrew_oauth", stateExtra, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 600,
      });
      return res;
    }

    const url = buildAuthUrl(state, challenge);
    const res = NextResponse.redirect(url);
    res.cookies.set("ecobrew_oauth", state, {
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
