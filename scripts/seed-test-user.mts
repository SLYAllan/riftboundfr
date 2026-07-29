/**
 * Crée un utilisateur de test LOCAL pour auditer /profil et /collection, qui sont
 * derrière l'authentification Discord et qu'aucun balayage anonyme ne peut atteindre.
 *
 *   npx tsx scripts/seed-test-user.mts          -> crée / met à jour, affiche le cookie
 *   npx tsx scripts/seed-test-user.mts --clean   -> supprime l'utilisateur et ses données
 *
 * Refuse de tourner si DATABASE_URL ne pointe pas sur localhost : cet utilisateur
 * n'a rien à faire en production.
 */
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const DISCORD_ID = "audit-local-test-user";
const prisma = new PrismaClient();

function assertLocal() {
  const url = process.env.DATABASE_URL ?? "";
  if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
    throw new Error(
      `DATABASE_URL ne pointe pas sur localhost, refus d'écrire un utilisateur de test.\n` +
        `Vu : ${url.replace(/:\/\/[^@]*@/, "://***@")}`,
    );
  }
}

async function clean() {
  const user = await prisma.user.findUnique({ where: { discordId: DISCORD_ID } });
  if (!user) return console.log("Rien à supprimer.");
  await prisma.user.delete({ where: { id: user.id } }); // cascade sur binders + collection
  console.log(`Utilisateur de test supprimé (${user.id}).`);
}

async function seed() {
  // --admin pour auditer les pages /admin, qui exigent role === "admin".
  const role = process.argv.includes("--admin") ? "admin" : "user";
  const user = await prisma.user.upsert({
    where: { discordId: DISCORD_ID },
    update: { role },
    create: { discordId: DISCORD_ID, username: "Testeur", discordName: "Testeur#0000", role },
  });

  // Deux classeurs : un rempli, un vide, pour voir aussi l'état vide.
  const rempli = await prisma.binder.upsert({
    where: { shareSlug: "audit-classeur-rempli" },
    update: {},
    create: { userId: user.id, name: "Classeur de test", isPublic: true, shareSlug: "audit-classeur-rempli", position: 0 },
  });
  await prisma.binder.upsert({
    where: { shareSlug: "audit-classeur-vide" },
    update: {},
    create: { userId: user.id, name: "Classeur vide", isPublic: false, shareSlug: "audit-classeur-vide", position: 1 },
  });

  // 40 cartes réelles tirées de la base : jamais de données inventées.
  const cards = await prisma.card.findMany({ take: 40, orderBy: { riftboundId: "asc" }, select: { id: true } });
  for (const [i, c] of cards.entries()) {
    await prisma.collectionItem.upsert({
      where: { binderId_cardId: { binderId: rempli.id, cardId: c.id } },
      update: {},
      create: { userId: user.id, binderId: rempli.id, cardId: c.id, quantity: (i % 3) + 1 },
    });
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET manquant dans .env");
  const payload = `${user.id}:${Date.now()}:${crypto.randomBytes(8).toString("hex")}`;
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  console.log(`userId       ${user.id}`);
  console.log(`cartes       ${cards.length}`);
  console.log(`COOKIE       ${payload}.${hmac}`);
}

assertLocal();
await (process.argv.includes("--clean") ? clean() : seed());
await prisma.$disconnect();
