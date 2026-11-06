import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/services/supabase-server";
import { getAccountSession } from "@/lib/auth/account";
import { getSessionUser } from "@/lib/auth/session";
import { ensureUserRow } from "@/lib/server/users";
import type { CartItem, CustomerDetails } from "@/lib/types";

function generateOrderId(): string {
  return `ECB-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

function validCustomer(c: Partial<CustomerDetails>): c is CustomerDetails {
  return Boolean(c.name && c.email && c.address && c.city && c.state && c.pincode);
}

function cleanItems(raw: unknown): CartItem[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const items: CartItem[] = [];
  for (const it of raw) {
    if (!it || typeof it !== "object") return null;
    const { slug, qty } = it as { slug?: unknown; qty?: unknown };
    if (typeof slug !== "string" || slug.trim() === "") return null;
    if (!Number.isInteger(qty) || (qty as number) <= 0 || (qty as number) > 1000) return null;
    items.push({ slug, qty: qty as number });
  }
  return items;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      items?: unknown;
      customer?: Partial<CustomerDetails>;
    };

    const items = cleanItems(body.items);
    if (!items) {
      return NextResponse.json(
        { ok: false, error: "Your cart is empty or contains invalid quantities." },
        { status: 400 },
      );
    }
    if (!body.customer || !validCustomer(body.customer)) {
      return NextResponse.json(
        { ok: false, error: "Complete shipping details are required." },
        { status: 400 },
      );
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
      return NextResponse.json(
        { ok: false, error: "Supabase server is not configured." },
        { status: 500 },
      );
    }

    // Defense-in-depth: make sure the FK target row exists for any auth path.
    await ensureUserRow({ userId, name: account?.name || google?.name, email: account?.email || google?.email });

    // Server-side validation: load products from the DB and recompute the total.
    // Never trust the client-sent subtotal.
    const slugs = items.map((i) => i.slug);
    const sb = getSupabaseServer();
    const { data: rows, error: rowsError } = await sb
      .from("ecobrew_products")
      .select("slug, price, in_stock")
      .in("slug", slugs);

    if (rowsError) {
      return NextResponse.json({ ok: false, error: rowsError.message }, { status: 500 });
    }
    const bySlug = new Map<string, { price: number; inStock: boolean }>();
    for (const row of rows ?? []) {
      bySlug.set(row.slug, { price: Number(row.price), inStock: row.in_stock !== false });
    }
    for (const item of items) {
      const product = bySlug.get(item.slug);
      if (!product) {
        return NextResponse.json(
          { ok: false, error: `Unknown product: ${item.slug}` },
          { status: 400 },
        );
      }
      if (!product.inStock) {
        return NextResponse.json(
          { ok: false, error: `"${item.slug}" is out of stock.` },
          { status: 409 },
        );
      }
    }
    const subtotal = Math.round(
      items.reduce((sum, it) => sum + (bySlug.get(it.slug)!.price * it.qty), 0) * 100,
    ) / 100;

    const order = {
      id: generateOrderId(),
      user_id: userId,
      items,
      subtotal,
      customer: body.customer,
      created_at: new Date().toISOString(),
      status: "pending",
      delivery_date: null,
    };

    const { error } = await sb.from("ecobrew_orders").insert([order]);
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
