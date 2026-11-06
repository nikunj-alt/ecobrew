export interface GeocodeResult {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

/**
 * Reverse-geocodes lat/lng into human-readable address parts using the free
 * OpenStreetMap Nominatim endpoint (no API key required). Returns an empty
 * object on any failure so callers degrade gracefully.
 *
 * Note: Nominatim asks that clients include a valid referer and stay under
 * ~1 request/second. This is only hit on explicit button taps, so it's fine.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1` +
      `&lat=${latitude}&lon=${longitude}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return {};

    const data = await res.json();
    const a: Record<string, string> = data?.address ?? {};

    const street = [a.house_number, a.road].filter(Boolean).join(" ");
    const area = a.neighbourhood || a.suburb || a.residential || a.district || a.borough || "";
    const city = a.city || a.town || a.village || a.county || a.municipality || "";
    const state = a.state || a.region || "";
    const pincode = a.postcode || "";

    const address = [street, area].filter(Boolean).join(", ");

    return {
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      pincode: pincode || undefined,
    };
  } catch {
    return {};
  }
}
