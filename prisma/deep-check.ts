import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function run() {
  // Check if Lee Sin - Tempest exists
  const searches = [
    "Lee Sin", "Ivern", "Tempest", "Rootcaller", "Bright Steel",
    "Emperor", "Pounce", "Final Boss", "Laser", "Lunar",
    "Faefolk"
  ];
  for (const s of searches) {
    const cards = await p.card.findMany({
      where: { name: { contains: s, mode: "insensitive" } },
      select: { name: true, type: true, alternateArt: true, overnumbered: true },
      take: 10,
    });
    console.log(`"${s}": ${cards.map((c) => `${c.name} [${c.type}]${c.alternateArt ? " ALT" : ""}${c.overnumbered ? " OVER" : ""}`).join(", ") || "NONE"}`);
  }

  // Check why some decks have 38/40 - check ALL card names in those decks
  console.log("\n=== Checking Fiora deck missing 2 cards ===");
  const fioraDeck = await p.deck.findFirst({
    where: { legendName: { contains: "Fiora" } },
    include: { cards: { include: { card: { select: { name: true } } } } },
  });
  if (fioraDeck) {
    const linked = fioraDeck.cards.map((dc) => `${dc.quantity}x ${dc.card.name} [${dc.section}]`);
    console.log("Linked cards:", linked.join(", "));
    console.log("Total main:", fioraDeck.cards.filter((dc) => dc.section === "main").reduce((s, dc) => s + dc.quantity, 0));
  }

  // Check Draven deck
  console.log("\n=== Checking Draven deck missing 3 cards ===");
  const dravenDeck = await p.deck.findFirst({
    where: { legendName: { contains: "Draven" } },
    include: { cards: { include: { card: { select: { name: true } } } } },
  });
  if (dravenDeck) {
    const linked = dravenDeck.cards.map((dc) => `${dc.quantity}x ${dc.card.name} [${dc.section}]`);
    console.log("Linked cards:", linked.join(", "));
  }

  // Check if "Draven, Audacious" exists (it's in the deck code)
  const dravenCards = await p.card.findMany({
    where: { name: { contains: "Draven", mode: "insensitive" } },
    select: { name: true, type: true, supertype: true },
  });
  console.log("\nAll Draven cards:", dravenCards.map((c) => `${c.name} [${c.type}/${c.supertype}]`).join(", "));

  // Check Miss Fortune
  const mfCards = await p.card.findMany({
    where: { name: { contains: "Miss Fortune", mode: "insensitive" } },
    select: { name: true, type: true, supertype: true },
  });
  console.log("\nAll MF cards:", mfCards.map((c) => `${c.name} [${c.type}/${c.supertype}]`).join(", "));

  // Check "Invert Timelines"
  const invert = await p.card.findMany({
    where: { name: { contains: "Invert", mode: "insensitive" } },
    select: { name: true },
  });
  console.log("\nInvert search:", invert.map((c) => c.name).join(", ") || "NONE");

  // Check "Fading Memories"
  const fading = await p.card.findMany({
    where: { name: { contains: "Fading", mode: "insensitive" } },
    select: { name: true },
  });
  console.log("Fading search:", fading.map((c) => c.name).join(", ") || "NONE");
}

run().finally(() => p.$disconnect());
