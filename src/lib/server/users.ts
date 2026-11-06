import "server-only";
import { randomUUID } from "node:crypto";
import { getSupabaseServer, isSupabaseServerConfigured } from "@/lib/services/supabase-server";
import { hashPassword } from "@/lib/auth/passwords";

/**
 * Ensure an `ecobrew_users` row exists for an authenticated caller.
 *
 * The orders table has `user_id NOT NULL REFERENCES ecobrew_users(user_id)`,
 * so any authenticated identity — including a Google OAuth user, who never
 * registers a local account — must have a matching row before checkout can
 * insert an order. This upsert is idempotent and never overwrites an existing
 * row (e.g. a local account that happens to share a derived user_id).
 *
 * For Google users we store a random, unguessable scrypt hash rather than a
 * known password, so the row can never be used to sign in via /api/auth/login.
 */
export async function ensureUserRow(input: {
  userId: string;
  name?: string;
  email?: string;
}): Promise<boolean> {
  if (!isSupabaseServerConfigured() || !input.userId) return false;
  try {
    const { error } = await getSupabaseServer()
      .from("ecobrew_users")
      .upsert(
        {
          user_id: input.userId,
          password: await hashPassword(randomUUID()),
          name: input.name ?? "",
          email: input.email ?? "",
        },
        { onConflict: "user_id", ignoreDuplicates: true },
      );
    return !error;
  } catch {
    return false;
  }
}
