import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function GET() {
  await clearSessionCookie();
  const res = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  return res;
}
