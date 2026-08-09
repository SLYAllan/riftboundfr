// 78 best-of sur 428 n'ont pas de ligne pour leur carte Légende, alors que les 22 083
// listes brutes l'ont toutes. Ces best-of ont été construits avec une autre convention :
// le champion en section `champion`, et pas de Légende du tout.
//
// Conséquences visibles : un deck annoncé à 63 cartes au lieu de 64, un prix calculé
// plus bas que la réalité, et une decklist qui n'affiche pas la Légende qu'elle décrit.
// Aucune carte n'est fausse pour autant : le deck principal, les runes, les champs de
// bataille et la réserve sont identiques à la liste brute du même joueur.
//
// Ce script ajoute la ligne manquante. Il n'invente rien : la Légende est retrouvée par
// son nom exact dans `legendName`, et si elle n'est pas en base le deck est laissé tel
// quel et signalé. Rejouable, il ne touche que les decks encore incomplets.
//
//   npx tsx --env-file=.env scripts/fix-bestof-missing-legend.mts --dry
//   npx tsx --env-file=.env scripts/fix-bestof-missing-legend.mts
import { prisma } from "../src/lib/prisma";

const DRY = process.argv.includes("--dry");

async function findLegendCard(legendName: string) {
  // Nom exact seulement. Un `startsWith` sur le prénom confondrait les deux Master Yi
  // (Wuju Bladesman et Wuju Master), qui sont deux Légendes différentes.
  const dashName = legendName.replace(", ", " - ");
  return prisma.card.findFirst({
    where: {
      type: "Legend",
      alternateArt: false,
      overnumbered: false,
      OR: [
        { name: { equals: legendName, mode: "insensitive" } },
        { name: { equals: dashName, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true },
  });
}

async function main() {
  const decks = await prisma.deck.findMany({
    where: { featured: true },
    select: { id: true, slug: true, legendName: true, cards: { select: { card: { select: { type: true } } } } },
  });
  const incomplets = decks.filter((d) => !d.cards.some((c) => c.card.type === "Legend"));
  console.log(`${incomplets.length} best-of sans carte Légende sur ${decks.length}${DRY ? "  (essai à blanc)" : ""}`);

  let ajoutes = 0;
  const introuvables: string[] = [];
  for (const d of incomplets) {
    const legend = await findLegendCard(d.legendName);
    if (!legend) {
      introuvables.push(`${d.slug}  (${d.legendName})`);
      continue;
    }
    if (!DRY) {
      await prisma.deckCard.upsert({
        where: { deckId_cardId_section: { deckId: d.id, cardId: legend.id, section: "legend" } },
        create: { deckId: d.id, cardId: legend.id, section: "legend", quantity: 1 },
        update: {},
      });
    }
    ajoutes++;
  }

  console.log(`${ajoutes} Légende(s) ${DRY ? "à ajouter" : "ajoutées"}`);
  if (introuvables.length) {
    console.log(`\n${introuvables.length} Légende(s) absentes de la base, decks laissés tels quels :`);
    for (const i of introuvables) console.log(`   ${i}`);
  }
}

main().finally(() => prisma.$disconnect());
