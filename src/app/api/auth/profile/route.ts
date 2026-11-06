import { NextRequest, NextResponse } from "next/server";
import { getAccountSession } from "@/lib/auth/account";
import { getSessionUser } from "@/lib/auth/session";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/services/supabase-server";

/**
 * Saves delivery-profile fields (phone/address/city/state/pincode) for the
 * currently authenticated identity — local account or Google. This lets a
 * captured live location follow the user across devices and sessions.
 */
export async function POST(req: NextRequest) {
  try {
    const account = await getAccountSession();
    const google = await getSessionUser();
    const userId = account?.userId ?? google?.userId;
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Not signed in." }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const updatable = ["phone", "address", "city", "state", "pincode"] as const;
    const fields: Record<string, string> = {};
    for (const key of updatable) {
      const value = body[key];
      if (typeof value === "string") fields[key] = value.slice(0, 500);
    }
    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 400 });
    }

    if (!isSupabaseServerConfigured()) {
      return NextResponse.json({ ok: false, error: "Supabase server is not configured." }, { status: 500 });
    }

    const { error } = await getSupabaseServer()
      .from("ecobrew_users")
      .update(fields)
      .eq("user_id", userId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
