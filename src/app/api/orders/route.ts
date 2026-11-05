import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/services/supabase-server";
import { getAccountSession } from "@/lib/auth/account";
import { getSessionUser } from "@/lib/auth/session";
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
  const account = await getAccountSession();
  const google = await getSessionUser();
  const userId = account?.userId || google?.userId;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    const { data, error } = await getSupabaseServer()
      .from("ecobrew_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, orders: (data || []).map(mapOrder) });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
