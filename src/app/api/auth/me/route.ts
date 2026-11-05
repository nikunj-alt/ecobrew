import { NextResponse } from "next/server";
import { getAccountSession } from "@/lib/auth/account";
import { getSessionUser } from "@/lib/auth/session";

/** Return whichever server-verified identity is present (account or Google). */
export async function GET() {
  const account = await getAccountSession();
  const google = await getSessionUser();
  if (account) {
    return NextResponse.json({ user: { ...account, provider: "account" } });
  }
  if (google) {
    return NextResponse.json({ user: { userId: google.userId, name: google.name, email: google.email, provider: "google" } });
  }
  return NextResponse.json({ user: null });
}
