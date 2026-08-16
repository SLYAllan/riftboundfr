import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function placementNombre(placement: string | null): number | null {
  if (!placement) return null;
  const nombre = parseInt(placement.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(nombre) ? nombre : null;
}

async function main() {
  const decks = await prisma.deck.findMany({
    where: {
      setTag: "Vendetta",
      published: true,
      tournamentContext: { not: null },
    },
    select: { legendName: true, placement: true, tournamentContext: true },
  });

  const stats = new Map<string, { decks: number; top8: number; wins: number; tournaments: Set<string> }>();
  for (const deck of decks) {
    const courant = stats.get(deck.legendName) ?? { decks: 0, top8: 0, wins: 0, tournaments: new Set<string>() };
    const placement = placementNombre(deck.placement);
    courant.decks++;
    if (placement !== null && placement <= 8) courant.top8++;
    if (placement === 1) courant.wins++;
    courant.tournaments.add(deck.tournamentContext!);
    stats.set(deck.legendName, courant);
  }

  const total = decks.length;
  const classement = [...stats.entries()]
    .map(([legendName, stat]) => ({
      legendName,
      decks: stat.decks,
      share: Number((stat.decks / total * 100).toFixed(2)),
      top8: stat.top8,
      conversion: Number((stat.top8 / stat.decks * 100).toFixed(2)),
      wins: stat.wins,
      tournaments: stat.tournaments.size,
    }))
    .sort((a, b) => b.top8 - a.top8 || b.wins - a.wins || b.conversion - a.conversion || b.decks - a.decks);

  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    set: "Vendetta",
    totalDecks: total,
    tournamentCount: new Set(decks.map((deck) => deck.tournamentContext)).size,
    classement,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
