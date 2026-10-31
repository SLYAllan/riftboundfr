import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { getUserFromSession } from "@/lib/session";
import { creerJetonAdmin, jetonAdminValide } from "@/lib/jeton-signe";

export const SESSION_COOKIE = "riftbound_admin";

async function isAdminByPassword(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session?.value) return false;
  return jetonAdminValide(session.value);
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
  return creerJetonAdmin();
}
