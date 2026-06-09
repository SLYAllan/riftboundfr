import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Corrige la mauvaise classification "Master Yi, Wuju Master".
// Preuve par image (672/675 decks) : les champions Master Yi (Honed/Tempered/
// Meditative/Unstoppable) appartiennent à Wuju Bladesman. Wuju Master joué ≈ 0.
// L'ancien fallback set==Unleashed -> Wuju Master a généré ~395 faux Wuju Master.

const WM_LEGEND_CARD_IDS = [
  "69bc5beed308c64675ca89b3", // UNL-191 Wuju Master
  "69c4407e9288b1e85d94dea2", // UNL-231 Signature
  "69c43cd3c2f7428c5d24b4e8", // UNL-231 Overnumbered
];
const BLADESMAN_CARD_ID = "69bc5bd9d308c64675ca8828"; // OGS-19 Wuju Bladesman
const BLADESMAN_LEGENDID = "69bc5beed308c64675ca89b3"; // champ Deck.legendId (uniforme avec les Bladesman existants)

async function main() {
  const before = await prisma.deck.count({ where: { legendName: "Master Yi, Wuju Master" } });
  console.log(`Decks 'Master Yi, Wuju Master' avant : ${before}`);

  // 1) legendName + legendId
  const r1 = await prisma.deck.updateMany({
    where: { legendName: "Master Yi, Wuju Master" },
    data: { legendName: "Master Yi, Wuju Bladesman", legendId: BLADESMAN_LEGENDID },
  });
  console.log(`  legendName/legendId mis à jour : ${r1.count}`);

  // 2) swap la carte Légende (section 'legend', type Legend) WM -> Bladesman.
  // Aucun deck ne possède déjà la carte Bladesman en section legend (c'étaient des WM),
  // donc pas de conflit sur l'unique [deckId, cardId, section].
  const r2 = await prisma.deckCard.updateMany({
    where: { section: "legend", cardId: { in: WM_LEGEND_CARD_IDS } },
    data: { cardId: BLADESMAN_CARD_ID },
  });
  console.log(`  cartes Légende W->Bladesman échangées : ${r2.count}`);

  const after = await prisma.deck.count({ where: { legendName: "Master Yi, Wuju Master" } });
  const blades = await prisma.deck.count({ where: { legendName: "Master Yi, Wuju Bladesman" } });
  console.log(`Restant Wuju Master : ${after} | total Wuju Bladesman : ${blades}`);
}
main().catch((e) => { console.error("ERR", e.message); process.exit(1); }).finally(() => prisma.$disconnect());
