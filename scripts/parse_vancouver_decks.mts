import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "data/raw-scrapes/vancouver-rq";

// key -> display metadata
const META: Record<string, { player: string; placement: string }> = {
  "1-alanzq-diana": { player: "AlanZQ", placement: "1er" },
  "2-samdsherman-rengar": { player: "Sam D Sherman", placement: "2e" },
  "3-housesarebig-masteryi": { player: "Houses Are Big", placement: "3e" },
  "4-diwali-diana": { player: "Diwali", placement: "4e" },
  "5-rocklho-azir": { player: "Rocklho", placement: "5e" },
  "6-arito-irelia": { player: "Arito", placement: "6e" },
  "7-swagyolo420-sivir": { player: "SwagYOLO420", placement: "7e" },
};

const GROUP_SECTION: Record<string, string> = {
  group_champion: "champion",
  group_unit: "main",
  group_spell: "main",
  group_gear: "main",
  group_battlefields: "battlefield",
  group_runes: "rune",
  group_sideboard: "side",
};

function parseDeck(md: string) {
  const legend = md.split("\n")[0].replace(/^#\s*/, "").split(/ by /i)[0].trim();
  const lines = md.split("\n");
  let section = "main";
  const buckets: Record<string, string[]> = { champion: [], main: [], rune: [], battlefield: [], side: [] };
  const groupRe = /group_(champion|unit|spell|gear|battlefields|runes|sideboard)/;
  const cardRe = /\*\*(\d+)\*\*\[([^\]]+)\]/;
  for (const line of lines) {
    const g = line.match(groupRe);
    if (g) {
      section = GROUP_SECTION[`group_${g[1]}`] ?? section;
      continue;
    }
    const c = line.match(cardRe);
    if (c) {
      const qty = c[1];
      const name = c[2].trim();
      buckets[section]?.push(`${qty} ${name}`);
    }
  }
  // riftdecks sometimes lists a trailing unit after the runes block; rune
  // entries are always "<X> ... Rune" — move anything else back to main.
  const realRunes = buckets.rune.filter((l) => /\bRune$/.test(l));
  const strays = buckets.rune.filter((l) => !/\bRune$/.test(l));
  buckets.rune = realRunes;
  buckets.main.push(...strays);

  const parts: string[] = [];
  parts.push("Legend:", `1 ${legend}`);
  if (buckets.champion.length) parts.push(...buckets.champion);
  if (buckets.main.length) parts.push("Main:", ...buckets.main);
  if (buckets.rune.length) parts.push("Runes:", ...buckets.rune);
  if (buckets.battlefield.length) parts.push("Battlefield:", ...buckets.battlefield);
  if (buckets.side.length) parts.push("Side:", ...buckets.side);
  return { legend, deckCode: parts.join("\n") };
}

const out: { key: string; player: string; placement: string; legend: string; deckName: string; deckCode: string }[] = [];
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".md")).sort()) {
  const key = file.replace(/\.md$/, "");
  const md = readFileSync(join(DIR, file), "utf-8");
  const { legend, deckCode } = parseDeck(md);
  const meta = META[key] ?? { player: "?", placement: "?" };
  out.push({ key, player: meta.player, placement: meta.placement, legend, deckName: `${legend} — ${meta.placement}`, deckCode });
}

writeFileSync("data/raw-scrapes/vancouver-deckcodes.json", JSON.stringify(out, null, 2), "utf-8");
console.log("parsed", out.length, "decks");
for (const d of out) console.log(`\n### ${d.placement} ${d.player} — ${d.legend}\n${d.deckCode}`);
