import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function run() {
  const searches = ["Fireball", "Laser", "Lunar", "Final Boss", "Whim", "Pounce", "Bright Steel", "Hammer", "Unstoppable", "Nidalee"];
  for (const s of searches) {
    const cards = await p.card.findMany({
      where: { name: { contains: s, mode: "insensitive" } },
      select: { name: true, type: true, set: true, alternateArt: true, overnumbered: true },
      take: 10,
    });
    console.log(`${s}: ${cards.length ? cards.map((c) => `${c.name}${c.alternateArt ? " (ALT)" : ""}${c.overnumbered ? " (OVER)" : ""}`).join(", ") : "NONE"}`);
  }

  // Also check what Poppy (Body/Fury) deck could use instead of Fireball and Hammer Slam
  console.log("\n--- Body/Fury spells for Poppy ---");
  const spells = await p.card.findMany({
    where: { type: "Spell", domains: { hasSome: ["Body", "Fury"] }, alternateArt: false, overnumbered: false },
    select: { name: true, energy: true, domains: true },
    orderBy: { name: "asc" },
  });
  for (const s of spells) console.log(`  ${s.name} (${s.energy}E) [${s.domains.join("/")}]`);
}

run().finally(() => p.$disconnect());
