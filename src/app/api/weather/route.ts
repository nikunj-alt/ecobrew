import { NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";

// NOTE: reading `request.url` (searchParams) keeps this handler dynamic at
// request time. We deliberately do NOT export `dynamic = "force-dynamic"` —
// Next 16 disallows that segment config when `nextConfig.cacheComponents` is
// enabled, and it's unnecessary here.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latRaw = searchParams.get("lat");
    const lonRaw = searchParams.get("lon");
    const lat = latRaw && Number.isFinite(Number(latRaw)) ? Number(latRaw) : undefined;
    const lon = lonRaw && Number.isFinite(Number(lonRaw)) ? Number(lonRaw) : undefined;
    const data = await fetchWeather(lat, lon);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "weather unavailable" }, { status: 502 });
  }
}
