import * as fs from "fs";
import * as path from "path";
import { decklistVendettaComplete } from "./decklist-integrity";
import { sortiesObsoletes } from "./parse-riftdecks-integrity";

interface DeckCard {
  name: string;
  quantity: number;
  type: string;
  rarity: string;
  domain: string;
}

interface DeckJson {
  id: string;
  legend: string;
  legendId: null;
  champion: string | null;
  player: string;
  tournament: string;
  date: string;
  placement: number | null;
  playerCount: number;
  set: string;
  format: string;
  archetype: null;
  domains: string[];
  mainDeck: DeckCard[];
  // Un objet { Fury: 6, Mind: 6 }, pas un tableau, et sans le suffixe « Rune » :
  // c'est ce que lit `seed-tournament-decks.ts` et ce qu'écrivent les decklists
  // déjà en base. En tableau, le seeder ne voyait aucune rune.
  runes: Record<string, number>;
  battlefields: string[];
  // `sideDeck`, pas `sideboard` : le seeder ne connaît que ce nom-là, et une
  // réserve rangée sous l'autre disparaissait en silence.
  sideDeck: DeckCard[];
  totalCards: number;
  stats: { unitCount: number; spellCount: number; gearCount: number; averageCost: null };
  sourceUrl: string;
}

/**
 * Les noms de Légende canoniques, indexés en minuscules.
 *
 * Le fil d'Ariane de riftdecks écrit « Kai'sa », « Khazix », « Reksai » là où la
 * base dit « Kai'Sa », « Kha'Zix », « Rek'sai » : la casse ET l'apostrophe
 * varient. Les deux comptent, parce que le seed rapproche un deck de sa Légende
 * par le nom : une lettre de travers crée une Légende fantôme à côté de la vraie.
 * `legend-map.json` porte l'orthographe qui fait foi.
 *
 * La clé de recherche ignore donc tout ce qui n'est pas lettre ou chiffre.
 */
function cleNom(nom: string): string {
  return nom.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const NOMS_CANONIQUES: Map<string, string> = (() => {
  const chemin = path.join(__dirname, "../data/raw-scrapes/legend-map.json");
  const carte: Record<string, string> = JSON.parse(fs.readFileSync(chemin, "utf-8"));
  return new Map(Object.values(carte).map((nom) => [cleNom(nom), nom]));
})();

function legendeCanonique(nom: string): string {
  return NOMS_CANONIQUES.get(cleNom(nom)) ?? nom;
}

/** Ce qui change d'un tournoi à l'autre, et que le markdown d'un deck ne porte pas. */
interface MetaTournoi {
  slug: string;
  tournament: string;
  date: string;
  playerCount: number;
  set: string;
}

function parseDeckMarkdown(md: string, sourceUrl: string, meta: MetaTournoi): DeckJson | null {
  const lines = md.split("\n");

  // Extract legend from breadcrumb
  let legend = "";
  for (const line of lines) {
    const legendMatch = line.match(/\[([A-Z][^[\]]+(?:,\s[A-Z][^[\]]+)?)\]\(https:\/\/riftdecks\.com\/legends\/constructed\//);
    if (legendMatch) {
      legend = legendMatch[1];
      break;
    }
  }

  // Extract player
  let player = "";
  const playerMatch = md.match(/decklist by (.+?)\.\s+\d/);
  if (playerMatch) player = playerMatch[1].trim();

  // Extract placement
  let placement: number | null = null;
  const placementMatch = md.match(/(\d+)(?:st|nd|rd|th) at/);
  if (placementMatch) placement = parseInt(placementMatch[1]);

  // Extract domains from the header line
  const domains: string[] = [];
  const domainMatch = md.match(/\[([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\]\(https:\/\/riftdecks\.com\/riftbound-metagame\/constructed\//);
  if (domainMatch) {
    domains.push(...domainMatch[1].split(/\s+/).filter(Boolean));
  }

  // Parse card sections
  let currentSection = "";
  const mainDeck: DeckCard[] = [];
  const runes: Record<string, number> = {};
  const battlefields: string[] = [];
  const sideDeck: DeckCard[] = [];
  let champion: string | null = null;

  for (const line of lines) {
    // Detect section headers
    if (line.includes("legend (")) { currentSection = "legend"; continue; }
    if (line.includes("champion (")) { currentSection = "champion"; continue; }
    if (line.includes("unit (")) { currentSection = "unit"; continue; }
    if (line.includes("gear (")) { currentSection = "gear"; continue; }
    if (line.includes("spell (")) { currentSection = "spell"; continue; }
    if (line.includes("battlefields (")) { currentSection = "battlefield"; continue; }
    if (line.includes("runes (")) { currentSection = "rune"; continue; }
    if (line.includes("sideboard (")) { currentSection = "sideboard"; continue; }

    // Parse card line: | ![rarity] | **qty** | [Name](url) | $price | ![domain] |
    const cardMatch = line.match(/!\[(\w+)\].*?\*\*(\d+)\*\*.*?\[([^\]]+)\]\(https:\/\/riftdecks\.com\/cards\//);
    if (!cardMatch) continue;

    const rarity = cardMatch[1];
    const quantity = parseInt(cardMatch[2]);
    const name = cardMatch[3];

    // Extract domain from rune icons in the line
    const domainIcons = [...line.matchAll(/!\[(calm|order|fury|body|chaos|mind|colorless)\]/g)];
    const cardDomain = domainIcons.map(m => m[1]).filter(d => d !== rarity).join("/") || "colorless";

    if (currentSection === "champion") {
      champion = name;
      continue;
    }
    if (currentSection === "legend") continue;

    if (currentSection === "rune") {
      // « Fury Rune » -> clé « Fury ». Deux lignes du même domaine s'additionnent.
      const domaine = name.replace(/\s*Runes?$/i, "").trim();
      runes[domaine] = (runes[domaine] ?? 0) + quantity;
    } else if (currentSection === "battlefield") {
      battlefields.push(name);
    } else if (currentSection === "sideboard") {
      sideDeck.push({ name, quantity, type: "Unknown", rarity, domain: cardDomain });
    } else {
      const type = currentSection === "unit" ? "Unit" : currentSection === "spell" ? "Spell" : currentSection === "gear" ? "Gear" : "Unknown";
      mainDeck.push({ name, quantity, type, rarity, domain: cardDomain });
    }
  }

  if (!legend) return null;

  const deckId = sourceUrl.match(/deck-[^/]+$/)?.[0] ?? "unknown";
  const totalCards = mainDeck.reduce((s, c) => s + c.quantity, 0)
    + Object.values(runes).reduce((s, q) => s + q, 0)
    + battlefields.length + 1 + (champion ? 1 : 0);

  return {
    id: deckId,
    legend: legendeCanonique(legend),
    legendId: null,
    champion,
    player,
    tournament: meta.tournament,
    date: meta.date,
    placement,
    playerCount: meta.playerCount,
    set: meta.set,
    format: "Constructed",
    archetype: null,
    domains,
    mainDeck,
    runes,
    battlefields,
    sideDeck,
    totalCards,
    stats: {
      unitCount: mainDeck.filter(c => c.type === "Unit").reduce((s, c) => s + c.quantity, 0),
      spellCount: mainDeck.filter(c => c.type === "Spell").reduce((s, c) => s + c.quantity, 0),
      gearCount: mainDeck.filter(c => c.type === "Gear").reduce((s, c) => s + c.quantity, 0),
      averageCost: null,
    },
    sourceUrl,
  };
}

// Main
//
// Convertit le scrape brut d'UN tournoi en decklists JSON.
//
//   npx tsx scripts/parse-riftdecks.ts <slug> "<nom du tournoi>" <AAAA-MM-JJ> <joueurs> <set>
//   npx tsx scripts/parse-riftdecks.ts s4-fuzhou "S4 Fuzhou City Challenge" 2026-08-09 128 Vendetta
//
// Le script portait les valeurs de Xi'an en dur et chaque tournoi en recopiait une
// version. Elles sont maintenant en arguments : un seul parseur à corriger.
const [argSlug, argNom, argDate, argJoueurs, argSet] = process.argv.slice(2);
if (!argSlug || !argNom || !argDate || !argJoueurs || !argSet) {
  console.error('Usage : npx tsx scripts/parse-riftdecks.ts <slug> "<nom>" <AAAA-MM-JJ> <joueurs> <set>');
  process.exit(1);
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(argDate)) {
  console.error(`Date attendue au format AAAA-MM-JJ, reçu "${argDate}".`);
  process.exit(1);
}
const meta: MetaTournoi = {
  slug: argSlug,
  tournament: argNom,
  date: argDate,
  playerCount: parseInt(argJoueurs, 10),
  set: argSet,
};

const rawDir = path.join(__dirname, `../data/raw-scrapes/${meta.slug}`);
const decklistsDir = path.join(__dirname, "../data/decklists");
// Le fragment par tournoi, pas l'index global : celui-ci est partagé par tous les
// tournois et le réécrire depuis un import en cours a déjà fait perdre des entrées.
const fragmentsDir = path.join(__dirname, "../data/raw-scrapes/index-fragments");
const indexPath = path.join(fragmentsDir, `${meta.slug}.json`);
const rejetsPath = path.join(fragmentsDir, `${meta.slug}-rejected.json`);
fs.mkdirSync(fragmentsDir, { recursive: true });

// `_page-N.md` sont les pages de liste du tournoi, pas des decks.
const files = fs.readdirSync(rawDir).filter(f => f.startsWith("deck-") && f.endsWith(".md"));
console.log(`Parsing ${files.length} deck files...`);

const index: Array<{ id: string; legend: string; player: string; placement: number | null; file: string }> = [];
const rejets: Array<{ id: string; source: string; reasons: string[] }> = [];
let parsed = 0;
let failed = 0;

for (const file of files) {
  const md = fs.readFileSync(path.join(rawDir, file), "utf-8");
  const deckIdMatch = file.match(/deck-(\d+)/);
  const deckId = deckIdMatch ? deckIdMatch[1] : file.replace(".md", "");
  const sourceUrl = `https://riftdecks.com/riftbound-metagame/${file.replace(".md", "")}`;

  const deck = parseDeckMarkdown(md, sourceUrl, meta);
  if (!deck) {
    console.log(`  SKIP: ${file} (no legend found)`);
    rejets.push({ id: file.replace(/\.md$/, ""), source: `data/raw-scrapes/${meta.slug}/${file}`, reasons: ["Légende absente"] });
    failed++;
    continue;
  }
  const integrite = decklistVendettaComplete(deck);
  if (!integrite.complete) {
    console.log(`  SKIP: ${file} (decklist Vendetta incomplète : ${integrite.missing.join(", ")})`);
    rejets.push({ id: deck.id, source: `data/raw-scrapes/${meta.slug}/${file}`, reasons: integrite.missing });
    failed++;
    continue;
  }

  const legendSlug = deck.legend.split(",")[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  const legendDir = path.join(decklistsDir, legendSlug);
  fs.mkdirSync(legendDir, { recursive: true });

  const playerSlug = deck.player.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "").slice(0, 30);
  // Beaucoup de joueurs sont chinois : leur nom translittéré peut donner un slug
  // vide. On retombe alors sur l'identifiant du deck, unique par construction,
  // plutôt que d'écrire tous ces decks dans le même fichier.
  const fileName = `${meta.slug}-${deck.placement ?? "unranked"}-${playerSlug || deckId}.json`;
  const filePath = path.join(legendDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(deck, null, 2), "utf-8");
  index.push({ id: deck.id, legend: deck.legend, player: deck.player, placement: deck.placement, file: `${legendSlug}/${fileName}` });
  parsed++;
}

// Load existing index or create new
let existingIndex: typeof index = [];
if (fs.existsSync(indexPath)) {
  const raw = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  existingIndex = Array.isArray(raw) ? raw : [];
}
for (const fichier of sortiesObsoletes(existingIndex, index)) {
  const chemin = path.join(decklistsDir, fichier);
  if (fs.existsSync(chemin)) fs.unlinkSync(chemin);
}
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");
fs.writeFileSync(rejetsPath, JSON.stringify({ tournament: meta.tournament, set: meta.set, decks: rejets }, null, 2), "utf-8");

console.log(`\nDone: ${parsed} parsed, ${failed} failed, ${index.length} total in index`);
