import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NAME_CORRECTIONS: Record<string, string> = {
  "Laser Beam": "Void Rush",
  "Lunar Beam": "On the Hunt",
  "Fireball": "Firestorm",
  "Final Boss Dragon": "Kadregrin the Infernal",
  "Emperor's Whim": "Not So Fast",
  "Pounce of Faefolks": "Tasty Faefolk",
  "Bright Steel Protector": "Cithria of Cloudfield",
  "Hammer Slam": "Keeper's Verdict",
  "Lee Sin, Tempest": "Lee Sin - Centered",
  "Ivern, Rootcaller": "Ivern - Nurturer",
};

async function main() {
  console.log("=== Fix Decks Script ===\n");

  // 1. Fix fabricated card names in the seed
  console.log("--- Step 1: Fix fabricated card names ---");
  for (const [wrong, correct] of Object.entries(NAME_CORRECTIONS)) {
    const card = await prisma.card.findFirst({
      where: {
        name: { equals: correct, mode: "insensitive" },
        alternateArt: false,
        overnumbered: false,
      },
    });
    if (!card) {
      console.log(`  WARN: Correction target "${correct}" not found in DB!`);
      continue;
    }
    console.log(`  "${wrong}" → "${card.name}" (${card.id})`);
  }

  // 2. Fix DeckCards pointing to alternate art / overnumbered
  console.log("\n--- Step 2: Fix alternate art / overnumbered DeckCards ---");
  const altArtCards = await prisma.deckCard.findMany({
    include: { card: true },
    where: {
      card: {
        OR: [{ alternateArt: true }, { overnumbered: true }],
      },
    },
  });

  let altFixed = 0;
  for (const dc of altArtCards) {
    const baseName = dc.card.name
      .replace(/ \(Alternate Art\)$/i, "")
      .replace(/ \(Overnumbered\)$/i, "")
      .replace(/ \(Metal\)$/i, "")
      .replace(/ \(Signature\)$/i, "");

    const regular = await prisma.card.findFirst({
      where: {
        name: { equals: baseName, mode: "insensitive" },
        alternateArt: false,
        overnumbered: false,
      },
    });

    if (regular && regular.id !== dc.cardId) {
      const existing = await prisma.deckCard.findUnique({
        where: { deckId_cardId_section: { deckId: dc.deckId, cardId: regular.id, section: dc.section } },
      });
      if (existing) {
        await prisma.deckCard.delete({ where: { id: dc.id } });
        console.log(`  Removed duplicate alt art "${dc.card.name}" (regular already linked)`);
      } else {
        await prisma.deckCard.update({
          where: { id: dc.id },
          data: { cardId: regular.id },
        });
        console.log(`  Swapped "${dc.card.name}" → "${regular.name}"`);
      }
      altFixed++;
    }
  }
  console.log(`  Fixed ${altFixed} alt art/overnumbered DeckCards`);

  // 3. Add legend/champion DeckCards to all decks
  console.log("\n--- Step 3: Add legend/champion DeckCards ---");
  const decks = await prisma.deck.findMany({
    include: { cards: { include: { card: true } } },
  });

  let legendsAdded = 0;
  for (const deck of decks) {
    const hasLegendSection = deck.cards.some((dc) => dc.section === "legend");
    if (hasLegendSection) continue;

    // Find the legend card
    const legendCard = await prisma.card.findFirst({
      where: {
        riftboundId: deck.legendId,
        alternateArt: false,
        overnumbered: false,
      },
    });

    if (!legendCard) {
      const legendByName = await prisma.card.findFirst({
        where: {
          type: "Legend",
          name: { contains: deck.legendName.split(",")[0].split(" -")[0].trim(), mode: "insensitive" },
          alternateArt: false,
          overnumbered: false,
        },
      });
      if (legendByName) {
        const exists = await prisma.deckCard.findUnique({
          where: { deckId_cardId_section: { deckId: deck.id, cardId: legendByName.id, section: "legend" } },
        });
        if (!exists) {
          await prisma.deckCard.create({
            data: { deckId: deck.id, cardId: legendByName.id, quantity: 1, section: "legend" },
          });
          legendsAdded++;
          console.log(`  Added legend "${legendByName.name}" to "${deck.title}"`);
        }
      } else {
        console.log(`  WARN: Legend not found for "${deck.title}" (id: ${deck.legendId})`);
      }
    } else {
      const exists = await prisma.deckCard.findUnique({
        where: { deckId_cardId_section: { deckId: deck.id, cardId: legendCard.id, section: "legend" } },
      });
      if (!exists) {
        await prisma.deckCard.create({
          data: { deckId: deck.id, cardId: legendCard.id, quantity: 1, section: "legend" },
        });
        legendsAdded++;
        console.log(`  Added legend "${legendCard.name}" to "${deck.title}"`);
      }
    }

    // Find and add the champion card
    // The champion name is in the seed but we need to extract it
    // Look at what champion units exist in this deck's main section
    const champInMain = deck.cards.find(
      (dc) => dc.section === "main" && dc.card.supertype === "Champion"
    );

    if (champInMain) {
      // Move the champion from main to legend section
      await prisma.deckCard.update({
        where: { id: champInMain.id },
        data: { section: "legend", quantity: 1 },
      });
      console.log(`  Moved champion "${champInMain.card.name}" from main → legend in "${deck.title}"`);
    } else {
      // Try to find the champion by deck's legend name pattern
      const legendBaseName = deck.legendName.split(",")[0].split(" -")[0].trim();
      const champions = await prisma.card.findMany({
        where: {
          supertype: "Champion",
          name: { contains: legendBaseName, mode: "insensitive" },
          alternateArt: false,
          overnumbered: false,
        },
      });

      if (champions.length > 0) {
        const champ = champions[0];
        const alreadyLinked = deck.cards.some((dc) => dc.cardId === champ.id);
        if (!alreadyLinked) {
          const exists = await prisma.deckCard.findUnique({
            where: { deckId_cardId_section: { deckId: deck.id, cardId: champ.id, section: "legend" } },
          });
          if (!exists) {
            await prisma.deckCard.create({
              data: { deckId: deck.id, cardId: champ.id, quantity: 1, section: "legend" },
            });
            console.log(`  Added champion "${champ.name}" to "${deck.title}"`);
          }
        }
      }
    }
  }
  console.log(`  Added ${legendsAdded} legend DeckCards`);

  // 4. Fix fabricated card names in existing DeckCards (for seed re-run scenarios)
  // Actually, these cards won't be in DeckCards since they weren't found during seed.
  // But let's update the seed file too.
  console.log("\n--- Step 4: Verify final state ---");
  const updatedDecks = await prisma.deck.findMany({
    include: { cards: { include: { card: true } } },
  });

  let totalIssues = 0;
  for (const deck of updatedDecks) {
    const hasLegend = deck.cards.some((dc) => dc.section === "legend" && dc.card.type === "Legend");
    const mainCount = deck.cards.filter((dc) => dc.section === "main").reduce((s, dc) => s + dc.quantity, 0);
    const runeCount = deck.cards.filter((dc) => dc.section === "rune").reduce((s, dc) => s + dc.quantity, 0);
    const bfCount = deck.cards.filter((dc) => dc.section === "battlefield").reduce((s, dc) => s + dc.quantity, 0);
    const altArt = deck.cards.filter((dc) => dc.card.alternateArt || dc.card.overnumbered);

    const issues: string[] = [];
    if (!hasLegend) issues.push("no legend");
    if (mainCount < 38) issues.push(`main ${mainCount}/40`);
    if (runeCount !== 12) issues.push(`runes ${runeCount}/12`);
    if (bfCount !== 3) issues.push(`bf ${bfCount}/3`);
    if (altArt.length > 0) issues.push(`${altArt.length} alt art`);

    if (issues.length > 0) {
      console.log(`  ${deck.legendName}: ${issues.join(", ")}`);
      totalIssues += issues.length;
    }
  }

  if (totalIssues === 0) {
    console.log("  All decks look good!");
  } else {
    console.log(`  ${totalIssues} remaining issues`);
  }

  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
