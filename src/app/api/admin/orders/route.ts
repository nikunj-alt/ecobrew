import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/guards";
import { getSupabaseServer } from "@/lib/services/supabase-server";
import type { Order, OrderStatus } from "@/lib/types";

function mapOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal ?? 0),
    customer: row.customer ?? {},
    createdAt: row.created_at,
    status: (row.status as OrderStatus) || "pending",
    deliveryDate: row.delivery_date ?? null,
  };
}

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const { data, error } = await getSupabaseServer()
      .from("ecobrew_orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    const orders = (data || []).map(mapOrder);
    return NextResponse.json({ ok: true, orders });
  } catch (e) {
    console.error("admin orders fetch error", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
