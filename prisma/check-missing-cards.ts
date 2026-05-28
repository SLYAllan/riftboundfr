import { PrismaClient } from "@prisma/client";
import { parseDeckCode } from "../src/lib/deck-code";

const prisma = new PrismaClient();

async function main() {
  // Get all decks with their cards
  const decks = await prisma.deck.findMany({
    include: { cards: { include: { card: true } } },
  });

  console.log(`=== ${decks.length} decks in DB ===\n`);

  // Check for decks missing legend section
  let missingLegends = 0;
  for (const deck of decks) {
    const hasLegendCard = deck.cards.some((dc) => dc.section === "legend");
    if (!hasLegendCard) {
      missingLegends++;
    }
  }
  console.log(`Decks missing legend DeckCard: ${missingLegends}/${decks.length}\n`);

  // Find cards referenced in seed that don't exist
  // Get all unique card names from DB
  const allCards = await prisma.card.findMany({
    select: { name: true, cleanName: true, alternateArt: true, overnumbered: true, type: true },
  });
  const cardNames = new Set(allCards.map((c) => c.name.toLowerCase()));
  const cleanNames = new Set(allCards.filter((c) => c.cleanName).map((c) => c.cleanName!.toLowerCase()));

  // Check decks for cards with 0 matching DeckCards (cards not found during seed)
  for (const deck of decks) {
    const mainCount = deck.cards.filter((dc) => dc.section === "main").reduce((s, dc) => s + dc.quantity, 0);
    if (mainCount < 38) { // Should be ~40
      console.log(`Deck "${deck.title}" — only ${mainCount}/40 main cards linked`);
      // This deck likely has missing cards
    }
  }

  // Check which alternate art cards are linked in decks
  const altArtLinked = await prisma.deckCard.findMany({
    include: { card: true },
    where: { card: { alternateArt: true } },
  });
  console.log(`\nDeckCards linked to alternate art: ${altArtLinked.length}`);
  for (const dc of altArtLinked) {
    console.log(`  - "${dc.card.name}" (alt art) in deck ${dc.deckId}`);
  }

  const overnumberedLinked = await prisma.deckCard.findMany({
    include: { card: true },
    where: { card: { overnumbered: true } },
  });
  console.log(`DeckCards linked to overnumbered: ${overnumberedLinked.length}`);
  for (const dc of overnumberedLinked) {
    console.log(`  - "${dc.card.name}" (overnumbered) in deck ${dc.deckId}`);
  }

  // List all cards with alternateArt or overnumbered
  const specialCards = allCards.filter((c) => c.alternateArt || c.overnumbered);
  console.log(`\nTotal alternate art cards: ${allCards.filter((c) => c.alternateArt).length}`);
  console.log(`Total overnumbered cards: ${allCards.filter((c) => c.overnumbered).length}`);

  // Check for specific suspicious names from the seed
  const suspiciousNames = [
    "Fireball", "Laser Beam", "Lunar Beam", "Final Boss Dragon", "Meditation",
    "Emperor's Whim", "Pounce of Faefolks", "Garbage Grabber", "Skyward Strike",
    "Disarming Rake", "Stare Down", "Arachnoid Horror", "Beast Below",
    "Bright Steel Protector", "Wind Wall", "Ruin Runner", "Trapping Grounds",
    "Hammer Slam", "Right of Conquest", "Facebreaker", "Call to Glory",
    "Grim Resolve", "Sea Monkey", "Kinkou Monk", "Kinkou Initiate",
    "Arena Bar", "Show of Strength", "Blazing Scorcher", "Minotaur Reckoner",
    "Direwing", "Gentle Gemdragon", "Sky Splitter", "Fae Dragon",
    "Concentrate", "Combat Experience", "Alpha Strike", "Master Yi, Unstoppable",
    "Voracious Gromp", "Herald of Spring", "Wuju Apprentice", "Gemhand Hunter",
    "Combat Experience", "Thrill of the Hunt", "Confront", "Here to Help",
    "Nidalee, Cat Form", "Against the Odds", "Factory Recall", "Thermo Beam",
    "Invert Timelines"
  ];

  console.log("\n=== Checking suspicious card names ===");
  for (const name of suspiciousNames) {
    const found = cardNames.has(name.toLowerCase()) || cleanNames.has(name.toLowerCase());
    if (!found) {
      // Try fuzzy match
      const fuzzy = allCards.find((c) =>
        c.name.toLowerCase().includes(name.toLowerCase().split(" ")[0]) ||
        name.toLowerCase().includes(c.name.toLowerCase().split(" ")[0])
      );
      console.log(`NOT FOUND: "${name}"${fuzzy ? ` — closest: "${fuzzy.name}"` : ""}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
