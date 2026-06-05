import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSession, getUserSessionCookieName } from "@/lib/session";

// Connexion de test — UNIQUEMENT en développement. Renvoie 404 en production.
// Permet de tester les fonctionnalités liées au compte (collection, likes…)
// sans passer par l'OAuth Discord.
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const user = await prisma.user.upsert({
    where: { discordId: "dev-local-test" },
    update: {},
    create: {
      discordId: "dev-local-test",
      discordName: "testeur",
      username: "Testeur Local",
      role: "user",
    },
  });

  const sessionToken = await createUserSession(user.id);
  // Redirige sur la même origine que la requête (localhost en dev).
  const res = NextResponse.redirect(new URL("/collection", req.url));
  res.cookies.set(getUserSessionCookieName(), sessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
