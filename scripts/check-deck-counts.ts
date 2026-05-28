import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const decks = await prisma.deck.findMany({
    select: {
      id: true,
      title: true,
      playerName: true,
      legendName: true,
      tournamentContext: true,
      cards: { select: { quantity: true, section: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const bad: typeof decks = [];
  for (const d of decks) {
    const total = d.cards.reduce((s, c) => s + c.quantity, 0);
    if (total !== 64) {
      bad.push(d);
      console.log(
        `[${total} cartes] ${d.playerName ?? d.title} | ${d.legendName} | ${d.tournamentContext ?? "editorial"} | sections: ${JSON.stringify(
          d.cards.reduce((acc, c) => {
            acc[c.section] = (acc[c.section] ?? 0) + c.quantity;
            return acc;
          }, {} as Record<string, number>)
        )}`
      );
    }
  }
  console.log(`\nTotal: ${bad.length} decks sur ${decks.length} n'ont pas 64 cartes`);
}

main().finally(() => prisma.$disconnect());
