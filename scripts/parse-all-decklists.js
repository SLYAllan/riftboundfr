#!/usr/bin/env node
// Parse all scraped markdown files for a tournament into JSON decklists
// Usage: node scripts/parse-all-decklists.js <tournament-dir> <slug> <name> <date> <players> <set> <urls-file>

const fs = require("fs");
const path = require("path");
const { parseDecklistMd, slugify } = require("./parse-decklist-md.js");

const [rawDir, tSlug, tName, tDate, tPlayers, tSet, urlsFile] = process.argv.slice(2);
if (!rawDir) {
  console.error("Usage: node parse-all-decklists.js <raw-dir> <slug> <name> <date> <players> <set> <urls-file>");
  process.exit(1);
}

const BASE = path.resolve(__dirname, "..");
const DECKLIST_DIR = path.join(BASE, "data", "decklists");

// Build URL map: deckId -> URL
const urlMap = {};
if (urlsFile && fs.existsSync(urlsFile)) {
  for (const line of fs.readFileSync(urlsFile, "utf-8").trim().split("\n")) {
    const url = line.trim();
    const idMatch = url.match(/(\d+)$/);
    if (idMatch) urlMap[idMatch[1]] = url;
  }
}

const mdFiles = fs.readdirSync(rawDir).filter(f => f.endsWith(".md") && f.startsWith("deck-"));
console.log(`Parsing ${mdFiles.length} markdown files from ${rawDir}`);

const results = [];
const errors = [];
const legendCounts = {};
let ok = 0;

for (const file of mdFiles) {
  const mdPath = path.join(rawDir, file);
  const md = fs.readFileSync(mdPath, "utf-8");
  if (!md.trim()) { errors.push(file + ": empty"); continue; }

  const deckIdMatch = file.match(/deck-(\d+)\.md/);
  const deckId = deckIdMatch ? deckIdMatch[1] : null;
  const sourceUrl = deckId && urlMap[deckId] ? urlMap[deckId] : null;

  try {
    const result = parseDecklistMd(md, sourceUrl, tSlug, tName, tDate, tPlayers, tSet);
    const { json, legendSlug, playerSlug } = result;

    if (!json.legend || json.legend === "Unknown" || !json.mainDeck.length) {
      errors.push(file + ": could not parse legend or mainDeck");
      continue;
    }

    // Save JSON
    const outDir = path.join(DECKLIST_DIR, legendSlug);
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${json.id}.json`);
    fs.writeFileSync(outFile, JSON.stringify(json, null, 2));

    results.push({
      id: json.id,
      legend: json.legend,
      legendSlug,
      player: json.player,
      placement: json.placement,
      file: `data/decklists/${legendSlug}/${json.id}.json`,
    });

    legendCounts[json.legend] = (legendCounts[json.legend] || 0) + 1;
    ok++;
  } catch (e) {
    errors.push(file + ": " + e.message);
  }
}

console.log(`\nParsed: ${ok} ok, ${errors.length} errors`);
if (errors.length > 0 && errors.length <= 20) {
  console.log("Errors:", errors.join("\n  "));
} else if (errors.length > 20) {
  console.log(`First 20 errors:\n  ${errors.slice(0, 20).join("\n  ")}`);
}

console.log("\nLegend distribution:");
const sorted = Object.entries(legendCounts).sort((a, b) => b[1] - a[1]);
for (const [legend, count] of sorted) {
  console.log(`  ${legend}: ${count}`);
}

// Update decklists-index.json (flat array format)
const indexPath = path.join(BASE, "data", "decklists-index.json");
let index = [];
if (fs.existsSync(indexPath)) {
  try { index = JSON.parse(fs.readFileSync(indexPath, "utf-8")); } catch {}
}
if (!Array.isArray(index)) index = [];
// Remove old entries for this tournament
index = index.filter(d => !d.id.startsWith(tSlug + "-"));
// Add new entries
for (const r of results) {
  index.push({
    id: r.id,
    legend: r.legend,
    player: r.player,
    placement: r.placement,
    file: `${r.legendSlug}/${r.id}.json`,
  });
}
index.sort((a, b) => {
  if (a.legend < b.legend) return -1;
  if (a.legend > b.legend) return 1;
  return (a.placement || 9999) - (b.placement || 9999);
});
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
console.log(`\nIndex updated: ${index.length} total decklists`);

// Save tournament summary
const tourDir = path.join(BASE, "data", "tournaments");
fs.mkdirSync(tourDir, { recursive: true });
const tourFile = path.join(tourDir, tSlug + ".json");
const tourJson = {
  id: tSlug,
  name: tName,
  set: tSet,
  date: tDate,
  location: "China",
  playerCount: parseInt(tPlayers, 10),
  source: `https://riftdecks.com/riftbound-tournaments/`,
  deckCount: ok,
  legendDistribution: Object.fromEntries(sorted),
  top8: results.filter(r => r.placement && r.placement <= 8).sort((a, b) => a.placement - b.placement).map(r => ({
    place: r.placement,
    legend: r.legend,
    player: r.player,
  })),
};
fs.writeFileSync(tourFile, JSON.stringify(tourJson, null, 2));
console.log(`Tournament summary saved: ${tourFile}`);
