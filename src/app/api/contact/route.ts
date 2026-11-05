import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/services/supabase-server";
import { getAccountSession } from "@/lib/auth/account";
import { getSessionUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      message?: string;
    };
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const message = (body.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ ok: false, error: "Name, email and message are required." }, { status: 400 });
    }

    const account = await getAccountSession();
    const google = await getSessionUser();
    const userId = account?.userId || google?.userId || null;

    const { error } = await getSupabaseServer().from("ecobrew_contacts").insert([
      { user_id: userId, name, email, message },
    ]);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("contact submit error", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
