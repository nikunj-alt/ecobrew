import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/services/supabase-server";
import { getAccountSession } from "@/lib/auth/account";
import { getSessionUser } from "@/lib/auth/session";
import type { CartItem, CustomerDetails } from "@/lib/types";

function generateOrderId(): string {
  return `ECB-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function validCustomer(c: Partial<CustomerDetails>): c is CustomerDetails {
  return Boolean(c.name && c.email && c.address && c.city && c.state && c.pincode);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      items?: CartItem[];
      subtotal?: number;
      customer?: Partial<CustomerDetails>;
    };

    const items = Array.isArray(body.items) && body.items.length > 0 ? body.items : null;
    if (!items) {
      return NextResponse.json({ ok: false, error: "Your cart is empty." }, { status: 400 });
    }
    if (!body.customer || !validCustomer(body.customer)) {
      return NextResponse.json({ ok: false, error: "Complete shipping details are required." }, { status: 400 });
    }

    // Server-verified identity: local account cookie first, then Google session.
    const account = await getAccountSession();
    const google = await getSessionUser();
    const userId = account?.userId || google?.userId;
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "An account is required to place an order." },
        { status: 401 },
      );
    }
    if (!isSupabaseServerConfigured()) {
      return NextResponse.json({ ok: false, error: "Supabase server is not configured." }, { status: 500 });
    }

    const order = {
      id: generateOrderId(),
      user_id: userId,
      items,
      subtotal: Number(body.subtotal ?? 0),
      customer: body.customer,
      created_at: new Date().toISOString(),
      status: "pending",
      delivery_date: null,
    };

    const { error } = await getSupabaseServer().from("ecobrew_orders").insert([order]);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        userId,
        items: order.items,
        subtotal: order.subtotal,
        customer: order.customer,
        createdAt: order.created_at,
        status: order.status,
        deliveryDate: null,
      },
    });
  } catch (e) {
    console.error("checkout error", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
