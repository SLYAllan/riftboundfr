import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function run() {
  const decks = await p.deck.findMany({
    include: { cards: { include: { card: true } } },
  });

  const allCards = await p.card.findMany({
    select: { id: true, name: true, cleanName: true, riftboundId: true, type: true, alternateArt: true, overnumbered: true },
  });

  const nameMap = new Map<string, typeof allCards[0][]>();
  for (const c of allCards) {
    const key = c.name.toLowerCase();
    if (!nameMap.has(key)) nameMap.set(key, []);
    nameMap.get(key)!.push(c);
    if (c.cleanName) {
      const cleanKey = c.cleanName.toLowerCase();
      if (!nameMap.has(cleanKey)) nameMap.set(cleanKey, []);
      nameMap.get(cleanKey)!.push(c);
    }
  }

  for (const deck of decks) {
    const mainCount = deck.cards.filter((dc) => dc.section === "main").reduce((s, dc) => s + dc.quantity, 0);
    if (mainCount >= 39) continue;

    const linkedNames = new Set(deck.cards.map((dc) => dc.card.name.toLowerCase()));
    console.log(`\n=== ${deck.title} (${mainCount}/40 main) ===`);

    // Check for alt art linked
    for (const dc of deck.cards) {
      if (dc.card.alternateArt || dc.card.overnumbered) {
        const regular = allCards.find(
          (c) => c.name === dc.card.name.replace(/ \(.*\)$/, "") && !c.alternateArt && !c.overnumbered
        );
        console.log(`  ALT/OVER linked: "${dc.card.name}" → should be "${regular?.name ?? "??"}"`);
      }
    }
  }

  // Check for comma vs dash issues across ALL decks
  console.log("\n=== Checking comma vs dash format ===");
  for (const deck of decks) {
    for (const dc of deck.cards) {
      if (dc.card.name.includes(", ")) {
        const dashName = dc.card.name.replace(/, /g, " - ");
        const hasDash = allCards.some((c) => c.name === dashName);
        if (!hasDash) {
          // This is fine - card uses comma format
        }
      }
    }
  }

  // The real issue: which card names from the seed DON'T exist AT ALL
  // Let me check the 9 decks with <39 cards
  console.log("\n=== Re-running seed name matching for incomplete decks ===");
  const { parseDeckCode } = await import("../src/lib/deck-code");

  // Read the seed file to get deck codes
  const fs = await import("fs");
  const seedContent = fs.readFileSync("prisma/seed-sydney-bestof.ts", "utf8");

  // Extract legend names for incomplete decks
  const incompleteLegends = decks
    .filter((d) => d.cards.filter((dc) => dc.section === "main").reduce((s, dc) => s + dc.quantity, 0) < 39)
    .map((d) => d.legendName);

  console.log("Incomplete decks:", incompleteLegends.join(", "));

  // For each incomplete deck, find the card names that don't match
  for (const deck of decks) {
    const mainCount = deck.cards.filter((dc) => dc.section === "main").reduce((s, dc) => s + dc.quantity, 0);
    if (mainCount >= 39) continue;

    const linkedCardIds = new Set(deck.cards.map((dc) => dc.cardId));

    // Find what cards SHOULD be in this deck by looking at the seed
    // The deck title format is "Legend Name — Best of Sydney"
    const legendName = deck.legendName;

    // Find this entry in the seed
    const regex = new RegExp(`legend: "${legendName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?deckCode: \`([\\s\\S]*?)\``, "m");
    const match = seedContent.match(regex);
    if (!match) {
      console.log(`  Could not find seed entry for "${legendName}"`);
      continue;
    }

    const parsed = parseDeckCode(match[1]);
    const missing: string[] = [];
    for (const entry of parsed.entries) {
      const dashName = entry.name.replace(/, /g, " - ");
      const found = allCards.find(
        (c) =>
          c.name.toLowerCase() === entry.name.toLowerCase() ||
          c.name.toLowerCase() === dashName.toLowerCase() ||
          (c.cleanName && c.cleanName.toLowerCase() === entry.name.toLowerCase()) ||
          (c.cleanName && c.cleanName.toLowerCase() === dashName.toLowerCase())
      );
      if (!found) {
        missing.push(`${entry.quantity}x ${entry.name} [${entry.section}]`);
      }
    }
    if (missing.length > 0) {
      console.log(`\n  ${deck.title}:`);
      for (const m of missing) console.log(`    NOT FOUND: ${m}`);
    }
  }
}

run().finally(() => p.$disconnect());
