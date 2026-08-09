// Relevé de prix des cartes — OUTIL INTERNE, rien de tout ceci n'est rendu sur le site.
//
// Source : les fichiers JSON statiques de magicalmeta.ink, qui publie les prix
// TCGPlayer. Pas d'authentification, pas de Cloudflare, pas de limite annoncée :
// neuf fichiers, un par set, régénérés chaque jour vers 11h UTC. On les lit comme
// un navigateur le ferait, une fois par jour, séquentiellement.
//
// Pourquoi pas Cardmarket : il n'existe pas d'API publique, et recopier leurs pages
// contrevient à leurs conditions. Le prix rendu ici est donc AMÉRICAIN. La conversion
// vers l'euro plus bas est une estimation assumée, à ne jamais présenter comme un prix
// Cardmarket.
//
// Usage :
//   npx tsx --env-file=.env scripts/sync-prices.mts            met à jour data/card-prices.json
//   npx tsx --env-file=.env scripts/sync-prices.mts --deck <slug>   chiffre un deck publié
//   npx tsx --env-file=.env scripts/sync-prices.mts --test     auto-contrôle
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { prisma } from "../src/lib/prisma";

const BASE = "https://magicalmeta.ink/riftbound/data";
const UA = "Mozilla/5.0 (compatible; RiftboundFrance/1.0; +https://riftboundfrance.fr)";
const OUT_DIR = join(process.cwd(), "data", "prices");
const OUT_FILE = join(OUT_DIR, "card-prices.json");

// Le change dollar vers euro ET l'écart de marché en un seul facteur : sur un TCG
// récent l'Europe paie au-dessus des États-Unis, l'offre y étant plus mince. Chercher
// la précision serait faux, l'écart entre deux boutiques françaises est plus grand.
const USD_TO_EUR = 0.92;
const EU_MARKET_FACTOR = 1.15;
export const usdToEur = (usd: number) => usd * USD_TO_EUR * EU_MARKET_FACTOR;

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’'`]/g, "")
    // TCGPlayer écrit « Annie - Fiery » là où Riftcodex écrit « Annie, Fiery ».
    .replace(/\s*[-,]\s*/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface PriceRow {
  usd: number;
  productId: number;
  tcgName: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return (await res.json()) as T;
}

async function fetchPrices(): Promise<Map<string, PriceRow>> {
  const list = await getJson<{ sets: { filename: string; set_name: string }[] }>(`${BASE}/sets/sets-list.json`);
  const byName = new Map<string, PriceRow>();
  for (const s of list.sets) {
    const d = await getJson<{ cards: { name: string; product_id: number; current_price?: { market_price?: number } }[] }>(
      `${BASE}/sets/${s.filename}`,
    );
    let n = 0;
    for (const c of d.cards) {
      const usd = c.current_price?.market_price ?? 0;
      if (!usd) continue;
      const key = normalizeName(c.name);
      const prev = byName.get(key);
      // Plusieurs produits pour un même nom (finitions, éditions) : on garde le moins
      // cher, c'est l'exemplaire qu'un joueur achète pour jouer.
      if (!prev || usd < prev.usd) byName.set(key, { usd, productId: c.product_id, tcgName: c.name });
      n++;
    }
    console.log(`  ${s.set_name} : ${n} tarifs`);
  }
  return byName;
}

async function sync() {
  console.log("Relevé des prix (source : magicalmeta.ink, prix TCGPlayer)");
  const prices = await fetchPrices();
  const cards = await prisma.card.findMany({ select: { riftboundId: true, name: true, cleanName: true, set: true } });

  const out: Record<string, { usd: number; tcgName: string; productId: number }> = {};
  let hit = 0;
  const misses: string[] = [];
  for (const c of cards) {
    const m = prices.get(normalizeName(c.name)) ?? (c.cleanName ? prices.get(normalizeName(c.cleanName)) : undefined);
    if (!m) {
      misses.push(`${c.set} ${c.name}`);
      continue;
    }
    out[c.riftboundId] = { usd: m.usd, tcgName: m.tcgName, productId: m.productId };
    hit++;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify(
      {
        source: "magicalmeta.ink (prix TCGPlayer, marché américain, en dollars)",
        fetchedAt: new Date().toISOString(),
        usdToEur: USD_TO_EUR,
        euMarketFactor: EU_MARKET_FACTOR,
        cards: out,
      },
      null,
      1,
    ),
    "utf-8",
  );
  console.log(`\n${hit}/${cards.length} cartes tarifées -> ${OUT_FILE}`);
  console.log(`sans prix : ${misses.length}${misses.length ? " (ex. " + misses.slice(0, 3).join(", ") + ")" : ""}`);
}

function loadPrices(): Record<string, { usd: number }> {
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

  let usd = 0;
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
    usd += p.usd * dc.quantity;
    lines.push(`  ${(p.usd * dc.quantity).toFixed(2).padStart(6)} $  x${dc.quantity} ${dc.card.name}`);
  }
  lines.sort((a, b) => parseFloat(b.trim()) - parseFloat(a.trim()) || 0);
  console.log(`${deck.title}\n${lines.slice(0, 10).join("\n")}\n  ...`);
  console.log(`\nTotal : ${usd.toFixed(2)} $  soit ~${usdToEur(usd).toFixed(0)} € estimés`);
  console.log(`Couverture : ${known}/${total} exemplaires tarifés`);
}

// Auto-contrôle : la normalisation doit réconcilier les deux conventions d'écriture
// et l'estimation euro doit rester monotone. Le reste du script est de l'entrée-sortie.
function test() {
  const eq = (a: string, b: string) => {
    if (normalizeName(a) !== normalizeName(b)) throw new Error(`${a} != ${b}`);
  };
  eq("Annie - Fiery", "Annie, Fiery");
  eq("Kai'Sa, Daughter of the Void", "KaiSa - Daughter of the Void");
  eq("Rek'sai,  Void   Burrower", "Rek'Sai - Void Burrower");
  if (normalizeName("Annie, Fiery") === normalizeName("Annie, Frozen")) throw new Error("collision");
  if (usdToEur(10) <= usdToEur(5)) throw new Error("conversion non monotone");
  if (Math.round(usdToEur(100)) !== 106) throw new Error("facteur euro inattendu");
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
