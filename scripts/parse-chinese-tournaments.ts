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

interface TournamentConfig {
  name: string;
  rawDir: string;
  prefix: string;
  date: string;
  playerCount: number;
  set: string;
}

function parseDeckMarkdown(md: string, sourceUrl: string, config: TournamentConfig): DeckJson | null {
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
  if (!placement) {
    const topMatch = md.match(/Top\s*(\d+) at/i);
    if (topMatch) placement = parseInt(topMatch[1]);
  }

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
    tournament: config.name,
    date: config.date,
    placement,
    playerCount: config.playerCount,
    set: config.set,
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

const tournaments: TournamentConfig[] = [
  {
    name: "Guangzhou Regional Open",
    rawDir: "guangzhou-ro",
    prefix: "guangzhou-ro-",
    date: "2025-08-23",
    playerCount: 512,
    set: "Origins",
  },
  {
    name: "Chongqing Regional Open",
    rawDir: "chongqing-ro",
    prefix: "chongqing-ro-",
    date: "2025-09-07",
    playerCount: 512,
    set: "Origins",
  },
  {
    name: "Shanghai City Challenge",
    rawDir: "shanghai-cc",
    prefix: "shanghai-cc-",
    date: "2025-11-23",
    playerCount: 128,
    set: "Origins",
  },
  {
    name: "Shanghai National Open",
    rawDir: "shanghai-no",
    prefix: "shanghai-no-",
    date: "2025-11-02",
    playerCount: 2048,
    set: "Origins",
  },
  {
    name: "Beijing Regional Open (Day 1)",
    rawDir: "beijing-ro-1",
    prefix: "beijing-ro1-",
    date: "2025-08-30",
    playerCount: 512,
    set: "Origins",
  },
  {
    name: "Beijing Regional Open (Day 2)",
    rawDir: "beijing-ro-2",
    prefix: "beijing-ro2-",
    date: "2025-08-31",
    playerCount: 509,
    set: "Origins",
  },
  {
    name: "Chongqing Regional Open (Full)",
    rawDir: "chongqing-ro-2",
    prefix: "chongqing-ro2-",
    date: "2025-09-07",
    playerCount: 507,
    set: "Origins",
  },
  {
    name: "Guangzhou Regional Open (Full)",
    rawDir: "guangzhou-ro-2",
    prefix: "guangzhou-ro2-",
    date: "2025-08-24",
    playerCount: 506,
    set: "Origins",
  },
  {
    name: "S2 Shenzhen National Open",
    rawDir: "shenzhen-no",
    prefix: "shenzhen-no-",
    date: "2026-03-22",
    playerCount: 2048,
    set: "Spiritforged",
  },
];

const decklistsDir = path.join(__dirname, "../data/decklists");
const indexPath = path.join(__dirname, "../data/decklists-index.json");

const allNewEntries: Array<{ id: string; legend: string; player: string; placement: number | null; file: string }> = [];

for (const config of tournaments) {
  const rawDir = path.join(__dirname, "../data/raw-scrapes", config.rawDir);
  if (!fs.existsSync(rawDir)) {
    console.log(`  Directory not found: ${rawDir}, skipping ${config.name}`);
    continue;
  }

  const files = fs.readdirSync(rawDir).filter(f => f.startsWith("deck-") && f.endsWith(".md"));
  console.log(`\n=== ${config.name}: ${files.length} files ===`);

  let parsed = 0;
  let failed = 0;

  for (const file of files) {
    const md = fs.readFileSync(path.join(rawDir, file), "utf-8");
    const sourceUrl = `https://riftdecks.com/riftbound-metagame/${file.replace(".md", "")}`;

    const deck = parseDeckMarkdown(md, sourceUrl, config);
    if (!deck) {
      console.log(`  SKIP: ${file} (no legend found)`);
      failed++;
      continue;
    }

    const legendSlug = deck.legend.split(",")[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    const legendDir = path.join(decklistsDir, legendSlug);
    fs.mkdirSync(legendDir, { recursive: true });

    const playerSlug = deck.player.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "").slice(0, 30);
    const fileName = `${config.prefix}${deck.placement ?? "unranked"}-${playerSlug}.json`;
    const filePath = path.join(legendDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(deck, null, 2), "utf-8");
    allNewEntries.push({ id: deck.id, legend: deck.legend, player: deck.player, placement: deck.placement, file: `${legendSlug}/${fileName}` });
    parsed++;
  }

  console.log(`  Parsed: ${parsed}, Failed: ${failed}`);
}

let existingIndex: typeof allNewEntries = [];
if (fs.existsSync(indexPath)) {
  const raw = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
  existingIndex = Array.isArray(raw) ? raw : [];
}
const mergedIndex = [...existingIndex.filter(e => !allNewEntries.some(n => n.id === e.id)), ...allNewEntries];
fs.writeFileSync(indexPath, JSON.stringify(mergedIndex, null, 2), "utf-8");

console.log(`\n=== TOTAL ===`);
console.log(`New entries: ${allNewEntries.length}`);
console.log(`Index total: ${mergedIndex.length}`);
