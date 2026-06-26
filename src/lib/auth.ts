import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { getUserFromSession } from "@/lib/session";

export const SESSION_COOKIE = "riftbound_admin";

// Fenêtre de validité d'une session signée (au-delà, le cookie est rejeté côté serveur).
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function getSessionSecret(): string {
  // PAS de fallback sur ADMIN_PASSWORD (entropie faible) : fail-fast si le secret manque.
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is required");
  return secret;
}

function signSession(value: string): string {
  const hmac = crypto.createHmac("sha256", getSessionSecret());
  hmac.update(value);
  return `${value}.${hmac.digest("hex")}`;
}

function verifySignature(signed: string): boolean {
  const dotIdx = signed.lastIndexOf(".");
  if (dotIdx === -1) return false;
  const value = signed.substring(0, dotIdx);
  if (signed !== signSession(value)) return false;
  // Expiration : payload = `admin:<timestamp>:<nonce>` ; rejette si trop ancien.
  const ts = Number(value.split(":")[1]);
  if (!Number.isFinite(ts) || Date.now() - ts > SESSION_MAX_AGE_MS) return false;
  return true;
}

async function isAdminByPassword(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return false;
  return verifySignature(session.value);
}

async function isAdminByDiscord(): Promise<boolean> {
  const user = await getUserFromSession();
  return user?.role === "admin";
}

export async function verifyAdmin() {
  if (await isAdmin()) return true;
  redirect("/admin/login");
}

export async function isAdmin(): Promise<boolean> {
  return (await isAdminByPassword()) || (await isAdminByDiscord());
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionValue(): string {
  const payload = `admin:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
  return signSession(payload);
}
