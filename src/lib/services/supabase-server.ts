import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client authenticated with the service_role key.
 *
 * service_role bypasses Row Level Security, so it must ONLY ever be used
 * inside API routes / server code that has already authenticated the caller
 * (e.g. the HMAC session cookie or the admin cookie). It is never shipped to
 * the browser.
 *
 * Required env: SUPABASE_URL (the NEXT_PUBLIC_* one is also accepted for the
 * URL only) and SUPABASE_SERVICE_ROLE_KEY.
 */

let cached: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (and SUPABASE_URL) must be set on the server to persist data.",
    );
  }

  cached = createClient(url.replace(/\/+$/, ""), serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseServerConfigured(): boolean {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
