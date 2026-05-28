import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const USER_COOKIE = "riftbound_session";
const SECRET = () => {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET environment variable is required");
  return s;
};

function sign(payload: string): string {
  const hmac = crypto.createHmac("sha256", SECRET());
  hmac.update(payload);
  return `${payload}.${hmac.digest("hex")}`;
}

function verify(token: string): string | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = token.substring(0, dot);
  if (token !== sign(payload)) return null;
  return payload;
}

export async function createUserSession(userId: string): Promise<string> {
  const payload = `${userId}:${Date.now()}:${crypto.randomBytes(8).toString("hex")}`;
  return sign(payload);
}

export async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE)?.value;
  if (!token) return null;

  const payload = verify(token);
  if (!payload) return null;

  const userId = payload.split(":")[0];
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export function getUserSessionCookieName() {
  return USER_COOKIE;
}
