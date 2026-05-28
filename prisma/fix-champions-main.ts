import { PrismaClient } from "@prisma/client";
import { parseDeckCode } from "../src/lib/deck-code";
import * as fs from "fs";

const p = new PrismaClient();

async function run() {
  const seedContent = fs.readFileSync("prisma/seed-sydney-bestof.ts", "utf8");
  const allCards = await p.card.findMany({
    select: { id: true, name: true, cleanName: true, alternateArt: true, overnumbered: true, supertype: true },
    where: { alternateArt: false, overnumbered: false },
  });

  const decks = await p.deck.findMany({ include: { cards: { include: { card: { select: { id: true, name: true, supertype: true } } } } } });
  let fixed = 0;

  for (const deck of decks) {
    const legendName = deck.legendName;
    const escaped = legendName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`legend: "${escaped}"[\\s\\S]*?deckCode: \`([\\s\\S]*?)\``, "m");
    const match = seedContent.match(regex);
    if (!match) continue;

    const parsed = parseDeckCode(match[1]);
    const seedMainEntries = parsed.entries.filter((e) => e.section === "main");

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

      // Check if this card is in main
      const inMain = deck.cards.find((dc) => dc.card.id === card.id && dc.section === "main");
      if (inMain) continue;

      // Check if it was moved to legend
      const inLegend = deck.cards.find((dc) => dc.card.id === card.id && dc.section === "legend");

      // Add it back to main with seed quantity
      const existing = await p.deckCard.findUnique({
        where: { deckId_cardId_section: { deckId: deck.id, cardId: card.id, section: "main" } },
      });
      if (!existing) {
        await p.deckCard.create({
          data: { deckId: deck.id, cardId: card.id, quantity: entry.quantity, section: "main" },
        });
        console.log(`  +${entry.quantity}x "${card.name}" → main in "${legendName}"`);
        fixed++;
      }
    }
  }
  console.log(`\nTotal: ${fixed} champions ajoutés en main`);
}
run().finally(() => p.$disconnect());
