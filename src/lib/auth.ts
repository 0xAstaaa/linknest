import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "ln_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** The owner's dashboard password. Set DASHBOARD_PASSWORD in your env. */
export function getPassword(): string {
  return process.env.DASHBOARD_PASSWORD ?? "changeme";
}

/** Secret used to sign the session cookie. Falls back to a value derived
 *  from the password so the app still works without a separate secret. */
function getSecret(): string {
  return process.env.SESSION_SECRET ?? `ln::${getPassword()}`;
}

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
  const a = Buffer.from(submitted);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
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
