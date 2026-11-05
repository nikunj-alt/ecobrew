import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/guards";
import { getSupabaseServer } from "@/lib/services/supabase-server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;
  const { id } = await params;
  try {
    const body = (await req.json().catch(() => ({}))) as { reply?: string };
    const reply = typeof body.reply === "string" ? body.reply.trim() : "";
    if (!reply) {
      return NextResponse.json({ ok: false, error: "Reply is empty." }, { status: 400 });
    }
    const { error } = await getSupabaseServer()
      .from("ecobrew_contacts")
      .update({ reply, replied_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
