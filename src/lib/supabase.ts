import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Environment check for Supabase
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[EcoBrew Supabase Warning]: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing. Database persistence and authentication will operate in fallback mode unless environment variables are provided."
  );
}

// Fallback mock client if env vars are not set (for build & local preview without keys)
class MockSupabaseClient {
  auth = {};
  from(table: string) {
    return {
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: "Supabase not configured" } }),
          maybeSingle: async () => ({ data: null, error: null }),
        }),
        order: () => ({ data: [], error: null }),
      }),
      insert: async (data: any) => ({ data, error: null }),
      upsert: async (data: any) => ({ data, error: null }),
    };
  }
}

export const supabase: SupabaseClient | MockSupabaseClient =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : new MockSupabaseClient();

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
