import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyserRecette } from "@/lib/bulking-recipes";
import type { BulkRecipeRequirement, BulkStockBalance } from "@/lib/bulking-types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const recipe = await prisma.bulkProductRecipe.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      lines: { select: { cardId: true, languageId: true, section: true, quantity: true } },
    },
  });
  if (!recipe) return NextResponse.json({ error: "Recette introuvable" }, { status: 404 });

  const exigences: BulkRecipeRequirement[] = recipe.lines.map((line) => ({
    cardId: line.cardId,
    languageId: line.languageId,
    section: line.section,
    quantity: line.quantity,
  }));

  const cardIds = [...new Set(exigences.map((exigence) => exigence.cardId))];
  const [inventory, cards] = await Promise.all([
    prisma.bulkInventory.findMany({ where: { cardId: { in: cardIds } } }),
    prisma.card.findMany({
      where: { id: { in: cardIds } },
      select: { id: true, riftboundId: true, name: true, imageUrl: true },
    }),
  ]);

  const stock: BulkStockBalance[] = inventory.map((item) => ({
    cardId: item.cardId,
    languageId: item.languageId,
    condition: item.condition,
    finish: item.finish,
    storageLocationId: item.storageLocationId,
    physicalQuantity: item.physicalQuantity,
    reservedQuantity: item.reservedQuantity,
    averageAcquisitionCost: item.averageAcquisitionCost.toString(),
  }));

  const analysis = analyserRecette(exigences, stock);

  return NextResponse.json({
    recipe: { id: recipe.id, name: recipe.name },
    analysis,
    cards: Object.fromEntries(cards.map((card) => [card.id, card])),
  });
}
