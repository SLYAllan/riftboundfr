import * as fs from "fs";
import * as path from "path";

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
  runes: { name: string; quantity: number }[];
  battlefields: string[];
  sideboard: DeckCard[];
  totalCards: number;
  stats: { unitCount: number; spellCount: number; gearCount: number; averageCost: null };
  sourceUrl: string;
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
  const runes: { name: string; quantity: number }[] = [];
  const battlefields: string[] = [];
  const sideboard: DeckCard[] = [];
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
      runes.push({ name, quantity });
    } else if (currentSection === "battlefield") {
      battlefields.push(name);
    } else if (currentSection === "sideboard") {
      sideboard.push({ name, quantity, type: "Unknown", rarity, domain: cardDomain });
    } else {
      const type = currentSection === "unit" ? "Unit" : currentSection === "spell" ? "Spell" : currentSection === "gear" ? "Gear" : "Unknown";
      mainDeck.push({ name, quantity, type, rarity, domain: cardDomain });
    }
  }

  if (!legend) return null;

  const deckId = sourceUrl.match(/deck-[^/]+$/)?.[0] ?? "unknown";
  const totalCards = mainDeck.reduce((s, c) => s + c.quantity, 0)
    + runes.reduce((s, r) => s + r.quantity, 0)
    + battlefields.length + 1 + (champion ? 1 : 0);

  return {
    id: deckId,
    legend,
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
    sideboard,
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
fs.mkdirSync(fragmentsDir, { recursive: true });

// `_page-N.md` sont les pages de liste du tournoi, pas des decks.
const files = fs.readdirSync(rawDir).filter(f => f.startsWith("deck-") && f.endsWith(".md"));
console.log(`Parsing ${files.length} deck files...`);

const index: Array<{ id: string; legend: string; player: string; placement: number | null; file: string }> = [];
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
const mergedIndex = [...existingIndex.filter(e => !index.some(n => n.id === e.id)), ...index];
fs.writeFileSync(indexPath, JSON.stringify(mergedIndex, null, 2), "utf-8");

console.log(`\nDone: ${parsed} parsed, ${failed} failed, ${mergedIndex.length} total in index`);
