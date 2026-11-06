import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword } from "@/lib/auth/admin-password";
import { isAdminAuthed, setAdminCookie, clearAdminCookie } from "@/lib/auth/session";
import { clientIp, isLockedOut, recordFailure, resetRateLimit } from "@/lib/server/rate-limit";

const KIND = "admin-auth";

/** GET: report whether the requester already holds a valid admin session. */
export async function GET() {
  return NextResponse.json({ authed: await isAdminAuthed() });
}

/** POST { password }: verify and issue an admin cookie. */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const lock = isLockedOut(KIND, ip);
    if (lock.locked) {
      return NextResponse.json(
        { ok: false, error: `Too many attempts. Try again in ${lock.retryAfterSeconds}s.` },
        { status: 429 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as { password?: string };
    const password = typeof body.password === "string" ? body.password : "";
    if (!password || !(await verifyAdminPassword(password))) {
      recordFailure(KIND, ip);
      return NextResponse.json(
        { ok: false, error: "Incorrect password." },
        { status: 401 },
      );
    }

    resetRateLimit(KIND, ip);
    await setAdminCookie();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin auth error", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}

/** DELETE: clear the admin session. */
export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
