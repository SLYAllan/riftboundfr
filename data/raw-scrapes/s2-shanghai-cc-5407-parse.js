'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = 'C:/Users/Allan/Documents/Claude/RiftboundFr';
const SLUG = 's2-shanghai-cc-5407';
const CACHE = path.join(ROOT, 'data/raw-scrapes', SLUG);
const DECKLISTS = path.join(ROOT, 'data/decklists');
const ERRORS = path.join(ROOT, 'data/raw-scrapes', SLUG + '-errors.txt');
const META = path.join(ROOT, 'data/raw-scrapes', SLUG + '-meta.json'); // sidecars: {id:{url,description}}

const TOURNAMENT = 'S2 Shanghai City Challenge';
const DATE = '2026-03-07';
const PLAYER_COUNT = 128;
const SET = 'Spiritforged';
const ORGANIZER = 'CTC卡牌（百联店）';
const SOURCE = 'https://riftdecks.com/riftbound-tournaments/s2-shanghai-city-challenge-tournament-decks-5407';

const legendMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/raw-scrapes/legend-map.json'), 'utf8'));
const sidecars = JSON.parse(fs.readFileSync(META, 'utf8'));

// existing legend folders
const existingFolders = new Set(fs.readdirSync(DECKLISTS).filter(f => fs.statSync(path.join(DECKLISTS, f)).isDirectory()));

function legendSlug(legend) {
  let base = legend.split(',')[0].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'').replace(/^-+/,'');
  // try to match an existing fuller folder for this legend
  // build full slug
  let full = legend.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'').replace(/^-+/,'');
  if (existingFolders.has(full)) return full;
  if (existingFolders.has(base)) return base;
  // match any folder starting with base-
  for (const f of existingFolders) { if (f.startsWith(base + '-')) return f; }
  return base;
}
function playerSlug(player) {
  if (!player) return '';
  let s = player.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,'').replace(/^-+/,'');
  return s.slice(0,30).replace(/-+$/,'');
}

function parseDeck(id, md, desc, url) {
  // Legend via card images
  const imgRe = /\/img\/cards\/riftbound\/([A-Za-z]+)\/([a-z]+)-(\d+)([a-z]?)-[^)]*\.png/g;
  let m, legend = null;
  const seenKeys = [];
  while ((m = imgRe.exec(md)) !== null) {
    const set = m[1].toUpperCase();
    const num = Number(m[3]);
    const key = set + '-' + num;
    seenKeys.push(key);
    if (legendMap[key]) { legend = legendMap[key]; break; }
  }
  if (!legend) {
    // try all keys not just first
    for (const k of seenKeys) { if (legendMap[k]) { legend = legendMap[k]; break; } }
  }
  if (!legend) return { error: 'no-legend' };

  // player/placement/date from description
  let player = null, placement = null, date = DATE;
  if (desc) {
    let pm = desc.match(/decklist by (.+?)\.\s+\d+(?:st|nd|rd|th) at/);
    if (pm) player = pm[1].trim();
    let plm = desc.match(/(\d+)(?:st|nd|rd|th) at/);
    if (plm) placement = parseInt(plm[1], 10);
    let dm = desc.match(/on (\d{4}-\d{2}-\d{2})/);
    if (dm) date = dm[1];
  }

  // Walk lines tracking section
  const lines = md.split('\n');
  let section = null;
  let champion = null;
  const mainDeck = [];
  const runes = [];
  const battlefields = [];
  const sideboard = [];
  let pendingRarity = null;

  const groupRe = /group_(champion|unit|gear|spell|battlefields|runes|sideboard)\.png/;
  const rarityRe = /!\[(common|uncommon|rare|epic|showcase|mythic)\]\([^)]*rarity_\1\.png\)/;
  // card entry: **qty**[Name](url) then domain rune icon possibly same/next lines
  const cardRe = /\*\*(\d+)\*\*\[([^\]]+)\]\(https:\/\/riftdecks\.com\/cards\/[^)]*\)/;
  const domainRe = /rune_(calm|order|fury|body|chaos|mind|colorless)\.png/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const g = line.match(groupRe);
    if (g) { section = g[1]; continue; }
    const rr = line.match(rarityRe);
    if (rr) { pendingRarity = rr[1]; }
    const cm = line.match(cardRe);
    if (cm) {
      const qty = parseInt(cm[1], 10);
      const name = cm[2].trim();
      // find domain: look in this line after match, else following few lines
      let domain = null;
      let tail = line.slice(cm.index + cm[0].length);
      let dm = tail.match(domainRe);
      if (dm) domain = dm[1];
      if (!domain) {
        for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
          const dj = lines[j].match(domainRe);
          if (dj) { domain = dj[1]; break; }
          if (lines[j].match(cardRe) || lines[j].match(groupRe)) break;
        }
      }
      const rarity = pendingRarity;
      pendingRarity = null;
      if (section === 'champion') {
        champion = name;
      } else if (section === 'unit') {
        mainDeck.push({ name, quantity: qty, type: 'Unit', rarity, domain });
      } else if (section === 'gear') {
        mainDeck.push({ name, quantity: qty, type: 'Gear', rarity, domain });
      } else if (section === 'spell') {
        mainDeck.push({ name, quantity: qty, type: 'Spell', rarity, domain });
      } else if (section === 'battlefields') {
        battlefields.push(name);
      } else if (section === 'runes') {
        runes.push({ name, quantity: qty });
      } else if (section === 'sideboard') {
        sideboard.push({ name, quantity: qty, type: 'Unknown', rarity, domain });
      }
    }
  }

  // domains from Deck Stats
  let domains = [];
  const domBlock = md.split('| domains |')[1];
  if (domBlock) {
    const dre = /\|\s*(calm|order|fury|body|chaos|mind|colorless)\s*\|/gi;
    let dm2;
    const found = [];
    while ((dm2 = dre.exec(domBlock)) !== null) {
      const d = dm2[1].toLowerCase();
      if (d !== 'colorless' && !found.includes(d)) found.push(d);
    }
    domains = found.map(d => d.charAt(0).toUpperCase() + d.slice(1));
  }
  if (domains.length === 0) {
    // fallback: first two rune icons in header
    const hre = /rune_(calm|order|fury|body|chaos|mind)\.png/g;
    let hm; const f = [];
    while ((hm = hre.exec(md)) !== null) { if (!f.includes(hm[1])) f.push(hm[1]); if (f.length === 2) break; }
    domains = f.map(d => d.charAt(0).toUpperCase() + d.slice(1));
  }

  const unitCount = mainDeck.filter(c => c.type === 'Unit').reduce((a, c) => a + c.quantity, 0);
  const spellCount = mainDeck.filter(c => c.type === 'Spell').reduce((a, c) => a + c.quantity, 0);
  const gearCount = mainDeck.filter(c => c.type === 'Gear').reduce((a, c) => a + c.quantity, 0);
  const mainQty = mainDeck.reduce((a, c) => a + c.quantity, 0);
  const runeQty = runes.reduce((a, c) => a + c.quantity, 0);
  const totalCards = mainQty + runeQty + battlefields.length + 1 + (champion ? 1 : 0);

  return {
    deck: {
      id, legend, legendId: null, champion: champion || null, player,
      tournament: TOURNAMENT, date, placement, playerCount: PLAYER_COUNT,
      set: SET, format: 'Constructed', archetype: null, domains,
      mainDeck, runes, battlefields, sideboard, totalCards,
      stats: { unitCount, spellCount, gearCount, averageCost: null },
      sourceUrl: url
    },
    legend, player, placement
  };
}

// MAIN
const files = fs.readdirSync(CACHE).filter(f => f.endsWith('.md'));
const written = [];
const errorLines = [];
const usedNames = new Set();
let count = 0;

for (const f of files) {
  const id = f.replace(/\.md$/, '');
  const md = fs.readFileSync(path.join(CACHE, f), 'utf8');
  const sc = sidecars[id] || {};
  const url = sc.url || ('https://riftdecks.com/riftbound-metagame/' + id);
  const desc = sc.description || '';
  const res = parseDeck(id, md, desc, url);
  count++;
  if (res.error) {
    errorLines.push(url + '\t' + res.error);
    continue;
  }
  const d = res.deck;
  const lslug = legendSlug(d.legend);
  const dir = path.join(DECKLISTS, lslug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let pslug = playerSlug(d.player);
  const placeStr = (d.placement != null) ? String(d.placement) : 'unranked';
  let fname;
  if (pslug) fname = `${SLUG}-${placeStr}-${pslug}.json`;
  else fname = `${SLUG}-${placeStr}.json`;
  let full = path.join(dir, fname);
  if (usedNames.has(full)) {
    fname = fname.replace(/\.json$/, `-${id}.json`);
    full = path.join(dir, fname);
  }
  usedNames.add(full);
  fs.writeFileSync(full, JSON.stringify(d, null, 2));
  written.push({ id: d.id, legend: d.legend, player: d.player, placement: d.placement, file: `${lslug}/${fname}` });
}

if (errorLines.length) fs.writeFileSync(ERRORS, errorLines.join('\n') + '\n');

// STEP 3 tournament summary
written.sort((a, b) => (a.placement ?? 9999) - (b.placement ?? 9999));
// need domains for top placements -> read written files
function readDeck(w) { return JSON.parse(fs.readFileSync(path.join(DECKLISTS, w.file), 'utf8')); }
const top = written.filter(w => w.placement != null && w.placement <= 8).sort((a,b)=>a.placement-b.placement)
  .map(w => { const dk = readDeck(w); return { rank: w.placement, player: w.player, legend: w.legend, domains: dk.domains }; });

const legCounts = {};
for (const w of written) legCounts[w.legend] = (legCounts[w.legend] || 0) + 1;
const totalW = written.length;
const legendBreakdown = Object.entries(legCounts)
  .map(([legend, c]) => ({ legend, count: c, pct: Math.round((c / totalW) * 1000) / 10 }))
  .sort((a, b) => b.count - a.count);

const summary = {
  name: TOURNAMENT, slug: SLUG, date: DATE, location: 'Shanghai, China',
  playerCount: PLAYER_COUNT, format: 'Constructed', set: SET, organizer: ORGANIZER,
  decklistsPublished: totalW, sourceUrl: SOURCE,
  topPlacements: top, legendBreakdown
};
fs.writeFileSync(path.join(ROOT, 'data/tournaments', SLUG + '.json'), JSON.stringify(summary, null, 2));

// STEP 4 index fragment
fs.writeFileSync(path.join(ROOT, 'data/raw-scrapes/index-fragments', SLUG + '.json'),
  JSON.stringify(written.map(w => ({ id: w.id, legend: w.legend, player: w.player, placement: w.placement, file: w.file })), null, 2));

console.log(JSON.stringify({ parsed: count, written: written.length, errors: errorLines.length, legends: legendBreakdown.length }, null, 2));
