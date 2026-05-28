import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface RawDeck {
  placement: number;
  player: string;
  legendFull: string;
  champion: string;
  mainDeck: { name: string; quantity: number }[];
  battlefields: string[];
  runes: { domain: string; count: number }[];
  sideboard: { name: string; quantity: number }[];
}

interface CardInfo {
  type: string;
  energy: number | null;
  might: number | null;
  domains: string[];
  supertype: string | null;
  rarity: string;
  textPlain: string | null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function playerSlug(player: string): string {
  return player
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parsePlacement(s: string): number {
  return parseInt(s.replace(/\D/g, ""), 10);
}

function parseRawFile(content: string): RawDeck[] {
  const decks: RawDeck[] = [];
  const lines = content.split("\n");
  let i = 0;

  // Skip instruction header
  while (i < lines.length && !lines[i].match(/^\d+(st|nd|rd|th)\s/i) && !lines[i].match(/decklist by/i)) {
    i++;
  }

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }

    // Match deck header patterns:
    // "1st - Prismаticismism - Annie"
    // "2nd CTCG Koko Lopez - Draven"
    // "3rd Irelia, Blade Dancer by HаruKаze"
    // ""Master Yi, Wuju Bladesman" decklist by Brian W. 16th"
    let placement: number | null = null;
    let player = "";
    let headerLegend = "";

    const m1 = line.match(/^(\d+)(st|nd|rd|th)\s+[-–]\s*(.+?)\s*[-–]\s*(\w+)/i);
    const m2 = line.match(/^(\d+)(st|nd|rd|th)\s+(.+?)\s+by\s+(.+)/i);
    const m3 = line.match(/^(\d+)(st|nd|rd|th)\s+(.+?)\s*[-–]\s*(.+)/i);
    const m4 = line.match(/^"?([^"]+?)"?\s+decklist by\s+(.+?)\.\s*(\d+)(st|nd|rd|th)/i);
    const m5 = line.match(/^(\d+)(st|nd|rd|th)\s+(.+)/i);

    if (m1) {
      placement = parseInt(m1[1]);
      player = m1[3].trim();
      headerLegend = m1[4].trim();
    } else if (m4) {
      headerLegend = m4[1].trim();
      player = m4[2].trim();
      placement = parseInt(m4[3]);
    } else if (m2) {
      placement = parseInt(m2[1]);
      headerLegend = m2[3].trim(); // This is actually the legend in format "Irelia, Blade Dancer"
      player = m2[4].trim();
    } else if (m3) {
      placement = parseInt(m3[1]);
      player = m3[3].trim();
      headerLegend = m3[4].trim();
    } else if (m5) {
      placement = parseInt(m5[1]);
      const rest = m5[3].trim();
      player = rest;
    } else {
      i++;
      continue;
    }

    i++;

    // Now find Legend line
    let legendFull = "";
    let champion = "";
    const mainDeck: { name: string; quantity: number }[] = [];
    const battlefields: string[] = [];
    const runes: { domain: string; count: number }[] = [];
    const sideboard: { name: string; quantity: number }[] = [];

    // Skip blank lines
    while (i < lines.length && !lines[i].trim()) i++;

    // Parse sections
    let currentSection = "";
    while (i < lines.length) {
      const l = lines[i].trim();

      // Check if next deck header
      if (l.match(/^\d+(st|nd|rd|th)\s/i) || l.match(/^"?[A-Z].*decklist by/i)) {
        break;
      }
      // Check for next instruction line at end
      if (l.startsWith("Ensuite fais")) break;

      if (l === "Legend:" || l === "Legend") {
        currentSection = "legend";
        i++;
        continue;
      }
      if (l === "Champion:" || l === "Champion") {
        currentSection = "champion";
        i++;
        continue;
      }
      if (l === "MainDeck:" || l === "MainDeck" || l === "Main Deck:" || l === "Main Deck") {
        currentSection = "main";
        i++;
        continue;
      }
      if (l.startsWith("Battlefield") || l === "Battlefields:") {
        currentSection = "battlefield";
        i++;
        continue;
      }
      if (l.startsWith("Rune Pool") || l === "Rune Pool:") {
        currentSection = "rune";
        i++;
        continue;
      }
      if (l.startsWith("Sideboard") || l === "Sideboard:") {
        currentSection = "side";
        i++;
        continue;
      }

      const cardMatch = l.match(/^(\d+)\s+(.+)/);
      if (cardMatch) {
        const qty = parseInt(cardMatch[1]);
        const name = cardMatch[2].trim();
        switch (currentSection) {
          case "legend":
            legendFull = name;
            break;
          case "champion":
            champion = name;
            break;
          case "main":
            mainDeck.push({ name, quantity: qty });
            break;
          case "battlefield":
            battlefields.push(name);
            break;
          case "rune":
            runes.push({ domain: name.replace(" Rune", ""), count: qty });
            break;
          case "side":
            sideboard.push({ name, quantity: qty });
            break;
        }
      }
      i++;
    }

    if (placement !== null && legendFull) {
      decks.push({
        placement,
        player: player || "Unknown",
        legendFull,
        champion,
        mainDeck,
        battlefields,
        runes,
        sideboard,
      });
    }
  }
  return decks;
}

function assignRole(
  cardName: string,
  info: CardInfo | undefined,
  legendName: string,
  championName: string,
): string {
  if (!info) return "flex";

  const name = cardName.toLowerCase();
  const text = (info.textPlain || "").toLowerCase();
  const cost = info.energy ?? 0;

  // Champion
  if (info.supertype === "Champion" || cardName === championName) return "champion";

  // Equipment/Gear
  if (info.type === "Gear") {
    if (text.includes("conquer") || text.includes("attack")) return "equipment";
    return "equipment";
  }

  // Rune type cards
  if (info.type === "Rune") return "engine";

  // Spells
  if (info.type === "Spell") {
    if (text.includes("destroy") || text.includes("kill") || text.includes("damage") && text.includes("enemy"))
      return "removal";
    if (text.includes("draw") || text.includes("look at") || text.includes("create"))
      return "draw";
    if (text.includes("cannot") || text.includes("barrier") || text.includes("shield") || text.includes("tough"))
      return "protection";
    if (text.includes("buff") || text.includes("+") || text.includes("grant") || text.includes("give"))
      return "combat_trick";
    if (name.includes("rebuke") || name.includes("gust") || name.includes("defy") || name.includes("not so fast"))
      return "combat_trick";
    if (name.includes("stacked deck") || name.includes("switcheroo") || name.includes("hard bargain"))
      return "draw";
    if (name.includes("ride the wind") || name.includes("flash") || name.includes("charm"))
      return "combat_trick";
    if (name.includes("discipline") || name.includes("en garde") || name.includes("punch first"))
      return "combat_trick";
    if (name.includes("cleave") || name.includes("falling star") || name.includes("thermo beam"))
      return "removal";
    if (name.includes("defiant dance") || name.includes("counter strike"))
      return "combat_trick";
    if (name.includes("challenge") || name.includes("confront"))
      return "combat_trick";
    if (name.includes("sabotage") || name.includes("factory recall"))
      return "tech";
    return "flex";
  }

  // Units
  if (info.type === "Unit") {
    if (cost <= 3) return "early_unit";
    if (cost <= 5) return "mid_threat";
    if (cost >= 6) return "finisher";
    return "mid_threat";
  }

  return "flex";
}

function deduceDomains(runes: { domain: string; count: number }[]): string[] {
  return runes
    .sort((a, b) => b.count - a.count)
    .map((r) => r.domain);
}

function deduceArchetype(
  mainDeck: { name: string; quantity: number }[],
  info: Map<string, CardInfo>,
  domains: string[],
  legendName: string,
): string {
  let units = 0, spells = 0, gear = 0;
  let lowCost = 0, highCost = 0;
  const totalCards = mainDeck.reduce((s, c) => s + c.quantity, 0);

  for (const card of mainDeck) {
    const ci = info.get(card.name);
    if (!ci) continue;
    const qty = card.quantity;
    if (ci.type === "Unit") units += qty;
    if (ci.type === "Spell") spells += qty;
    if (ci.type === "Gear") gear += qty;
    const cost = ci.energy ?? 0;
    if (cost <= 3) lowCost += qty;
    if (cost >= 6) highCost += qty;
  }

  const legend = legendName.toLowerCase();

  // Specific legend archetypes
  if (legend.includes("ornn")) return "midrange-forge";
  if (legend.includes("azir")) return "equipment-tokens";
  if (legend.includes("viktor")) return "control";
  if (legend.includes("lux")) return "control";
  if (legend.includes("renata")) return "control";
  if (legend.includes("leona")) return "midrange-defense";
  if (legend.includes("fiora")) return "buff-midrange";
  if (legend.includes("volibear")) return "aurora-ramp";
  if (legend.includes("rumble")) return "aggro-mech";
  if (legend.includes("miss fortune")) return "aurora-midrange";
  if (legend.includes("garen")) return "aurora-midrange";
  if (legend.includes("yasuo")) return "tempo";

  if (lowCost / totalCards > 0.65) {
    if (domains.includes("Fury")) return "aggro";
    return "aggro-tempo";
  }
  if (highCost / totalCards > 0.2) return "midrange";
  if (spells / totalCards > 0.5) return "control";
  if (gear / totalCards > 0.2) return "equipment-midrange";

  // Domain-based defaults
  if (domains.includes("Calm") && domains.includes("Chaos")) return "tempo";
  if (domains.includes("Fury") && domains.includes("Chaos")) return "aggro-tempo";
  if (domains.includes("Body") && domains.includes("Order")) return "buff-midrange";
  if (domains.includes("Body") && domains.includes("Fury")) return "aggro-equipment";
  if (domains.includes("Mind") && domains.includes("Order")) return "control";
  if (domains.includes("Body") && domains.includes("Chaos")) return "aurora-ramp";
  if (domains.includes("Calm") && domains.includes("Body")) return "hold-midrange";

  return "midrange";
}

function determineTier(placement: number, legendName: string): string {
  // Based on Atlanta results and global WR
  const topLegends: Record<string, string> = {
    "Annie, Dark Child": "S",
    "Draven, Glorious Executioner": "S",
    "Irelia, Blade Dancer": "S",
    "Ezreal, Prodigal Explorer": "S",
    "Kai'Sa, Daughter of the Void": "A",
    "Kai'sa, Daughter of the Void": "A",
    "Sett, The Boss": "A",
    "Master Yi, Wuju Bladesman": "A",
    "Lucian, Purifier": "A",
    "Darius, Hand of Noxus": "A",
    "Azir, Emperor of the Sands": "A",
    "Fiora, Grand Duelist": "B",
    "Viktor, Herald of the Arcane": "B",
    "Teemo, Swift Scout": "B",
    "Ahri, Nine-Tailed Fox": "B",
    "Jinx, Loose Cannon": "B",
    "Sivir, Battle Mistress": "B",
    "Rengar, Pridestalker": "B",
  };
  return topLegends[legendName] || "C";
}

async function main() {
  const rawPath = path.join(__dirname, "..", "data", "temp-atlanta-raw.txt");
  const raw = fs.readFileSync(rawPath, "utf-8");
  const decks = parseRawFile(raw);
  console.log(`Parsed ${decks.length} decks`);

  // Get all card info from DB
  const allCards = await prisma.card.findMany({
    select: {
      name: true,
      type: true,
      energy: true,
      might: true,
      domains: true,
      supertype: true,
      rarity: true,
      textPlain: true,
    },
  });
  const cardMap = new Map<string, CardInfo>();
  for (const c of allCards) {
    cardMap.set(c.name, {
      type: c.type,
      energy: c.energy,
      might: c.might,
      domains: c.domains,
      supertype: c.supertype,
      rarity: c.rarity,
      textPlain: c.textPlain,
    });
  }
  console.log(`Loaded ${cardMap.size} cards from DB`);

  // Fix known issues
  for (const d of decks) {
    // Deck 112 Trevor C.: Legend says Reksai but is actually Draven
    if (d.placement === 112 && d.player.includes("Trevor") && d.legendFull.includes("Reksai")) {
      d.legendFull = "Draven, Glorious Executioner";
    }
    // Darius, Executioner -> Darius, Trifarian (in mainDeck card names, different from legend)
    for (const card of d.mainDeck) {
      if (card.name === "Darius, Executioner") card.name = "Darius, Trifarian";
    }
    // Normalize Kai'sa capitalization
    if (d.legendFull === "Kai'sa, Daughter of the Void") {
      d.legendFull = "Kai'Sa, Daughter of the Void";
    }
    // Reksai -> Rek'Sai
    if (d.legendFull === "Reksai, Void Burrower") {
      d.legendFull = "Rek'Sai, Void Burrower";
    }
  }

  const baseDir = path.join(__dirname, "..", "data", "decklists");
  let generated = 0;
  const missingCards = new Set<string>();

  for (const deck of decks) {
    const domains = deduceDomains(deck.runes);
    const archetype = deduceArchetype(deck.mainDeck, cardMap, domains, deck.legendFull);
    const tier = determineTier(deck.placement, deck.legendFull);
    const legendSlug = slugify(deck.legendFull);
    const pSlug = playerSlug(deck.player);

    const mainDeckEntries = deck.mainDeck.map((c) => {
      const ci = cardMap.get(c.name);
      if (!ci) missingCards.add(c.name);
      return {
        name: c.name,
        quantity: c.quantity,
        type: ci?.type || "Unknown",
        cost: ci?.energy ?? 0,
        role: assignRole(c.name, ci, deck.legendFull, deck.champion),
      };
    });

    const sideEntries = deck.sideboard.map((c) => {
      const ci = cardMap.get(c.name);
      if (!ci) missingCards.add(c.name);
      return {
        name: c.name,
        quantity: c.quantity,
        type: ci?.type || "Unknown",
        cost: ci?.energy ?? 0,
        role: assignRole(c.name, ci, deck.legendFull, deck.champion),
      };
    });

    const runeObj: Record<string, number> = {};
    for (const r of deck.runes) {
      runeObj[r.domain] = r.count;
    }

    const deckJson = {
      id: `atlanta-rq-${deck.placement}-${pSlug}`,
      legend: deck.legendFull,
      champion: deck.champion,
      player: deck.player,
      tournament: "Atlanta Regional Qualifier",
      date: "2026-04-29",
      placement: deck.placement,
      set: "Spiritforged",
      archetype,
      tier,
      domains,
      mainDeck: mainDeckEntries,
      runes: runeObj,
      battlefields: deck.battlefields,
      sideDeck: sideEntries,
      notes: "",
    };

    const dir = path.join(baseDir, legendSlug);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `atlanta-rq-${deck.placement}-${pSlug}.json`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, JSON.stringify(deckJson, null, 2), "utf-8");
    generated++;
  }

  console.log(`Generated ${generated} decklist files`);
  if (missingCards.size > 0) {
    console.log(`Cards not found in DB (${missingCards.size}):`);
    for (const c of missingCards) console.log(`  - ${c}`);
  }

  // Update decklists-index.json
  const indexPath = path.join(__dirname, "..", "data", "decklists-index.json");
  const existingIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));

  // Build Atlanta legend stats
  const legendMap = new Map<string, {
    count: number;
    bestPlacement: number;
    tournaments: Set<string>;
    domains: string[];
    archetype: string;
    tier: string;
    sources: string[];
  }>();

  for (const deck of decks) {
    const existing = legendMap.get(deck.legendFull);
    const domains = deduceDomains(deck.runes);
    const arch = deduceArchetype(deck.mainDeck, cardMap, domains, deck.legendFull);
    const tier = determineTier(deck.placement, deck.legendFull);
    const pSlug2 = playerSlug(deck.player);

    if (!existing) {
      legendMap.set(deck.legendFull, {
        count: 1,
        bestPlacement: deck.placement,
        tournaments: new Set(["Atlanta RQ"]),
        domains,
        archetype: arch,
        tier,
        sources: [`atlanta-rq-${deck.placement}-${pSlug2}`],
      });
    } else {
      existing.count++;
      if (deck.placement < existing.bestPlacement) {
        existing.bestPlacement = deck.placement;
        existing.archetype = arch;
      }
      existing.tournaments.add("Atlanta RQ");
      existing.sources.push(`atlanta-rq-${deck.placement}-${pSlug2}`);
    }
  }

  // Merge into existing index
  for (const [legend, stats] of legendMap) {
    const ex = existingIndex.byLegend[legend];
    if (ex) {
      ex.count += stats.count;
      if (stats.bestPlacement < (ex.bestPlacement ?? Infinity)) {
        ex.bestPlacement = stats.bestPlacement;
      }
      ex.tournaments = [...new Set([...ex.tournaments, ...stats.tournaments])];
      ex.sources = [...ex.sources, ...stats.sources];
    } else {
      existingIndex.byLegend[legend] = {
        count: stats.count,
        bestPlacement: stats.bestPlacement,
        tournaments: [...stats.tournaments],
        domains: stats.domains,
        tier: stats.tier,
        archetype: stats.archetype,
        sources: stats.sources,
      };
    }
  }

  existingIndex.totalDecklists += decks.length;
  existingIndex.sources.atlantaRQ = decks.length;

  existingIndex.byTournament["Atlanta Regional Qualifier"] = {
    count: decks.length,
    date: "2026-04-29",
    totalPlayers: 1500,
    set: "Spiritforged",
    source: `Best of Atlanta (${decks.length} decklists)`
  };

  existingIndex.lastUpdated = "2026-05-25";

  fs.writeFileSync(indexPath, JSON.stringify(existingIndex, null, 2), "utf-8");
  console.log("Updated decklists-index.json");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
