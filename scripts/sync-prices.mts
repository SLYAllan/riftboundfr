// Relevé de prix des cartes, source CardNexus.
//
// Remplace l'ancienne source magicalmeta.ink, qui donnait des prix TCGPlayer en
// dollars convertis au doigt mouillé : le site affiche maintenant ces prix, donc
// ils doivent être vrais et en euros. CardNexus publie le prix du marché européen
// et vend les cartes, ce qui rend le chiffre cohérent avec le bouton d'achat.
//
// Le fichier produit est lu par src/lib/cardnexus.ts au rendu des pages deck.
// Rien n'appelle l'API au moment d'une visite : les prix bougent lentement, un
// relevé par jour suffit et la page reste rapide.
//
// Usage :
//   npx tsx --env-file=.env scripts/sync-prices.mts            met à jour data/prices/card-prices.json
//   npx tsx --env-file=.env scripts/sync-prices.mts --deck <slug>   chiffre un deck publié
//   npx tsx --env-file=.env scripts/sync-prices.mts --test     auto-contrôle
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { prisma } from "../src/lib/prisma";
import { cleCatalogue, prixRetenu, type BlocPrix } from "../src/lib/cardnexus";

const API = "https://public-api.cardnexus.com/v1";
const OUT_DIR = join(process.cwd(), "data", "prices");
const OUT_FILE = join(OUT_DIR, "card-prices.json");

const CLE = process.env.CARDNEXUS_API_KEY;
if (!CLE) throw new Error("CARDNEXUS_API_KEY manquante : la poser dans .env (et dans Coolify pour la prod).");

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’'`]/g, "")
    // CardNexus écrit « Annie - Fiery » là où Riftcodex écrit « Annie, Fiery ».
    .replace(/\s*[-,]\s*/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface Produit {
  id: number;
  name: string;
  printNumber: string;
  expansion: { code: string };
  pricesByFinish?: Record<string, BlocPrix>;
}

/** Le catalogue Riftbound entier, 200 par appel. 1400 cartes = 8 requêtes. */
async function catalogue(): Promise<Produit[]> {
  const out: Produit[] = [];
  for (let offset = 0; ; offset += 200) {
    const res = await fetch(`${API}/products/search`, {
      method: "POST",
      headers: { Authorization: `Bearer ${CLE}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        gameFilters: { game: "riftbound" },
        productType: { op: "or", values: ["card"] },
        limit: 200,
        offset,
      }),
    });
    if (!res.ok) throw new Error(`POST /products/search -> ${res.status} ${await res.text()}`);
    const j = (await res.json()) as { data: Produit[]; pagination: { hasMore: boolean } };
    out.push(...j.data);
    process.stdout.write(`\r  ${out.length} produits`);
    if (!j.pagination.hasMore) break;
  }
  console.log();
  return out;
}

async function sync() {
  console.log("Relevé des prix (source : CardNexus, marché européen, en euros)");
  const produits = await catalogue();

  const parNumero = new Map<string, Produit>();
  const parNom = new Map<string, Produit>();
  for (const p of produits) {
    parNumero.set(`${p.expansion.code}-${p.printNumber}`.toUpperCase(), p);
    // Plusieurs impressions d'une même carte : on garde la moins chère, c'est
    // l'exemplaire qu'un joueur achète pour jouer.
    const cle = normalizeName(p.name);
    const prec = parNom.get(cle);
    const px = prixRetenu(p.pricesByFinish);
    const pxPrec = prec ? prixRetenu(prec.pricesByFinish) : null;
    if (!prec || (px && (!pxPrec || px.eur < pxPrec.eur))) parNom.set(cle, p);
  }

  const cartes = await prisma.card.findMany({
    select: { riftboundId: true, name: true, cleanName: true, set: true },
  });

  const out: Record<string, { eur: number; productId: number; nom: string; source: string; finition: string }> = {};
  let parNum = 0;
  let parNomHit = 0;
  const sansPrix: string[] = [];
  const introuvables: string[] = [];

  for (const c of cartes) {
    let p = cleCatalogue(c.riftboundId)
      .map((k) => parNumero.get(k))
      .find(Boolean);
    if (p) parNum++;
    else {
      // Nos préfixes OPP, PR et JDG ne sont pas des codes d'extension CardNexus :
      // pour ces cartes le numéro ne peut pas trancher, seul le nom le peut.
      p = parNom.get(normalizeName(c.name)) ?? (c.cleanName ? parNom.get(normalizeName(c.cleanName)) : undefined);
      if (p) parNomHit++;
    }
    if (!p) {
      introuvables.push(`${c.set} ${c.name}`);
      continue;
    }
    const px = prixRetenu(p.pricesByFinish);
    if (!px) {
      sansPrix.push(`${c.set} ${c.name}`);
      continue;
    }
    out[c.riftboundId] = { eur: px.eur, productId: p.id, nom: p.name, source: px.source, finition: px.finition };
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        source: "CardNexus (public-api.cardnexus.com), marché européen, en euros",
        fetchedAt: new Date().toISOString(),
        currency: "EUR",
        cards: out,
      },
      null,
      1,
    ),
    "utf-8",
  );

  const n = Object.keys(out).length;
  console.log(`\n${n}/${cartes.length} cartes tarifées -> ${OUT_FILE}`);
  console.log(`  appariées par numéro : ${parNum}, par nom : ${parNomHit}`);
  console.log(`  au catalogue mais sans prix : ${sansPrix.length}${sansPrix.length ? ` (ex. ${sansPrix.slice(0, 3).join(", ")})` : ""}`);
  console.log(`  absentes du catalogue : ${introuvables.length}${introuvables.length ? ` (ex. ${introuvables.slice(0, 3).join(", ")})` : ""}`);
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
