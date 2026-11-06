import { NextRequest, NextResponse } from "next/server";
import { adminGuard } from "@/lib/server/guards";
import { getSupabaseServer } from "@/lib/services/supabase-server";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// SVG is deliberately excluded: it can embed scripts, and we serve uploaded
// images from a public bucket, making it a stored-XSS vector.
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;
  try {
    const form = await req.formData();
    const file = form.get("file");
    const slug = (form.get("slug") as string | null)?.trim().toLowerCase().replace(/\s+/g, "-");

    if (!slug) {
      return NextResponse.json({ ok: false, error: "Slug is required." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "No file provided." }, { status: 400 });
    }
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Only PNG, JPEG, WebP or GIF images are allowed." },
        { status: 400 },
      );
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ ok: false, error: "Image must be 5 MB or smaller." }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `${slug.replace(/[^a-z0-9-]/gi, "_")}/${Date.now()}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error } = await getSupabaseServer()
      .storage.from("product-images")
      .upload(path, bytes, { upsert: true, contentType: file.type });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    const { data } = getSupabaseServer().storage.from("product-images").getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data?.publicUrl });
  } catch (e) {
    console.error("admin image upload error", e);
    return NextResponse.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
