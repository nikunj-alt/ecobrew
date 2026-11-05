import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/guards";
import { getSupabaseServer } from "@/lib/services/supabase-server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;
  const { id } = await params;
  try {
    const body = (await req.json().catch(() => ({}))) as { date?: string | null };
    const date = typeof body.date === "string" && body.date ? new Date(body.date).toISOString() : null;
    if (date === null && body.date !== null && body.date !== undefined) {
      return NextResponse.json({ ok: false, error: "Invalid date." }, { status: 400 });
    }
    const { error } = await getSupabaseServer()
      .from("ecobrew_orders")
      .update({ delivery_date: date, status: date ? "in_transit" : "approved" })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
