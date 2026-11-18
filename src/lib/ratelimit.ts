import { headers } from "next/headers";

/**
 * Lightweight in-memory rate limiting. No external dependencies.
 *
 * Note: serverless instances don't share memory, so this is a per-instance
 * best-effort limiter — it blunts automated abuse (the main threat for a
 * single-tenant site) without a database or Redis. For hard global limits,
 * swap the store for Upstash/Vercel KV behind the same interface.
 */

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

// opportunistic cleanup so the map can't grow unbounded
function sweep(now: number) {
  if (store.size < 5000) return;
  for (const [k, b] of store) if (b.resetAt < now) store.delete(k);
}

/**
 * Returns true if the action is allowed, false if the limit is exceeded.
 * @param key   logical bucket (e.g. "login", "view")
 * @param id    caller identity (e.g. IP)
 * @param limit max actions per window
 * @param windowMs window length in ms
 */
export function rateLimit(key: string, id: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const mapKey = `${key}:${id}`;
  const bucket = store.get(mapKey);

  if (!bucket || bucket.resetAt < now) {
    store.set(mapKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}
