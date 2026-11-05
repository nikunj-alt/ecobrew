import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/guards";
import { getSupabaseServer } from "@/lib/services/supabase-server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;
  const { slug } = await params;
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    if (typeof body.name === "string") updates.name = body.name;
    if (typeof body.category === "string") updates.category = body.category;
    if (typeof body.price === "number") updates.price = body.price;
    if (typeof body.shortDescription === "string") updates.short_description = body.shortDescription;
    if (typeof body.description === "string") updates.description = body.description;
    if (typeof body.image === "string") updates.image = body.image;
    if (typeof body.impact === "string") updates.impact = body.impact;
    if (typeof body.inStock === "boolean") updates.in_stock = body.inStock;
    if (typeof body.featured === "boolean") updates.featured = body.featured;
    if (body.related !== undefined) updates.related = body.related;

    const { error } = await getSupabaseServer()
      .from("ecobrew_products")
      .update(updates)
      .eq("slug", slug);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const guard = await adminGuard();
  if (guard) return guard;
  const { slug } = await params;
  try {
    const { error } = await getSupabaseServer().from("ecobrew_products").delete().eq("slug", slug);
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
