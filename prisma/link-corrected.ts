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

  const decks = await p.deck.findMany({ include: { cards: { include: { card: { select: { name: true } } } } } });
  let linked = 0;

  for (const deck of decks) {
    const legendName = deck.legendName;
    const escaped = legendName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`legend: "${escaped}"[\\s\\S]*?deckCode: \`([\\s\\S]*?)\``, "m");
    const match = seedContent.match(regex);
    if (!match) continue;

    const parsed = parseDeckCode(match[1]);
    const linkedNames = new Set(deck.cards.map((dc) => dc.card.name.toLowerCase()));

    for (const entry of parsed.entries) {
      const nameLC = entry.name.toLowerCase();
      const dashLC = entry.name.replace(/, /g, " - ").toLowerCase();
      if (linkedNames.has(nameLC) || linkedNames.has(dashLC)) continue;

      const card = allCards.find(
        (c) =>
          c.name.toLowerCase() === nameLC ||
          c.name.toLowerCase() === dashLC ||
          (c.cleanName && c.cleanName.toLowerCase() === nameLC) ||
          (c.cleanName && c.cleanName.toLowerCase() === dashLC)
      );

      if (card) {
        const existing = await p.deckCard.findUnique({
          where: { deckId_cardId_section: { deckId: deck.id, cardId: card.id, section: entry.section } },
        });
        if (!existing) {
          await p.deckCard.create({
            data: { deckId: deck.id, cardId: card.id, quantity: entry.quantity, section: entry.section },
          });
          console.log(`  Linked ${entry.quantity}x "${card.name}" → "${deck.legendName}" [${entry.section}]`);
          linked++;
        }
      }
    }
  }
  console.log(`\nTotal linked: ${linked}`);
}
run().finally(() => p.$disconnect());
