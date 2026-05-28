import * as fs from "fs";
import * as path from "path";

const decklistsDir = path.join(__dirname, "../data/decklists");

interface DeckCard {
  name: string;
  quantity: number;
  type: string;
  rarity?: string;
  domain?: string;
  cost?: number;
}

interface Deck {
  id: string;
  legend: string;
  champion: string | null;
  player: string;
  tournament: string;
  date: string;
  placement: number | null;
  domains: string[];
  mainDeck: DeckCard[];
  runes: { name: string; quantity: number }[];
  battlefields: string[];
  sideboard: DeckCard[];
  totalCards: number;
  stats: { unitCount: number; spellCount: number; gearCount: number; averageCost: number | null };
}

interface LegendAnalysis {
  legend: string;
  deckCount: number;
  domains: string[];
  champions: Record<string, number>;
  cardFrequency: Record<string, { count: number; totalQty: number; type: string; avgQty: number }>;
  core: string[];
  standard: string[];
  flex: string[];
  tech: string[];
  avgUnits: number;
  avgSpells: number;
  avgGears: number;
  avgTotal: number;
  runePatterns: Record<string, number>;
  battlefieldFreq: Record<string, number>;
  topPlacements: { placement: number | null; player: string; tournament: string }[];
}

interface DomainPairAnalysis {
  pair: string;
  legends: string[];
  deckCount: number;
  staples: string[];
  commonCards: Record<string, { count: number; pct: number }>;
}

// Merge legend slugs that refer to the same legend
function normalizeLegendSlug(slug: string): string {
  const map: Record<string, string> = {};
  // Build map from full names to short names
  const shorts = ["irelia","master-yi","diana","leblanc","sivir","fiora","vex","sett","ahri","azir",
    "leona","miss-fortune","lillia","rengar","ezreal","teemo","volibear","ornn","lux","viktor",
    "kai-sa","vi","lee-sin","pyke","jax","yasuo","khazix","draven","darius","jinx","jhin","poppy",
    "ivern","rumble","reksai","garen","lucian","annie","renata-glasc"];
  for (const s of shorts) {
    if (slug.startsWith(s + "-") && slug !== s && !shorts.includes(slug)) {
      return s;
    }
  }
  return slug;
}

// Load all decks
const allDecks: Deck[] = [];
const legendDirs = fs.readdirSync(decklistsDir).filter(f =>
  fs.statSync(path.join(decklistsDir, f)).isDirectory()
);

for (const dir of legendDirs) {
  const files = fs.readdirSync(path.join(decklistsDir, dir)).filter(f => f.endsWith(".json"));
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(decklistsDir, dir, file), "utf-8");
      const deck: Deck = JSON.parse(raw);
      allDecks.push(deck);
    } catch {}
  }
}

console.log(`Loaded ${allDecks.length} decks total`);

// Group by normalized legend
const byLegend: Record<string, Deck[]> = {};
for (const deck of allDecks) {
  const key = deck.legend || "Unknown";
  if (!byLegend[key]) byLegend[key] = [];
  byLegend[key].push(deck);
}

console.log(`${Object.keys(byLegend).length} unique legends\n`);

// Analyze each legend
const legendAnalyses: LegendAnalysis[] = [];

for (const [legend, decks] of Object.entries(byLegend).sort((a, b) => b[1].length - a[1].length)) {
  if (decks.length < 3) continue;

  const cardFreq: Record<string, { count: number; totalQty: number; type: string }> = {};
  const champions: Record<string, number> = {};
  const runePatterns: Record<string, number> = {};
  const bfFreq: Record<string, number> = {};
  let totalUnits = 0, totalSpells = 0, totalGears = 0, totalCards = 0;

  for (const deck of decks) {
    if (deck.champion) {
      champions[deck.champion] = (champions[deck.champion] || 0) + 1;
    }

    for (const card of deck.mainDeck) {
      if (!cardFreq[card.name]) cardFreq[card.name] = { count: 0, totalQty: 0, type: card.type };
      cardFreq[card.name].count++;
      cardFreq[card.name].totalQty += card.quantity;
    }

    totalUnits += deck.stats?.unitCount || deck.mainDeck.filter(c => c.type === "Unit").reduce((s, c) => s + c.quantity, 0);
    totalSpells += deck.stats?.spellCount || deck.mainDeck.filter(c => c.type === "Spell").reduce((s, c) => s + c.quantity, 0);
    totalGears += deck.stats?.gearCount || deck.mainDeck.filter(c => c.type === "Gear").reduce((s, c) => s + c.quantity, 0);
    totalCards += deck.mainDeck.reduce((s, c) => s + c.quantity, 0);

    // Rune pattern
    if (Array.isArray(deck.runes)) {
      const runeSplit = deck.runes.map(r => `${r.name}:${r.quantity}`).sort().join(", ");
      if (runeSplit) runePatterns[runeSplit] = (runePatterns[runeSplit] || 0) + 1;
    }

    for (const bf of deck.battlefields) {
      bfFreq[bf] = (bfFreq[bf] || 0) + 1;
    }
  }

  const n = decks.length;
  const cardAnalysis: Record<string, { count: number; totalQty: number; type: string; avgQty: number }> = {};
  for (const [name, data] of Object.entries(cardFreq)) {
    cardAnalysis[name] = { ...data, avgQty: Math.round(data.totalQty / data.count * 10) / 10 };
  }

  const core = Object.entries(cardAnalysis).filter(([, d]) => d.count / n >= 0.9).map(([name]) => name);
  const standard = Object.entries(cardAnalysis).filter(([, d]) => d.count / n >= 0.6 && d.count / n < 0.9).map(([name]) => name);
  const flex = Object.entries(cardAnalysis).filter(([, d]) => d.count / n >= 0.3 && d.count / n < 0.6).map(([name]) => name);
  const tech = Object.entries(cardAnalysis).filter(([, d]) => d.count / n >= 0.1 && d.count / n < 0.3).map(([name]) => name);

  const topPlacements = decks
    .filter(d => d.placement !== null)
    .sort((a, b) => (a.placement || 999) - (b.placement || 999))
    .slice(0, 5)
    .map(d => ({ placement: d.placement, player: d.player, tournament: d.tournament }));

  legendAnalyses.push({
    legend,
    deckCount: n,
    domains: decks[0]?.domains || [],
    champions,
    cardFrequency: cardAnalysis,
    core,
    standard,
    flex,
    tech,
    avgUnits: Math.round(totalUnits / n * 10) / 10,
    avgSpells: Math.round(totalSpells / n * 10) / 10,
    avgGears: Math.round(totalGears / n * 10) / 10,
    avgTotal: Math.round(totalCards / n * 10) / 10,
    runePatterns,
    battlefieldFreq: bfFreq,
    topPlacements,
  });
}

// Domain pair analysis
const byDomainPair: Record<string, Deck[]> = {};
for (const deck of allDecks) {
  if (deck.domains.length >= 2) {
    const pair = deck.domains.sort().join("/");
    if (!byDomainPair[pair]) byDomainPair[pair] = [];
    byDomainPair[pair].push(deck);
  }
}

const domainPairAnalyses: DomainPairAnalysis[] = [];
for (const [pair, decks] of Object.entries(byDomainPair).sort((a, b) => b[1].length - a[1].length)) {
  const cardFreq: Record<string, number> = {};
  const legendSet = new Set<string>();
  for (const deck of decks) {
    legendSet.add(deck.legend);
    for (const card of deck.mainDeck) {
      cardFreq[card.name] = (cardFreq[card.name] || 0) + 1;
    }
  }
  const n = decks.length;
  const commonCards: Record<string, { count: number; pct: number }> = {};
  const staples: string[] = [];
  for (const [name, count] of Object.entries(cardFreq).sort((a, b) => b[1] - a[1])) {
    const pct = Math.round(count / n * 100);
    if (pct >= 20) commonCards[name] = { count, pct };
    if (pct >= 50) staples.push(name);
  }
  domainPairAnalyses.push({ pair, legends: [...legendSet], deckCount: n, staples, commonCards });
}

// Global stats
const globalBfFreq: Record<string, number> = {};
const globalCardFreq: Record<string, number> = {};
for (const deck of allDecks) {
  for (const bf of deck.battlefields) globalBfFreq[bf] = (globalBfFreq[bf] || 0) + 1;
  for (const card of deck.mainDeck) globalCardFreq[card.name] = (globalCardFreq[card.name] || 0) + 1;
}

// Output
const output = {
  totalDecks: allDecks.length,
  uniqueLegends: Object.keys(byLegend).length,
  legendAnalyses: legendAnalyses.map(la => ({
    legend: la.legend,
    deckCount: la.deckCount,
    domains: la.domains,
    champions: la.champions,
    avgUnits: la.avgUnits,
    avgSpells: la.avgSpells,
    avgGears: la.avgGears,
    avgTotal: la.avgTotal,
    core: la.core.map(name => {
      const d = la.cardFrequency[name];
      return `${name} (${Math.round(d.count / la.deckCount * 100)}%, avg ${d.avgQty}x, ${d.type})`;
    }),
    standard: la.standard.map(name => {
      const d = la.cardFrequency[name];
      return `${name} (${Math.round(d.count / la.deckCount * 100)}%, avg ${d.avgQty}x, ${d.type})`;
    }),
    flex: la.flex.map(name => {
      const d = la.cardFrequency[name];
      return `${name} (${Math.round(d.count / la.deckCount * 100)}%, avg ${d.avgQty}x, ${d.type})`;
    }),
    tech: la.tech.map(name => {
      const d = la.cardFrequency[name];
      return `${name} (${Math.round(d.count / la.deckCount * 100)}%, avg ${d.avgQty}x, ${d.type})`;
    }),
    topBattlefields: Object.entries(la.battlefieldFreq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => `${name} (${Math.round(count / la.deckCount * 100)}%)`),
    topPlacements: la.topPlacements,
  })),
  domainPairs: domainPairAnalyses.map(dp => ({
    pair: dp.pair,
    deckCount: dp.deckCount,
    legends: dp.legends,
    staples: Object.entries(dp.commonCards).sort((a, b) => b[1].pct - a[1].pct).slice(0, 15).map(([name, d]) => `${name} (${d.pct}%)`),
  })),
  globalTopBattlefields: Object.entries(globalBfFreq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([name, count]) => `${name} (${Math.round(count / allDecks.length * 100)}%)`),
  globalTopCards: Object.entries(globalCardFreq).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([name, count]) => `${name} (${count} decks, ${Math.round(count / allDecks.length * 100)}%)`),
};

fs.writeFileSync(path.join(__dirname, "../data/meta-analysis.json"), JSON.stringify(output, null, 2), "utf-8");
console.log(`Analysis complete. Output: data/meta-analysis.json`);
console.log(`Legends with 3+ decks: ${legendAnalyses.length}`);
console.log(`Domain pairs: ${domainPairAnalyses.length}`);

// Print summary for top legends
for (const la of legendAnalyses.slice(0, 10)) {
  console.log(`\n--- ${la.legend} (${la.deckCount} decks) ---`);
  console.log(`  Domains: ${la.domains.join("/")}`);
  console.log(`  Avg: ${la.avgUnits}U / ${la.avgSpells}S / ${la.avgGears}G = ${la.avgTotal}`);
  console.log(`  Core (90%+): ${la.core.length} cards`);
  console.log(`  Standard (60-89%): ${la.standard.length} cards`);
  console.log(`  Flex (30-59%): ${la.flex.length} cards`);
}
