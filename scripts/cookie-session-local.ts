// Signe un cookie de session pour ouvrir une page connectee en local (audit).
// Usage : npx tsx --env-file=.env scripts/cookie-session-local.ts
import { creerJetonMembre } from "../src/lib/jeton-signe";
import { prisma } from "../src/lib/prisma";

async function main() {
  const u = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!u) throw new Error("aucun utilisateur en base");
  console.log(JSON.stringify({ user: u.username, cookie: creerJetonMembre(u.id) }));
  await prisma.$disconnect();
}
main();
