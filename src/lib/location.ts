export interface GeocodeResult {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const FETCH_TIMEOUT_MS = 7000;

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fromNominatim(latitude: number, longitude: number): Promise<GeocodeResult> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1` +
      `&lat=${latitude}&lon=${longitude}`;
    const data = (await fetchJson(url)) as {
      postcode?: string;
      address?: Record<string, string>;
    } | null;
    if (!data) return {};

    const a = data.address ?? {};
    const street = [a.house_number, a.road].filter(Boolean).join(" ");
    const area = a.neighbourhood || a.suburb || a.residential || a.district || a.borough || "";
    const city = a.city || a.town || a.village || a.county || a.municipality || "";
    const state = a.state || a.region || a.state_district || "";
    const pincode = a.postcode || data.postcode || "";
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

async function fromBigDataCloud(latitude: number, longitude: number): Promise<GeocodeResult> {
  try {
    const url =
      `https://api.bigdatacloud.net/data/reverse-geocode-client` +
      `?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const d = (await fetchJson(url)) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      principalSubdivisionCode?: string;
      postcode?: string;
      houseNumber?: string;
      street?: string;
    } | null;
    if (!d) return {};

    const city = d.city || d.locality || d.principalSubdivision || "";
    const state = d.principalSubdivision || d.principalSubdivisionCode || "";
    const pincode = d.postcode || "";
    const street = [d.houseNumber, d.street].filter(Boolean).join(" ");
    const address = [street, d.locality || d.city].filter(Boolean).join(", ");

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

function merge(a: GeocodeResult, b: GeocodeResult): GeocodeResult {
  return {
    address: a.address || b.address,
    city: a.city || b.city,
    state: a.state || b.state,
    pincode: a.pincode || b.pincode,
  };
}

/**
 * Reverse-geocodes lat/lng into human-readable address parts. Tries two free
 * keyless providers in parallel (OpenStreetMap Nominatim + BigDataCloud), each
 * with its own timeout, and merges the best fields from whichever respond. A
 * slow or unreachable provider can never block the result. Fails gracefully to
 * an empty object.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
  const [a, b] = await Promise.allSettled([
    fromNominatim(latitude, longitude),
    fromBigDataCloud(latitude, longitude),
  ]);
  return merge(
    a.status === "fulfilled" ? a.value : {},
    b.status === "fulfilled" ? b.value : {},
  );
}
