// Relevé de prix des cartes, source CardNexus.
//
// Remplace l'ancienne source magicalmeta.ink, qui donnait des prix TCGPlayer en
// dollars convertis au doigt mouillé : le site affiche maintenant ces prix, donc
// ils doivent être vrais et en euros. CardNexus publie le prix du marché européen
// et vend les cartes, ce qui rend le chiffre cohérent avec le bouton d'achat.
//
// Le fichier produit est lu par src/lib/cardnexus.ts au rendu des pages deck.
// Le serveur se relève aussi tout seul une fois par jour, en mémoire : ce fichier
// n'est plus que le point de départ d'un conteneur neuf.
//
// Usage :
//   npx tsx --env-file=.env scripts/sync-prices.mts            met à jour data/prices/card-prices.json
//   npx tsx --env-file=.env scripts/sync-prices.mts --deck <slug>   chiffre un deck publié
//   npx tsx --env-file=.env scripts/sync-prices.mts --test     auto-contrôle
//   npx tsx --env-file=.env scripts/sync-prices.mts --force    écrit même si le relevé a maigri
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { prisma } from "../src/lib/prisma";
import { releveAMaigri } from "../src/lib/cardnexus";
import { normalizeName, releverPrix } from "../src/lib/cardnexus-releve";

const OUT_DIR = join(process.cwd(), "data", "prices");
const OUT_FILE = join(OUT_DIR, "card-prices.json");

async function sync() {
  const cle = process.env.CARDNEXUS_API_KEY;
  if (!cle) throw new Error("CARDNEXUS_API_KEY manquante : la poser dans .env (et dans Coolify pour la prod).");
  console.log("Relevé des prix (source : CardNexus, marché européen, en euros)");
  const r = await releverPrix(cle);

  if (existsSync(OUT_FILE)) {
    let precedent;
    try {
      precedent = JSON.parse(readFileSync(OUT_FILE, "utf-8"));
    } catch {
      console.error(`\nRefus d'écrire : ${OUT_FILE} existe mais n'est pas lisible. Le réparer ou le supprimer d'abord.`);
      process.exit(1);
    }
    if (releveAMaigri(precedent, r.prix) && !process.argv.includes("--force")) {
      console.error(`\nRefus d'écrire : ${Object.keys(r.prix.cards).length} cartes tarifées, plus de 10 % de moins qu'au relevé précédent. Relancer, ou --force si c'est voulu.`);
      process.exit(1);
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(r.prix, null, 1), "utf-8");

  const n = Object.keys(r.prix.cards).length;
  console.log(`\n${n}/${r.cartes} cartes tarifées -> ${OUT_FILE}`);
  console.log(`  appariées par numéro : ${r.parNumero}, par nom : ${r.parNom}`);
  console.log(`  au catalogue mais sans prix : ${r.sansPrix.length}${r.sansPrix.length ? ` (ex. ${r.sansPrix.slice(0, 3).join(", ")})` : ""}`);
  console.log(`  absentes du catalogue : ${r.introuvables.length}${r.introuvables.length ? ` (ex. ${r.introuvables.slice(0, 3).join(", ")})` : ""}`);
}

function loadPrices(): Record<string, { eur: number }> {
  if (!existsSync(OUT_FILE)) throw new Error(`${OUT_FILE} absent : lancer le script sans argument d'abord.`);
  return JSON.parse(readFileSync(OUT_FILE, "utf-8")).cards;
}

async function priceDeck(slug: string) {
  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: { cards: { include: { card: true } } },
  });
  if (!deck) throw new Error(`deck introuvable : ${slug}`);
  const prices = loadPrices();

  let eur = 0;
  let known = 0;
  let total = 0;
  const lines: string[] = [];
  for (const dc of deck.cards) {
    total += dc.quantity;
    const p = prices[dc.card.riftboundId];
    if (!p) {
      lines.push(`  ?      x${dc.quantity} ${dc.card.name}`);
      continue;
    }
    known += dc.quantity;
    eur += p.eur * dc.quantity;
    lines.push(`  ${(p.eur * dc.quantity).toFixed(2).padStart(6)} €  x${dc.quantity} ${dc.card.name}`);
  }
  lines.sort((a, b) => parseFloat(b.trim()) - parseFloat(a.trim()) || 0);
  console.log(`${deck.title}\n${lines.slice(0, 10).join("\n")}\n  ...`);
  console.log(`\nTotal : ${eur.toFixed(2)} €`);
  console.log(`Couverture : ${known}/${total} exemplaires tarifés`);
}

// Auto-contrôle : la normalisation doit réconcilier les deux conventions d'écriture.
// Le reste du script est de l'entrée-sortie ; les fonctions de prix ont leurs tests
// dans src/lib/cardnexus.test.ts.
function test() {
  const eq = (a: string, b: string) => {
    if (normalizeName(a) !== normalizeName(b)) throw new Error(`${a} != ${b}`);
  };
  eq("Annie - Fiery", "Annie, Fiery");
  eq("Kai'Sa, Daughter of the Void", "KaiSa - Daughter of the Void");
  eq("Rek'sai,  Void   Burrower", "Rek'Sai - Void Burrower");
  if (normalizeName("Annie, Fiery") === normalizeName("Annie, Frozen")) throw new Error("collision");
  console.log("ok");
}

const arg = process.argv[2];
if (arg === "--test") {
  test();
} else if (arg === "--deck") {
  await priceDeck(process.argv[3]);
} else {
  await sync();
}
