export interface GeocodeResult {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

async function fromNominatim(latitude: number, longitude: number): Promise<GeocodeResult> {
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
    const state = a.state || a.region || a.state_district || "";
    const pincode = a.postcode || data?.postcode || "";
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
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return {};

    const d = await res.json();
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
 * keyless providers in parallel (OpenStreetMap Nominatim + BigDataCloud) and
 * merges the best fields from whichever respond, so a single provider being
 * slow, rate-limited, or down doesn't leave the form empty. Fails gracefully
 * to an empty object.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
  const [a, b] = await Promise.all([
    fromNominatim(latitude, longitude),
    fromBigDataCloud(latitude, longitude),
  ]);
  return merge(a, b);
}
