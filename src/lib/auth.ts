import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { getUserFromSession } from "@/lib/session";

export const SESSION_COOKIE = "riftbound_admin";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("SESSION_SECRET or ADMIN_PASSWORD environment variable is required");
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
  return signed === signSession(value);
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
