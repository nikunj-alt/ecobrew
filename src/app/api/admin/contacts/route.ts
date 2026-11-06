import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/guards";
import { getSupabaseServer } from "@/lib/services/supabase-server";
import type { ContactMessage } from "@/lib/types";
import type { ContactRow } from "@/lib/supabase-types";

function mapContact(row: ContactRow): ContactMessage {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name || "",
    email: row.email || "",
    message: row.message || "",
    reply: row.reply || "",
    repliedAt: row.replied_at ?? null,
    createdAt: row.created_at,
  };
}

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const { data, error } = await getSupabaseServer()
      .from("ecobrew_contacts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, contacts: (data || []).map(mapContact) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
