import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exigencesDepuisDeck } from "@/lib/bulking-decks";
import { analyserRecette } from "@/lib/bulking-recipes";
import type { BulkStockBalance } from "@/lib/bulking-types";

/**
 * Analyse la constructibilité d'un deck officiel depuis le stock Bulking.
 *
 * La route lit le Deck et ses DeckCard, convertit les lignes en exigences de
 * recette, charge TOUT le stock (tous emplacements, conditions et finitions)
 * des cartes concernées, puis laisse analyserRecette agréger par carte et langue.
 * La réponse ne contient aucun objet Prisma brut : les coûts sont des chaînes.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const languageId = req.nextUrl.searchParams.get("languageId")?.trim() ?? "";
  const includeSideboard = req.nextUrl.searchParams.get("includeSideboard") === "true";

  if (!languageId) return NextResponse.json({ error: "Langue manquante" }, { status: 400 });

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      cards: {
        include: {
          card: { select: { id: true, name: true, riftboundId: true, imageUrl: true, rarity: true } },
        },
      },
    },
  });
  if (!deck) return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });

  const exigences = exigencesDepuisDeck(
    deck.cards.map((c) => ({ cardId: c.cardId, quantity: c.quantity, section: c.section })),
    languageId,
    includeSideboard,
  );
  if (exigences.length === 0) return NextResponse.json({ error: "Ce deck ne contient aucune carte" }, { status: 400 });

  const cartesId = [...new Set(exigences.map((e) => e.cardId))];
  const inventaire = await prisma.bulkInventory.findMany({
    where: { cardId: { in: cartesId } },
    select: {
      cardId: true,
      languageId: true,
      condition: true,
      finish: true,
      storageLocationId: true,
      physicalQuantity: true,
      reservedQuantity: true,
      averageAcquisitionCost: true,
    },
  });

  const stock: BulkStockBalance[] = inventaire.map((ligne) => ({
    cardId: ligne.cardId,
    languageId: ligne.languageId,
    condition: ligne.condition,
    finish: ligne.finish,
    storageLocationId: ligne.storageLocationId,
    physicalQuantity: ligne.physicalQuantity,
    reservedQuantity: ligne.reservedQuantity,
    averageAcquisitionCost: ligne.averageAcquisitionCost.toString(),
  }));

  const analysis = analyserRecette(exigences, stock);

  const details: Record<string, { name: string; riftboundId: string; imageUrl: string | null; rarity: string }> = {};
  for (const ligne of deck.cards) {
    if (!details[ligne.card.id]) {
      details[ligne.card.id] = {
        name: ligne.card.name,
        riftboundId: ligne.card.riftboundId,
        imageUrl: ligne.card.imageUrl,
        rarity: ligne.card.rarity,
      };
    }
  }

  return NextResponse.json({
    deck: { id: deck.id, name: deck.title, slug: deck.slug },
    analysis,
    cards: details,
  });
}
