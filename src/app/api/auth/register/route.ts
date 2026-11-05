import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/services/supabase-server";
import { hashPassword } from "@/lib/auth/passwords";
import { setAccountCookie } from "@/lib/auth/account";

const USER_ID_RE = /^[a-z0-9_.-]{3,24}$/;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      userId?: string;
      password?: string;
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };

    const userId = (body.userId ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!USER_ID_RE.test(userId)) {
      return NextResponse.json(
        { ok: false, error: "User ID must be 3–24 chars: lowercase letters, numbers, _ . - only." },
        { status: 400 },
      );
    }
    if (password.length < 4) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 4 characters." },
        { status: 400 },
      );
    }
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json({ ok: false, error: "Supabase server is not configured." }, { status: 500 });
    }

    const sb = getSupabaseServer();

    const { data: existing } = await sb.from("ecobrew_users").select("user_id").eq("user_id", userId).maybeSingle();
    if (existing) {
      return NextResponse.json(
        { ok: false, error: `User ID "${userId}" is already taken. Every user must have a unique ID.` },
        { status: 409 },
      );
    }

    const { error } = await sb.from("ecobrew_users").insert([
      {
        user_id: userId,
        password: await hashPassword(password),
        name: body.name ?? "",
        email: body.email ?? "",
        phone: body.phone ?? "",
        address: body.address ?? "",
        city: body.city ?? "",
        state: body.state ?? "",
        pincode: body.pincode ?? "",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { ok: false, error: `User ID "${userId}" is already taken.` },
          { status: 409 },
        );
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    await setAccountCookie({
      userId,
      name: body.name ?? "",
      email: body.email ?? "",
    });
    return NextResponse.json({ ok: true, userId });
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
