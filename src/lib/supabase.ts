import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Accept both the classic anon key and the newer publishable key format.
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function isRealKey(val: string | undefined): boolean {
  if (!val) return false;
  const s = val.trim().toLowerCase();
  return (
    s.length > 5 &&
    !s.includes("your-") &&
    !s.includes("your_") &&
    !s.includes("placeholder")
  );
}

const isConfigured = isRealKey(supabaseUrl) && isRealKey(supabaseKey);

// Environment check for Supabase
if (!isConfigured) {
  console.warn(
    "[EcoBrew Supabase Warning]: Valid NEXT_PUBLIC_SUPABASE_URL and anon key not provided. Operating in mock fallback mode."
  );
}

// Fallback mock client if env vars are not set (for build & local preview without keys)
class MockSupabaseClient {
  auth = {};
  channel() {
    return {
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
    };
  }
  removeAllChannels() {}
  from(table: string) {
    void table;
    return {
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
        order: () => ({ data: [], error: null }),
      }),
      insert: async (data: Record<string, unknown>[]) => ({ data, error: null }),
      upsert: async (data: Record<string, unknown>[]) => ({ data, error: null }),
    };
  }
}

export const supabase: SupabaseClient | MockSupabaseClient =
  isConfigured && supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : new MockSupabaseClient();

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}
