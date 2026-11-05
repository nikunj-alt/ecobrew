import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/guards";
import { getSupabaseServer } from "@/lib/services/supabase-server";
import type { OrderStatus } from "@/lib/types";

const VALID: OrderStatus[] = ["pending", "approved", "in_transit", "delivered", "cancelled"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;
  const { id } = await params;
  try {
    const body = (await req.json().catch(() => ({}))) as { status?: string };
    if (!VALID.includes(body.status as OrderStatus)) {
      return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
    }
    const { error } = await getSupabaseServer()
      .from("ecobrew_orders")
      .update({ status: body.status })
      .eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
