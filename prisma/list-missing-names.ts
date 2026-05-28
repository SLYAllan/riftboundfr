import { PrismaClient } from "@prisma/client";
import { parseDeckCode } from "../src/lib/deck-code";
import * as fs from "fs";

const p = new PrismaClient();

async function run() {
  const seedContent = fs.readFileSync("prisma/seed-sydney-bestof.ts", "utf8");
  const allCards = await p.card.findMany({
    select: { id: true, name: true, cleanName: true, alternateArt: true, overnumbered: true },
    where: { alternateArt: false, overnumbered: false },
  });

  const decks = await p.deck.findMany({ include: { cards: { include: { card: { select: { id: true, name: true } } } } } });
  const lines: string[] = [];

  for (const deck of decks) {
    const legendName = deck.legendName;
    const escaped = legendName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`legend: "${escaped}"[\\s\\S]*?deckCode: \`([\\s\\S]*?)\``, "m");
    const match = seedContent.match(regex);
    if (!match) continue;

    const parsed = parseDeckCode(match[1]);
    const seedMainEntries = parsed.entries.filter((e) => e.section === "main");
    const seedTotal = seedMainEntries.reduce((s, e) => s + e.quantity, 0);

    const dbMainCards = deck.cards.filter((dc) => dc.section === "main");
    const dbTotal = dbMainCards.reduce((s, dc) => s + dc.quantity, 0);

    if (dbTotal >= seedTotal) continue;

    // Check for quantity mismatches
    const mismatches: string[] = [];
    for (const entry of seedMainEntries) {
      const nameLC = entry.name.toLowerCase();
      const dashLC = entry.name.replace(/, /g, " - ").toLowerCase();

      const card = allCards.find(
        (c) =>
          c.name.toLowerCase() === nameLC ||
          c.name.toLowerCase() === dashLC ||
          (c.cleanName && c.cleanName.toLowerCase() === nameLC) ||
          (c.cleanName && c.cleanName.toLowerCase() === dashLC)
      );
      if (!card) continue;

      const dc = dbMainCards.find((d) => d.card.id === card.id);
      if (!dc) {
        mismatches.push(`  ${entry.quantity}x ${entry.name} — PAS en DB`);
      } else if (dc.quantity < entry.quantity) {
        mismatches.push(`  ${entry.name}: DB=${dc.quantity}, seed=${entry.quantity}`);
      }
    }

    // Check for duplicates in seed (same card name appearing twice)
    const nameCounts = new Map<string, number>();
    for (const e of seedMainEntries) {
      const key = e.name.toLowerCase();
      nameCounts.set(key, (nameCounts.get(key) || 0) + e.quantity);
    }
    for (const [name, total] of nameCounts) {
      const card = allCards.find(
        (c) => c.name.toLowerCase() === name || c.name.toLowerCase() === name.replace(/, /g, " - ")
      );
      if (!card) continue;
      const dc = dbMainCards.find((d) => d.card.id === card.id);
      if (dc && dc.quantity < total) {
        mismatches.push(`  DUPLICATE: "${card.name}" seed total=${total}, DB=${dc.quantity}`);
      }
    }

    if (mismatches.length > 0) {
      lines.push(`\n${legendName} (DB=${dbTotal}, seed=${seedTotal}):`);
      lines.push(...[...new Set(mismatches)]);
    } else {
      lines.push(`\n${legendName} (DB=${dbTotal}, seed=${seedTotal}): no mismatch found — champion moved?`);
    }
  }

  console.log(lines.join("\n"));
}
run().finally(() => p.$disconnect());
