#!/usr/bin/env node
// Parse a riftdecks.com markdown scrape into a structured JSON decklist
// Usage: node scripts/parse-decklist-md.js <markdown-file> <tournament-slug> <tournament-name> <date> <playerCount> <set>

const fs = require("fs");
const path = require("path");

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function parseDecklistMd(md, sourceUrl, tournamentSlug, tournamentName, tournamentDate, playerCount, setName) {
  const lines = md.split("\n");

  // --- Header parsing ---
  let player = null;
  let deckName = null;
  let placement = null;
  let legend = null;
  let champion = null;
  let domains = [];

  // Try "# DECK_NAME by PLAYER"
  const titleMatch = md.match(/^#\s+(.+?)\s+by\s+(.+)$/m);
  if (titleMatch) {
    deckName = titleMatch[1].trim();
    player = titleMatch[2].trim();
  }

  // Try description line: "DECK" decklist by PLAYER. PLACEMENTxx at TOURNAMENT ... on DATE
  const descMatch = md.match(/"[^"]*"\s+decklist by\s+([^.]+)\.\s*(\d+)\w*\s+at\s+/);
  if (descMatch) {
    if (!player) player = descMatch[1].trim();
    placement = parseInt(descMatch[2], 10);
  }

  // Fallback placement from "NNNth at" / "NNNst at" etc.
  if (!placement) {
    const plMatch = md.match(/(\d+)(?:st|nd|rd|th)\s+at\s/i);
    if (plMatch) placement = parseInt(plMatch[1], 10);
  }

  // Domains from "[Domain1 Domain2]" link
  const domainLinkMatch = md.match(/\[((?:Calm|Chaos|Fury|Order|Valor|Colorless)(?:\s+(?:Calm|Chaos|Fury|Order|Valor|Colorless))*)\]\(https:\/\/riftdecks/);
  if (domainLinkMatch) {
    domains = domainLinkMatch[1].split(/\s+/);
  }

  // Legend from breadcrumb: "3. [Legend Name](url/legends/...)"
  const breadcrumbMatch = md.match(/\d+\.\s+\[([^\]]+)\]\(https:\/\/riftdecks\.com\/legends\/constructed\//);
  if (breadcrumbMatch) {
    legend = breadcrumbMatch[1].trim();
  }

  // --- Card table parsing ---
  const sections = { legend: [], champion: [], unit: [], gear: [], spell: [], battlefields: [], runes: [], sideboard: [] };
  let currentSection = null;

  for (const line of lines) {
    // Section header: group_TYPE.png
    const sectionMatch = line.match(/group_(\w+)\.png/);
    if (sectionMatch) {
      const sType = sectionMatch[1].toLowerCase();
      if (sections[sType] !== undefined) currentSection = sType;
      continue;
    }

    // Card row: | rarity | qty | [name](url) | $price | domain(s) |
    if (currentSection && line.includes("rarity_")) {
      const rarityMatch = line.match(/rarity_(\w+)\.png/);
      const qtyMatch = line.match(/\*\*(\d+)\*\*/);
      const nameMatch = line.match(/\[([^\]]+)\]\(https:\/\/riftdecks\.com\/cards\//);
      const domainMatches = [...line.matchAll(/rune_(\w+)\.png/g)];

      if (qtyMatch && nameMatch) {
        const card = {
          name: nameMatch[1].trim(),
          quantity: parseInt(qtyMatch[1], 10),
        };
        if (rarityMatch) card.rarity = rarityMatch[1];
        if (domainMatches.length > 0) {
          card.domains = domainMatches.map(m => m[1]).filter(d => d !== "colorless");
          if (card.domains.length === 0) card.domains = ["colorless"];
        }
        sections[currentSection].push(card);
      }
    }
  }

  // Extract legend and champion from sections
  if (sections.legend.length > 0 && !legend) {
    legend = sections.legend[0].name;
  }
  if (sections.champion.length > 0) {
    champion = sections.champion[0].name;
  }

  // Build mainDeck: champion + unit + gear + spell
  const mainDeck = [];
  for (const c of sections.champion) mainDeck.push({ ...c, type: "Unit" });
  for (const c of sections.unit) mainDeck.push({ ...c, type: "Unit" });
  for (const c of sections.gear) mainDeck.push({ ...c, type: "Gear" });
  for (const c of sections.spell) mainDeck.push({ ...c, type: "Spell" });

  // Runes
  const runes = {};
  for (const r of sections.runes) {
    runes[r.name.replace(" Rune", "")] = r.quantity;
  }

  // Battlefields
  const battlefields = sections.battlefields.map(b => b.name);

  // Sideboard
  const sideDeck = [];
  for (const c of sections.sideboard) {
    const type = guessType(c.name, sections);
    sideDeck.push({ ...c, type });
  }

  // Compute stats
  const unitCount = sections.unit.reduce((s, c) => s + c.quantity, 0) + sections.champion.reduce((s, c) => s + c.quantity, 0);
  const spellCount = sections.spell.reduce((s, c) => s + c.quantity, 0);
  const gearCount = sections.gear.reduce((s, c) => s + c.quantity, 0);
  const mainTotal = unitCount + spellCount + gearCount;

  // Build legend slug for file path
  const legendSlug = legend ? slugify(legend) : "unknown";
  const playerSlug = player ? slugify(player) : "unknown";

  // If no domains detected from header, derive from runes
  if (domains.length === 0 && Object.keys(runes).length > 0) {
    domains = Object.keys(runes).map(d => d.charAt(0).toUpperCase() + d.slice(1));
  }

  const id = `${tournamentSlug}-${placement || 0}-${playerSlug}`;

  return {
    json: {
      id,
      legend: legend || "Unknown",
      champion: champion || null,
      player: player || "Unknown",
      tournament: tournamentName,
      date: tournamentDate,
      placement: placement || null,
      playerCount: parseInt(playerCount, 10) || null,
      set: setName,
      archetype: null,
      domains,
      mainDeck: mainDeck.map(c => ({
        name: c.name,
        quantity: c.quantity,
        type: c.type,
        rarity: c.rarity || null,
        domain: c.domains ? c.domains[0] : null,
      })),
      runes,
      battlefields,
      sideDeck: sideDeck.map(c => ({
        name: c.name,
        quantity: c.quantity,
        type: c.type,
        rarity: c.rarity || null,
        domain: c.domains ? c.domains[0] : null,
      })),
      totalCards: mainTotal + 1 + 12 + battlefields.length + sideDeck.reduce((s, c) => s + c.quantity, 0),
      stats: { unitCount, spellCount, gearCount },
      sourceUrl: sourceUrl || null,
    },
    legendSlug,
    playerSlug,
  };
}

function guessType(name, sections) {
  for (const c of sections.unit) if (c.name === name) return "Unit";
  for (const c of sections.gear) if (c.name === name) return "Gear";
  for (const c of sections.spell) if (c.name === name) return "Spell";
  for (const c of sections.champion) if (c.name === name) return "Unit";
  return "Unknown";
}

// CLI mode
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 6) {
    console.error("Usage: node parse-decklist-md.js <md-file> <tournament-slug> <tournament-name> <date> <playerCount> <set> [sourceUrl]");
    process.exit(1);
  }
  const [mdFile, tSlug, tName, tDate, tPlayers, tSet, sourceUrl] = args;
  const md = fs.readFileSync(mdFile, "utf-8");
  const result = parseDecklistMd(md, sourceUrl || null, tSlug, tName, tDate, tPlayers, tSet);
  console.log(JSON.stringify(result, null, 2));
}

module.exports = { parseDecklistMd, slugify };
