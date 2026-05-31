// Parser for s2-shanghai-cc-6192 cached deck markdown -> decklist JSON
const fs = require("fs");
const path = require("path");

const ROOT = "C:/Users/Allan/Documents/Claude/RiftboundFr";
const SLUG = "s2-shanghai-cc-6192";
const SET_FULL = "Spiritforged";
const TOURNAMENT = "S2 Shanghai City Challenge";
const PLAYER_COUNT = 128;

const legendMap = JSON.parse(fs.readFileSync(path.join(ROOT, "data/raw-scrapes/legend-map.json"), "utf8"));
const cacheDir = path.join(ROOT, "data/raw-scrapes", SLUG);
const decklistsDir = path.join(ROOT, "data/decklists");
const errorsFile = path.join(ROOT, "data/raw-scrapes", `${SLUG}-errors.txt`);

// Build set of existing legend-slug folders to match
const existingFolders = new Set(
  fs.readdirSync(decklistsDir).filter((f) => fs.statSync(path.join(decklistsDir, f)).isDirectory())
);

function legendSlug(legend) {
  // legend.split(",")[0] lowercased, non-alnum -> -, trim trailing -
  let base = legend.split(",")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "").replace(/^-+/, "");
  // Prefer a fuller existing folder that startsWith base (e.g. kaisa-daughter-of-the-void)
  const full = legend.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "").replace(/^-+/, "");
  if (existingFolders.has(full)) return full;
  if (existingFolders.has(base)) return base;
  // try matching a folder that starts with base
  for (const f of existingFolders) {
    if (f === base || f.startsWith(base + "-")) return f;
  }
  return base;
}

function playerSlug(player) {
  return player.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "").replace(/^-+/, "").slice(0, 30);
}

function detectLegend(md) {
  // find all /img/cards/riftbound/{SET}/{set}-{NUM}{letter}-...png
  const re = /\/img\/cards\/riftbound\/+([A-Za-z]+)\/([a-z]+)-(\d+)([a-z]?)-/g;
  let m;
  const found = [];
  while ((m = re.exec(md)) !== null) {
    const setPart = m[1].toUpperCase();
    const num = Number(m[3]); // strips leading zeros; letter already separate
    const key = setPart + "-" + num;
    if (legendMap[key]) found.push(legendMap[key]);
  }
  return found.length ? found[0] : null;
}

const RARITIES = ["common", "uncommon", "rare", "epic", "showcase", "mythic"];
const DOMAINS = ["calm", "order", "fury", "body", "chaos", "mind", "colorless"];

function parseCards(md) {
  const lines = md.split("\n");
  let section = null;
  let champion = null;
  const mainDeck = [];
  const battlefields = [];
  const runes = [];
  const sideboard = [];

  // pending rarity for a card line
  let pendingRarity = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // section markers
    if (line.includes("group_champion.png")) { section = "champion"; pendingRarity = null; continue; }
    if (line.includes("group_unit.png")) { section = "unit"; pendingRarity = null; continue; }
    if (line.includes("group_gear.png")) { section = "gear"; pendingRarity = null; continue; }
    if (line.includes("group_spell.png")) { section = "spell"; pendingRarity = null; continue; }
    if (line.includes("group_battlefields.png")) { section = "battlefield"; pendingRarity = null; continue; }
    if (line.includes("group_runes.png")) { section = "rune"; pendingRarity = null; continue; }
    if (line.includes("group_sideboard.png")) { section = "sideboard"; pendingRarity = null; continue; }

    // rarity icon line
    const rar = line.match(/rarity_([a-z]+)\.png/);
    if (rar && RARITIES.includes(rar[1])) {
      pendingRarity = rar[1];
      // sometimes rarity + card name on same matched block; continue to check card below
    }

    // card entry: **<qty>**[<Name>](https://riftdecks.com/cards/...)
    const card = line.match(/\*\*(\d+)\*\*\[([^\]]+)\]\(https:\/\/riftdecks\.com\/cards\/[^)]+\)/);
    if (card && section) {
      const qty = parseInt(card[1], 10);
      const name = card[2].trim();
      // domain rune icon may follow on same line or next lines
      let domain = null;
      const dmInline = line.match(/rune_([a-z]+)\.png/);
      if (dmInline && DOMAINS.includes(dmInline[1])) domain = dmInline[1];
      if (!domain) {
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const dm = lines[j].match(/rune_([a-z]+)\.png/);
          if (dm && DOMAINS.includes(dm[1])) { domain = dm[1]; break; }
          if (lines[j].match(/\*\*\d+\*\*\[/) || lines[j].includes("group_")) break;
        }
      }
      const rarity = pendingRarity;
      pendingRarity = null;

      if (section === "champion") {
        champion = name;
      } else if (section === "unit") {
        mainDeck.push({ name, quantity: qty, type: "Unit", rarity, domain });
      } else if (section === "gear") {
        mainDeck.push({ name, quantity: qty, type: "Gear", rarity, domain });
      } else if (section === "spell") {
        mainDeck.push({ name, quantity: qty, type: "Spell", rarity, domain });
      } else if (section === "battlefield") {
        battlefields.push(name);
      } else if (section === "rune") {
        runes.push({ name, quantity: qty });
      } else if (section === "sideboard") {
        sideboard.push({ name, quantity: qty, type: "Unknown", rarity, domain });
      }
    }
  }
  return { champion, mainDeck, battlefields, runes, sideboard };
}

function parseDomains(md) {
  // ## Deck Stats -> domains block: e.g. "| fury | 46% (29) |"
  const idx = md.indexOf("| domains |");
  const result = [];
  if (idx !== -1) {
    const tail = md.slice(idx);
    const re = /\|\s*(calm|order|fury|body|chaos|mind|colorless)\s*\|\s*\d+%/g;
    let m;
    while ((m = re.exec(tail)) !== null) {
      if (m[1] !== "colorless") result.push(m[1].charAt(0).toUpperCase() + m[1].slice(1));
    }
  }
  return result;
}

function parseMeta(meta, md) {
  const desc = meta.description || "";
  // player
  let player = null;
  let pm = desc.match(/decklist by (.+?)\.\s+\d+(?:st|nd|rd|th) at/);
  if (pm) player = pm[1].trim();
  else {
    pm = desc.match(/decklist by (.+?)\.\s/);
    if (pm) player = pm[1].trim();
  }
  // placement
  let placement = null;
  const plm = desc.match(/(\d+)(?:st|nd|rd|th) at/);
  if (plm) placement = parseInt(plm[1], 10);
  // date
  let date = "2026-03-15";
  const dm = desc.match(/on (\d{4}-\d{2}-\d{2})/);
  if (dm) date = dm[1];
  return { player, placement, date };
}

const written = [];
const fragments = [];
const errors = [];

const files = fs.readdirSync(cacheDir).filter((f) => f.endsWith(".md"));
console.log("Found " + files.length + " cached md files");

for (const file of files) {
  const deckId = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(cacheDir, file), "utf8");
  const obj = JSON.parse(raw);
  const md = obj.markdown || "";
  const meta = obj.metadata || {};
  const deckUrl = (meta.final_url) || obj.url;

  const legend = detectLegend(md);
  if (!legend) {
    errors.push(deckUrl + " no-legend");
    continue;
  }

  const { player, placement, date } = parseMeta(meta, md);
  const { champion, mainDeck, battlefields, runes, sideboard } = parseCards(md);
  let domains = parseDomains(md);
  if (domains.length === 0) {
    // fallback: two rune icons in header
    const headerRunes = [];
    const hm = md.slice(0, 600).matchAll(/rune_([a-z]+)\.png/g);
    for (const x of hm) {
      const d = x[1];
      if (d !== "colorless" && !headerRunes.includes(d)) headerRunes.push(d);
    }
    domains = headerRunes.slice(0, 2).map((d) => d.charAt(0).toUpperCase() + d.slice(1));
  }

  const unitCount = mainDeck.filter((c) => c.type === "Unit").reduce((s, c) => s + c.quantity, 0);
  const spellCount = mainDeck.filter((c) => c.type === "Spell").reduce((s, c) => s + c.quantity, 0);
  const gearCount = mainDeck.filter((c) => c.type === "Gear").reduce((s, c) => s + c.quantity, 0);
  const runeQty = runes.reduce((s, r) => s + r.quantity, 0);
  const mainQty = mainDeck.reduce((s, c) => s + c.quantity, 0);
  const totalCards = mainQty + runeQty + battlefields.length + 1 + (champion ? 1 : 0);

  const lslug = legendSlug(legend);
  const pslug = playerSlug(player || "");
  let filenameBase;
  const placeStr = placement != null ? String(placement) : "unranked";
  if (pslug) filenameBase = `${SLUG}-${placeStr}-${pslug}`;
  else filenameBase = `${SLUG}-${placeStr}`;

  const outDir = path.join(decklistsDir, lslug);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  let outName = filenameBase + ".json";
  // collision handling
  if (fs.existsSync(path.join(outDir, outName))) {
    outName = `${filenameBase}-${deckId}.json`;
  }

  const json = {
    id: deckId,
    legend,
    legendId: null,
    champion: champion || null,
    player: player || null,
    tournament: TOURNAMENT,
    date,
    placement,
    playerCount: PLAYER_COUNT,
    set: SET_FULL,
    format: "Constructed",
    archetype: null,
    domains,
    mainDeck,
    runes,
    battlefields,
    sideboard,
    totalCards,
    stats: { unitCount, spellCount, gearCount, averageCost: null },
    sourceUrl: deckUrl,
  };

  fs.writeFileSync(path.join(outDir, outName), JSON.stringify(json, null, 2));
  written.push({ legend, file: `${lslug}/${outName}`, placement, player, id: deckId });
  fragments.push({ id: deckId, legend, player: player || null, placement, file: `${lslug}/${outName}` });
}

if (errors.length) fs.writeFileSync(errorsFile, errors.join("\n") + "\n");

// STEP 3 summary
const placements = written
  .filter((w) => w.placement != null)
  .sort((a, b) => a.placement - b.placement);

// need domains per deck for topPlacements; re-read written files for domains
function readDeck(w) {
  const p = path.join(decklistsDir, w.file);
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const top8 = placements.slice(0, 8).map((w) => {
  const d = readDeck(w);
  return { rank: w.placement, player: w.player, legend: w.legend, domains: d.domains };
});

const legendCounts = {};
for (const w of written) legendCounts[w.legend] = (legendCounts[w.legend] || 0) + 1;
const legendBreakdown = Object.entries(legendCounts)
  .map(([legend, count]) => ({ legend, count, pct: Math.round((count / written.length) * 1000) / 10 }))
  .sort((a, b) => b.count - a.count);

const summary = {
  name: TOURNAMENT,
  slug: SLUG,
  date: "2026-03-15",
  location: "Shanghai, China",
  playerCount: PLAYER_COUNT,
  format: "Constructed",
  set: SET_FULL,
  organizer: "上海AT卡牌",
  decklistsPublished: written.length,
  sourceUrl: "https://riftdecks.com/riftbound-tournaments/s2-shanghai-city-challenge-tournament-decks-6192",
  topPlacements: top8,
  legendBreakdown,
};
fs.mkdirSync(path.join(ROOT, "data/tournaments"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "data/tournaments", SLUG + ".json"), JSON.stringify(summary, null, 2));

// STEP 4 fragment
fs.mkdirSync(path.join(ROOT, "data/raw-scrapes/index-fragments"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "data/raw-scrapes/index-fragments", SLUG + ".json"),
  JSON.stringify(fragments, null, 2)
);

console.log("WRITTEN=" + written.length + " ERRORS=" + errors.length);
console.log("legendBreakdown:", JSON.stringify(legendBreakdown));
