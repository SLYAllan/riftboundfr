/**
 * Remplace les codes cartes des fiches Légendes par le vrai nom de la carte.
 *
 * Les fiches ont été rédigées avec des codes (« Matchup Aurora (OGN-160) »). La
 * page résout ceux des cartes clés, mais pas ceux noyés dans une phrase : le
 * lecteur tombait sur « OGN-160 » au milieu d'un texte français. On les remplace
 * à la source, une fois pour toutes.
 *
 *   npx tsx --env-file=.env scripts/fiches-codes.mts [--ecrire]
 *
 * Un code introuvable en base n'est pas touché et ressort dans le rapport : mieux
 * vaut un code visible qu'un nom inventé.
 */
import { promises as fs } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const FICHES = path.join(process.cwd(), "data", "fiches");
const ecrire = process.argv.includes("--ecrire");
const CODE = /\b[A-Z]{2,4}-\d{3}\b/g;

const prisma = new PrismaClient();
// « OGN-160 » n'est pas un riftboundId (ogn-160-298) : c'est le set plus le numéro
// de collection. Les impressions alternées portent le même numéro, on garde l'originale.
const cartes = await prisma.card.findMany({
  select: { set: true, collectorNumber: true, name: true, alternateArt: true, overnumbered: true },
  orderBy: [{ alternateArt: "asc" }, { overnumbered: "asc" }],
});
const nom = new Map<string, string>();
for (const c of cartes) {
  if (c.collectorNumber == null) continue;
  const code = `${c.set.toUpperCase()}-${String(c.collectorNumber).padStart(3, "0")}`;
  if (!nom.has(code)) nom.set(code, c.name);
}

const inconnus = new Map<string, number>();
let remplaces = 0;
const touchees: string[] = [];

for (const f of (await fs.readdir(FICHES)).filter((x) => x.endsWith(".json"))) {
  const p = path.join(FICHES, f);
  const avant = await fs.readFile(p, "utf-8");
  const apres = avant.replace(CODE, (code) => {
    const n = nom.get(code);
    if (!n) {
      inconnus.set(code, (inconnus.get(code) ?? 0) + 1);
      return code;
    }
    remplaces++;
    return n;
  });
  if (apres !== avant) {
    touchees.push(f);
    if (ecrire) await fs.writeFile(p, apres, "utf-8");
  }
}

console.log(`${remplaces} codes remplacés dans ${touchees.length} fiches${ecrire ? "" : " (essai à blanc)"}`);
if (inconnus.size) {
  console.log("\nCodes absents de la base, laissés tels quels :");
  for (const [c, n] of [...inconnus].sort((a, b) => b[1] - a[1])) console.log(`  ${c} (${n}x)`);
}
await prisma.$disconnect();
