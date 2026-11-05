import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/guards";
import { getSupabaseServer } from "@/lib/services/supabase-server";
import { mapProductRow } from "@/lib/services/products";
import type { Product } from "@/lib/types";

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const { data, error } = await getSupabaseServer()
      .from("ecobrew_products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, products: (data || []).map(mapProductRow) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const body = (await req.json().catch(() => ({}))) as Partial<Product> & { slug?: string };
    const slug = body.slug?.trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug || !body.name?.trim()) {
      return NextResponse.json({ ok: false, error: "Slug and name are required." }, { status: 400 });
    }
    const { error } = await getSupabaseServer().from("ecobrew_products").upsert([
      {
        slug,
        name: (body.name ?? "").trim(),
        category: body.category ?? "decor",
        price: Number(body.price ?? 0),
        short_description: body.shortDescription ?? "",
        description: body.description ?? "",
        image: body.image || "/logo.png",
        impact: body.impact ?? "",
        in_stock: body.inStock ?? true,
        featured: body.featured ?? false,
        related: body.related ?? [],
      },
    ]);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin product save error", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
