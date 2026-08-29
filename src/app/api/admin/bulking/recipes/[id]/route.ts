import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getBulkAdminActor, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validerRecette, type RecetteBulk } from "@/lib/bulking-validation";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const recipe = await prisma.bulkProductRecipe.findUnique({
    where: { id },
    include: {
      lines: {
        include: { card: { select: { id: true, riftboundId: true, name: true, imageUrl: true } } },
        orderBy: { section: "asc" },
      },
    },
  });
  if (!recipe) return NextResponse.json({ error: "Recette introuvable" }, { status: 404 });
  return NextResponse.json({
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    sourceDeckId: recipe.sourceDeckId,
    createdByLabel: recipe.createdByLabel,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    lines: recipe.lines.map((line) => ({
      id: line.id,
      cardId: line.cardId,
      languageId: line.languageId,
      section: line.section,
      quantity: line.quantity,
      card: line.card,
    })),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getBulkAdminActor();
  if (!actor) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  const validation = validerRecette(raw);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const data = raw as RecetteBulk;
  try {
    const { id } = await params;
    const cardIds = [...new Set(data.lines.map((line) => line.cardId))];
    const languageIds = [...new Set(data.lines.map((line) => line.languageId))];
    const [cards, languages] = await Promise.all([
      prisma.card.findMany({ where: { id: { in: cardIds } }, select: { id: true } }),
      prisma.bulkLanguage.findMany({ where: { id: { in: languageIds } }, select: { id: true } }),
    ]);
    if (cards.length !== cardIds.length) return NextResponse.json({ error: "Une carte est introuvable" }, { status: 404 });
    if (languages.length !== languageIds.length) return NextResponse.json({ error: "Une langue est introuvable" }, { status: 404 });
    const recipe = await prisma.$transaction(async (tx) => {
      const current = await tx.bulkProductRecipe.findUnique({ where: { id }, select: { id: true } });
      if (!current) throw new Error("Recette introuvable");
      const updated = await tx.bulkProductRecipe.update({
        where: { id },
        data: {
          name: data.name.trim(),
          description: data.description?.trim() || null,
          sourceDeckId: data.sourceDeckId || null,
        },
      });
      await tx.bulkProductRecipeLine.deleteMany({ where: { recipeId: id } });
      await tx.bulkProductRecipeLine.createMany({
        data: data.lines.map((line) => ({
          recipeId: id,
          cardId: line.cardId,
          languageId: line.languageId,
          section: line.section ?? "GENERIC",
          quantity: line.quantity,
        })),
      });
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ id, recipe: { id: recipe.id, name: recipe.name, description: recipe.description, sourceDeckId: recipe.sourceDeckId } });
  } catch (error) {
    if (error instanceof Error && error.message === "Recette introuvable") return NextResponse.json({ error: "Recette introuvable" }, { status: 404 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Ce nom est déjà pris" }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return NextResponse.json({ error: "Écriture concurrente, réessayez" }, { status: 409 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Modification impossible" }, { status: 400 });
  }
}
