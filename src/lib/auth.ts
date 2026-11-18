import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "ln_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * The owner's dashboard password. MUST be set via DASHBOARD_PASSWORD.
 * Returns null when unset — in that case authentication is refused entirely
 * (no insecure default). A dev-only fallback keeps local work friction-free.
 */
export function getPassword(): string | null {
  const pw = process.env.DASHBOARD_PASSWORD;
  if (pw && pw.length > 0) return pw;
  // Local development convenience only — never in production.
  if (process.env.NODE_ENV !== "production") return "dev";
  return null;
}

/** Secret used to sign the session cookie. */
function getSecret(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const pw = getPassword();
  // Derive from the password so the app works without a separate secret.
  // If no password is configured, use a random per-process value so cookies
  // signed now can't be forged with a predictable key (they simply won't
  // survive a restart, which is fine — login is refused without a password).
  return pw ? `ln::${pw}` : `ln::${RANDOM_FALLBACK}`;
}

const RANDOM_FALLBACK = crypto.randomUUID();

function sign(value: string): string {
  const mac = crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${mac}`;
}

function verify(signed: string | undefined): boolean {
  if (!signed) return false;
  const idx = signed.lastIndexOf(".");
  if (idx < 0) return false;
  const value = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
  // constant-time compare
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Validate a submitted password against the configured one (constant-time). */
export function checkPassword(submitted: string): boolean {
  const expected = getPassword();
  // No password configured → refuse all logins (fail safe, no default).
  if (!expected) return false;
  // Hash both sides to equal-length digests so timingSafeEqual never throws
  // and length isn't leaked.
  const a = crypto.createHash("sha256").update(submitted).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

/** Whether a dashboard password is configured at all. */
export function isConfigured(): boolean {
  return getPassword() !== null;
}

export async function createSession(): Promise<void> {
  const token = sign(`owner:${Date.now()}`);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return verify(jar.get(COOKIE)?.value);
}
