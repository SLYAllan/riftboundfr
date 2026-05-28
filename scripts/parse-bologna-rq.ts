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

function parseDeckMarkdown(md: string, sourceUrl: string): DeckJson | null {
  const lines = md.split("\n");

  let legend = "";
  for (const line of lines) {
    const legendMatch = line.match(/\[([A-Z][^[\]]+(?:,\s[A-Z][^[\]]+)?)\]\(https:\/\/riftdecks\.com\/legends\/constructed\//);
    if (legendMatch) {
      legend = legendMatch[1];
      break;
    }
  }

  let player = "";
  const playerMatch = md.match(/decklist by ([^.]+)\./);
  if (playerMatch) player = playerMatch[1].trim();

  let placement: number | null = null;
  const placementMatch = md.match(/(\d+)(?:st|nd|rd|th) at/);
  if (placementMatch) placement = parseInt(placementMatch[1]);

  const domains: string[] = [];
  const domainMatch = md.match(/\[([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\]\(https:\/\/riftdecks\.com\/riftbound-metagame\/constructed\//);
  if (domainMatch) {
    domains.push(...domainMatch[1].split(/\s+/).filter(Boolean));
  }

  let currentSection = "";
  const mainDeck: DeckCard[] = [];
  const runes: { name: string; quantity: number }[] = [];
  const battlefields: string[] = [];
  const sideboard: DeckCard[] = [];
  let champion: string | null = null;

  for (const line of lines) {
    if (line.includes("legend (")) { currentSection = "legend"; continue; }
    if (line.includes("champion (")) { currentSection = "champion"; continue; }
    if (line.includes("unit (")) { currentSection = "unit"; continue; }
    if (line.includes("gear (")) { currentSection = "gear"; continue; }
    if (line.includes("spell (")) { currentSection = "spell"; continue; }
    if (line.includes("battlefields (")) { currentSection = "battlefield"; continue; }
    if (line.includes("runes (")) { currentSection = "rune"; continue; }
    if (line.includes("sideboard (")) { currentSection = "sideboard"; continue; }

    const cardMatch = line.match(/!\[(\w+)\].*?\*\*(\d+)\*\*.*?\[([^\]]+)\]\(https:\/\/riftdecks\.com\/cards\//);
    if (!cardMatch) continue;

    const rarity = cardMatch[1];
    const quantity = parseInt(cardMatch[2]);
    const name = cardMatch[3];

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
    tournament: "Bologna Regional Qualifier",
    date: "2026-02-21",
    placement,
    playerCount: 1719,
    set: "Spiritforged",
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

const rawDir = path.join(__dirname, "../data/raw-scrapes/bologna-rq");
const decklistsDir = path.join(__dirname, "../data/decklists");
const indexPath = path.join(__dirname, "../data/decklists-index.json");

const files = fs.readdirSync(rawDir).filter(f => f.startsWith("deck-") && f.endsWith(".md"));
console.log(`Parsing ${files.length} Bologna RQ deck files...`);

const index: Array<{ id: string; legend: string; player: string; placement: number | null; file: string }> = [];
let parsed = 0;
let failed = 0;

for (const file of files) {
  const md = fs.readFileSync(path.join(rawDir, file), "utf-8");
  const sourceUrl = `https://riftdecks.com/riftbound-metagame/${file.replace(".md", "")}`;

  const deck = parseDeckMarkdown(md, sourceUrl);
  if (!deck) {
    console.log(`  SKIP: ${file} (no legend found)`);
    failed++;
    continue;
  }

  const legendSlug = deck.legend.split(",")[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  const legendDir = path.join(decklistsDir, legendSlug);
  fs.mkdirSync(legendDir, { recursive: true });

  const playerSlug = deck.player.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "").slice(0, 30);
  const fileName = `bologna-rq-${deck.placement ?? "unranked"}-${playerSlug}.json`;
  const filePath = path.join(legendDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(deck, null, 2), "utf-8");
  index.push({ id: deck.id, legend: deck.legend, player: deck.player, placement: deck.placement, file: `${legendSlug}/${fileName}` });
  parsed++;
}

let existingIndex: typeof index = [];
if (fs.existsSync(indexPath)) {
  const raw = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  existingIndex = Array.isArray(raw) ? raw : [];
}
const mergedIndex = [...existingIndex.filter(e => !index.some(n => n.id === e.id)), ...index];
fs.writeFileSync(indexPath, JSON.stringify(mergedIndex, null, 2), "utf-8");

console.log(`\nDone: ${parsed} parsed, ${failed} failed, ${mergedIndex.length} total in index`);
