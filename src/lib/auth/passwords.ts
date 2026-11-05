import "server-only";
import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Password hashing built on Node's crypto.scrypt (a memory-hard KDF) — no
 * external dependency. Stored format: "scrypt:<base64 salt>:<base64 key>".
 *
 * Legacy plaintext rows (from the original demo schema) don't match the
 * "scrypt:" prefix, so verifyPassword falls back to a plaintext comparison so
 * the caller can silently upgrade them (see /api/auth/login).
 */

const SCRYPT_PREFIX = "scrypt:";
const KEYLEN = 64;
const SALTLEN = 16;

function scryptHash(plain: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(plain, salt, KEYLEN, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALTLEN);
  const key = await scryptHash(plain, salt);
  return `${SCRYPT_PREFIX}${salt.toString("base64")}:${key.toString("base64")}`;
}

export function isHashed(stored: string): boolean {
  return typeof stored === "string" && stored.startsWith(SCRYPT_PREFIX);
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (isHashed(stored)) {
    try {
      const [saltB64, keyB64] = stored.slice(SCRYPT_PREFIX.length).split(":");
      if (!saltB64 || !keyB64) return false;
      const key = await scryptHash(plain, Buffer.from(saltB64, "base64"));
      const expected = Buffer.from(keyB64, "base64");
      return key.length === expected.length && timingSafeEqual(key, expected);
    } catch {
      return false;
    }
  }
  // Legacy plaintext — compare directly (caller upgrades the row afterwards).
  return stored === plain;
}
