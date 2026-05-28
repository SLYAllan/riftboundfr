import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function run() {
  const decks = await p.deck.findMany({ include: { cards: { include: { card: true } } } });
  const incomplete = decks
    .map((d) => ({
      name: d.legendName,
      main: d.cards.filter((dc) => dc.section === "main").reduce((s, dc) => s + dc.quantity, 0),
    }))
    .filter((d) => d.main < 40)
    .sort((a, b) => a.main - b.main);
  for (const d of incomplete) console.log(`${d.name} — ${d.main}/40`);
  console.log(`\nTotal: ${incomplete.length} decks incomplets`);
}
run().finally(() => p.$disconnect());
