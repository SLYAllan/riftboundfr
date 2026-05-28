import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface JsonDeck {
  legend: string;
  champion?: string | null;
  player: string;
  tournament: string;
  placement: number | null;
  mainDeck: { name: string; quantity: number }[];
  runes: Record<string, number> | { name: string; quantity: number }[];
  battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
  sideboard?: { name: string; quantity: number }[];
}

async function main() {
  // 1. Load all JSON decklists
  const decklistsDir = path.join(__dirname, "../data/decklists");
  const allJsonDecks: JsonDeck[] = [];
  for (const dir of fs.readdirSync(decklistsDir)) {
    const full = path.join(decklistsDir, dir);
    if (!fs.statSync(full).isDirectory()) continue;
    for (const file of fs.readdirSync(full).filter((f) => f.endsWith(".json"))) {
      try {
        allJsonDecks.push(JSON.parse(fs.readFileSync(path.join(full, file), "utf-8")));
      } catch {}
    }
  }
  console.log(`Loaded ${allJsonDecks.length} JSON decklists`);

  // 2. Tournament name mapping DB -> JSON
  const tournamentMap: Record<string, string[]> = {
    "RQ Atlanta 2026": ["Atlanta Regional Qualifier"],
    "RQ Bologna 2026": ["Bologna Regional Qualifier"],
    "RQ Las Vegas 2026": ["Las Vegas Regional Qualifier"],
    "RQ Lille 2026": ["Lille Regional Qualifier"],
    "RQ Houston 2025": ["Houston Regional Qualifier"],
    "RQ Sydney 2026": ["Sydney Regional Qualifier"],
    "Xi'an Regional Open S3": ["S3 Xi'an Regional Open"],
    "Fuzhou Regional Qualifier": ["Fuzhou Regional"],
    "Suzhou Regional Qualifier": ["Suzhou Regional"],
    "Shenzhen National Open S2": ["S2 Shenzhen National Open"],
    "Guangzhou Regional Open": ["Guangzhou Regional Open (Full)", "Guangzhou Regional Open"],
    "Shanghai National Open": ["Shanghai National Open"],
    "Beijing Regional Open": ["Beijing Regional Open (Day 2)"],
    "Chongqing Regional Open": ["Chongqing Regional Open (Full)", "Chongqing Regional Open"],
    "Shanghai City Challenge": ["Shanghai City Challenge"],
    "Beijing Regional Open Day 1": ["Beijing Regional Open (Day 1)"],
  };

  // Build lookup: jsonTournament -> JsonDeck[]
  const jsonByTournament = new Map<string, JsonDeck[]>();
  for (const jd of allJsonDecks) {
    const key = (jd.tournament || "").toLowerCase();
    if (!jsonByTournament.has(key)) jsonByTournament.set(key, []);
    jsonByTournament.get(key)!.push(jd);
  }

  function normPlayer(p: string): string {
    return p.toLowerCase().normalize("NFC").replace(/[^a-z0-9一-鿿぀-ゟ゠-ヿ]/g, "");
  }

  function normLegend(l: string): string {
    return l
      .replace(/\s*\((?:Metal|Overnumbered|Alternate Art|Signature)\)\s*/g, "")
      .replace(/, /g, " - ")
      .toLowerCase()
      .trim();
  }

  // 3. Card resolution
  const allCards = await prisma.card.findMany({
    where: { alternateArt: false },
    select: { id: true, name: true, cleanName: true, type: true },
  });

  const cardByName = new Map<string, (typeof allCards)[0]>();
  for (const c of allCards) {
    const key = c.name.toLowerCase();
    if (!cardByName.has(key)) cardByName.set(key, c);
    const noApo = key.replace(/[''\']/g, "");
    if (!cardByName.has(noApo)) cardByName.set(noApo, c);
    if (c.cleanName) {
      const ck = c.cleanName.toLowerCase();
      if (!cardByName.has(ck)) cardByName.set(ck, c);
    }
    const dash = key.replace(/, /g, " - ");
    if (dash !== key && !cardByName.has(dash)) cardByName.set(dash, c);
  }

  const manualAliases: Record<string, string> = {
    "mischievous marai": "mischevious marai",
    "yi, meditative": "master yi - meditative",
  };

  function resolveCard(name: string) {
    const key = name.toLowerCase();
    return (
      cardByName.get(key) ??
      cardByName.get(key.replace(/, /g, " - ")) ??
      cardByName.get(key.replace(/[''\']/g, "")) ??
      cardByName.get(key.replace(/, /g, " - ").replace(/[''\']/g, "")) ??
      (manualAliases[key] ? cardByName.get(manualAliases[key]) : undefined)
    );
  }

  const domainNames = new Set(["calm", "chaos", "fury", "order", "body", "mind"]);

  // 4. Process all bad decks
  const allDecks = await prisma.deck.findMany({
    where: { tournamentContext: { not: null } },
    select: {
      id: true,
      playerName: true,
      legendName: true,
      tournamentContext: true,
      placement: true,
      cards: { select: { quantity: true, section: true } },
    },
  });

  const badDecks = allDecks.filter(
    (d) => d.cards.reduce((s, c) => s + c.quantity, 0) !== 64,
  );
  console.log(`${badDecks.length} decks with != 64 cards`);

  let fixed = 0;
  let improved = 0;
  let noMatch = 0;
  let noImprovement = 0;
  const unresolvedNames = new Set<string>();

  for (const deck of badDecks) {
    const oldTotal = deck.cards.reduce((s, c) => s + c.quantity, 0);
    const dbTournament = deck.tournamentContext!;
    const jsonTournamentNames = tournamentMap[dbTournament] || [dbTournament];

    const candidates: JsonDeck[] = [];
    for (const jtn of jsonTournamentNames) {
      candidates.push(...(jsonByTournament.get(jtn.toLowerCase()) || []));
    }

    if (candidates.length === 0) {
      noMatch++;
      continue;
    }

    const dbPlayer = normPlayer(deck.playerName || "");
    const dbLegend = normLegend(deck.legendName || "");

    let matched: JsonDeck | undefined;
    // player + legend
    for (const jd of candidates) {
      if (normPlayer(jd.player) === dbPlayer && normLegend(jd.legend) === dbLegend) {
        matched = jd;
        break;
      }
    }
    // player only
    if (!matched) {
      for (const jd of candidates) {
        if (normPlayer(jd.player) === dbPlayer) {
          matched = jd;
          break;
        }
      }
    }
    // placement + legend
    if (!matched && deck.placement) {
      const placeNum = parseInt(deck.placement);
      if (!isNaN(placeNum)) {
        for (const jd of candidates) {
          if (jd.placement === placeNum && normLegend(jd.legend) === dbLegend) {
            matched = jd;
            break;
          }
        }
      }
    }

    if (!matched) {
      noMatch++;
      continue;
    }

    // Build complete card list from JSON
    const newCards: { cardId: string; quantity: number; section: string }[] = [];

    // Legend
    const legendCard = resolveCard(matched.legend);
    if (legendCard) newCards.push({ cardId: legendCard.id, quantity: 1, section: "legend" });

    // Champion
    if (matched.champion) {
      const cc = resolveCard(matched.champion);
      if (cc) newCards.push({ cardId: cc.id, quantity: 1, section: "legend" });
      else unresolvedNames.add(matched.champion);
    }

    // Main deck
    for (const e of matched.mainDeck || []) {
      const c = resolveCard(e.name);
      if (c) newCards.push({ cardId: c.id, quantity: e.quantity, section: "main" });
      else unresolvedNames.add(e.name);
    }

    // Runes
    if (Array.isArray(matched.runes)) {
      for (const r of matched.runes) {
        const c = resolveCard(r.name);
        if (c) newCards.push({ cardId: c.id, quantity: r.quantity, section: "rune" });
        else unresolvedNames.add(r.name);
      }
    } else if (matched.runes && typeof matched.runes === "object") {
      // Domain counts: {"Calm": 6, "Chaos": 6} -> resolve to "Calm Rune", "Chaos Rune" cards
      for (const [domain, qty] of Object.entries(matched.runes)) {
        if (domainNames.has(domain.toLowerCase())) {
          const runeName = `${domain} Rune`;
          const c = resolveCard(runeName);
          if (c) newCards.push({ cardId: c.id, quantity: qty as number, section: "rune" });
          else unresolvedNames.add(runeName);
        } else {
          // Might be a card name used as key
          const c = resolveCard(domain);
          if (c) newCards.push({ cardId: c.id, quantity: qty as number, section: "rune" });
          else unresolvedNames.add(domain);
        }
      }
    }

    // Battlefields
    for (const bf of matched.battlefields || []) {
      const c = resolveCard(bf);
      if (c) newCards.push({ cardId: c.id, quantity: 1, section: "battlefield" });
      else unresolvedNames.add(bf);
    }

    // Sideboard
    const sideEntries = matched.sideDeck || matched.sideboard || [];
    for (const e of sideEntries) {
      const c = resolveCard(e.name);
      if (c) newCards.push({ cardId: c.id, quantity: e.quantity, section: "side" });
      else unresolvedNames.add(e.name);
    }

    // Dedup by cardId:section
    const seen = new Set<string>();
    const uniqueCards = newCards.filter((c) => {
      const key = `${c.cardId}:${c.section}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const newTotal = uniqueCards.reduce((s, c) => s + c.quantity, 0);

    // Only replace if strictly better (closer to 64)
    const oldDist = Math.abs(oldTotal - 64);
    const newDist = Math.abs(newTotal - 64);
    if (newDist >= oldDist) {
      noImprovement++;
      continue;
    }

    // Delete all existing cards and reimport
    await prisma.deckCard.deleteMany({ where: { deckId: deck.id } });
    await prisma.deckCard.createMany({
      data: uniqueCards.map((c) => ({
        deckId: deck.id,
        cardId: c.cardId,
        quantity: c.quantity,
        section: c.section,
      })),
    });

    if (newTotal === 64) {
      fixed++;
    } else {
      improved++;
      if (improved <= 10) {
        console.log(`  PARTIAL ${deck.playerName} | ${dbTournament}: ${oldTotal} -> ${newTotal}`);
      }
    }
  }

  console.log(`\n=== Résultats ===`);
  console.log(`Réparés à 64: ${fixed}`);
  console.log(`Améliorés: ${improved}`);
  console.log(`Pas d'amélioration: ${noImprovement}`);
  console.log(`JSON non trouvé: ${noMatch}`);

  if (unresolvedNames.size > 0) {
    console.log(`\nCartes non résolues (${unresolvedNames.size}):`);
    for (const n of [...unresolvedNames].sort().slice(0, 20)) console.log(`  - ${n}`);
    if (unresolvedNames.size > 20) console.log(`  ... et ${unresolvedNames.size - 20} de plus`);
  }

  const finalDecks = await prisma.deck.findMany({
    where: { tournamentContext: { not: null } },
    select: { cards: { select: { quantity: true } } },
  });
  let stillBad = 0;
  for (const d of finalDecks) {
    if (d.cards.reduce((s, c) => s + c.quantity, 0) !== 64) stillBad++;
  }
  console.log(`\nDecks encore != 64 cartes: ${stillBad} / ${finalDecks.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
