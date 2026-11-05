import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/services/supabase-server";
import { verifyPassword, isHashed, hashPassword } from "@/lib/auth/passwords";
import { setAccountCookie } from "@/lib/auth/account";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { userId?: string; password?: string };
    const userId = (body.userId ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!userId || !password) {
      return NextResponse.json(
        { ok: false, error: "Please enter both User ID and Password." },
        { status: 400 },
      );
    }
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json({ ok: false, error: "Supabase server is not configured." }, { status: 500 });
    }

    const sb = getSupabaseServer();
    const { data, error } = await sb.from("ecobrew_users").select("*").eq("user_id", userId).maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { ok: false, error: `User ID "${userId}" not found. Please register an account first.` },
        { status: 404 },
      );
    }

    const ok = await verifyPassword(password, data.password);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Incorrect password for this User ID." }, { status: 401 });
    }

    // Silently upgrade legacy plaintext passwords to an scrypt hash.
    if (!isHashed(data.password)) {
      await sb.from("ecobrew_users").update({ password: await hashPassword(password) }).eq("user_id", userId);
    }

    const account = {
      userId: data.user_id as string,
      name: (data.name as string) || "",
      email: (data.email as string) || "",
    };
    await setAccountCookie(account);
    return NextResponse.json({ ok: true, user: account });
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
