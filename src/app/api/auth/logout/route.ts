import { NextResponse } from "next/server";
import { clearAccountCookie } from "@/lib/auth/account";

export async function POST() {
  await clearAccountCookie();
  return NextResponse.json({ ok: true });
}
