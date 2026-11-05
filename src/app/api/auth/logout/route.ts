import { NextResponse } from "next/server";
import { clearAccountCookie } from "@/lib/auth/account";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  await clearAccountCookie();
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
