import "server-only";
import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth/session";

/**
 * Guard for admin-only API routes. Returns a 401 Response when the caller
 * isn't authenticated as admin, otherwise null (caller may proceed).
 */
export async function adminGuard(): Promise<NextResponse | null> {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  return null;
}
