import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { creerJetonMembre, membreDuJeton } from "@/lib/jeton-signe";

const USER_COOKIE = "riftbound_session";

export async function createUserSession(userId: string): Promise<string> {
  return creerJetonMembre(userId);
}

export async function getUserFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(USER_COOKIE)?.value;
  if (!token) return null;

  const userId = membreDuJeton(token);
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user;
}

export function getUserSessionCookieName() {
  return USER_COOKIE;
}
