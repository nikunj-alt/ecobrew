import "server-only";
import { hashPassword, verifyPassword } from "./passwords";

/**
 * The admin password is stored ONLY as an scrypt hash in the server-only env
 * var ADMIN_PASSWORD_HASH. There is no hardcoded default and no
 * NEXT_PUBLIC_ exposure. Generate a hash with:
 *
 *   node -e "const{scryptSync,randomBytes}=require('crypto');const s=randomBytes(16).toString('base64');const h=scryptSync(process.argv[1],s,64).toString('base64');console.log('scrypt:'+s+':'+h)" 'your-password'
 *
 * If ADMIN_PASSWORD_HASH is missing, the admin panel fails closed (login is
 * impossible), which is safer than a guessable default.
 */

export function getAdminPasswordHash(): string | null {
  return process.env.ADMIN_PASSWORD_HASH || null;
}

export async function verifyAdminPassword(plain: string): Promise<boolean> {
  const stored = getAdminPasswordHash();
  if (!stored) return false;
  return verifyPassword(plain, stored);
}

/** Used to generate a fresh hash (dev / setup convenience). */
export function hashAdminPassword(plain: string): Promise<string> {
  return hashPassword(plain);
}
