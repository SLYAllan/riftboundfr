import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { validerDeck } from "@/lib/admin-validation";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const decks = await prisma.deck.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(decks);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerDeck(data);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const cartes = Array.isArray(data.cards) ? data.cards as Array<{ cardId: string; quantity?: number; section?: string }> : [];
  if (cartes.length > 0) {
    const cardIds: string[] = [...new Set(cartes.map((carte) => carte.cardId))];
    const cartesExistantes = await prisma.card.findMany({ where: { id: { in: cardIds } }, select: { id: true } });
    const idsExistants = new Set(cartesExistantes.map((carte) => carte.id));
    const manquantes = cardIds.filter((cardId) => !idsExistants.has(cardId));
    if (manquantes.length > 0) return NextResponse.json({ error: "Cartes introuvables", cardIds: manquantes }, { status: 400 });
  }

  const deck = await prisma.$transaction(async (tx) => {
    const resultat = await tx.deck.create({
      data: {
        title: data.title,
        slug: slugify(data.title),
        legendId: data.legendId,
        legendName: data.legendName,
        description: data.description ?? null,
        guide: data.guide ?? null,
        format: data.format ?? "constructed",
        tags: data.tags ?? [],
        authorName: data.authorName ?? null,
        sourceUrl: data.sourceUrl ?? null,
        featured: data.featured ?? false,
        published: data.published ?? false,
        sourceArticleId: data.sourceArticleId ?? null,
        tournamentContext: data.tournamentContext ?? null,
        playerName: data.playerName ?? null,
      },
    });
    if (cartes.length > 0) await tx.deckCard.createMany({ data: cartes.map((carte) => ({ deckId: resultat.id, cardId: carte.cardId, quantity: carte.quantity ?? 1, section: carte.section ?? "main" })) });
    return resultat;
  });
  return NextResponse.json(deck, { status: 201 });
}
