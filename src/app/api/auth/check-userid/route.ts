import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/services/supabase-server";

export async function GET(req: NextRequest) {
  const userId = (req.nextUrl.searchParams.get("userId") ?? "").trim().toLowerCase();
  if (!userId || !/^[a-z0-9_.-]{3,24}$/.test(userId)) {
    return NextResponse.json({ taken: false });
  }
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ taken: false });
  }
  try {
    const { data } = await getSupabaseServer()
      .from("ecobrew_users")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    return NextResponse.json({ taken: Boolean(data) });
  } catch {
    return NextResponse.json({ taken: false });
  }
}
