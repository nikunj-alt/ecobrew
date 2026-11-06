import "server-only";

/**
 * Minimal in-memory brute-force protection for auth endpoints.
 *
 * Tracks consecutive failures per key (client IP and/or user id). After
 * `MAX_FAILURES` failed attempts the key is locked for a cooldown that grows
 * exponentially per subsequent lockout. The store is per-process and
 * intentionally not exported — on a serverless host this is best-effort, not
 * a hard guarantee, but it stops casual online guessing and repeated hammering
 * in a long-lived process.
 */

interface Bucket {
  failures: number;
  lockedUntil: number;
}

const store = new Map<string, Bucket>();
const MAX_FAILURES = 5;
const BASE_LOCKOUT_MS = 10 * 60 * 1000; // 10 min
const MAX_LOCKOUT_MS = 60 * 60 * 1000; // 60 min

function key(kind: string, id: string): string {
  return `${kind}:${id}`;
}

/** Best-effort client IP from forwarded/proxy headers. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim() || "unknown";
  const cf = req.headers.get("cf-connecting-ip");
  return cf || "unknown";
}

/** True if the key is currently locked out; also returns retryAfterSeconds. */
export function isLockedOut(
  kind: string,
  id: string,
): { locked: boolean; retryAfterSeconds: number } {
  const b = store.get(key(kind, id));
  if (!b) return { locked: false, retryAfterSeconds: 0 };
  const now = Date.now();
  if (b.lockedUntil <= now) {
    store.delete(key(kind, id));
    return { locked: false, retryAfterSeconds: 0 };
  }
  return {
    locked: true,
    retryAfterSeconds: Math.ceil((b.lockedUntil - now) / 1000),
  };
}

/** Record a failed attempt; locks the key after MAX_FAILURES. */
export function recordFailure(
  kind: string,
  id: string,
): { locked: boolean; retryAfterSeconds: number } {
  const k = key(kind, id);
  const now = Date.now();
  const b = store.get(k) ?? { failures: 0, lockedUntil: 0 };

  if (b.lockedUntil <= now) {
    // Not currently locked: count this failure (reset a stale counter).
    b.failures = b.failures >= MAX_FAILURES ? 1 : b.failures + 1;
    if (b.failures >= MAX_FAILURES) {
      const cooldown = Math.min(
        BASE_LOCKOUT_MS * Math.pow(2, b.failures - MAX_FAILURES),
        MAX_LOCKOUT_MS,
      );
      b.lockedUntil = now + cooldown;
    } else {
      b.lockedUntil = 0;
    }
  }

  store.set(k, b);
  const locked = b.lockedUntil > now;
  return {
    locked,
    retryAfterSeconds: locked ? Math.ceil((b.lockedUntil - now) / 1000) : 0,
  };
}

/** Clear a key's failure state on successful auth. */
export function resetRateLimit(kind: string, id: string): void {
  store.delete(key(kind, id));
}
