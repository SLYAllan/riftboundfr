import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { validerDeck } from "@/lib/admin-validation";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  const deck = await prisma.deck.findUnique({ where: { id }, include: { cards: { include: { card: true } } } });
  if (!deck) return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  return NextResponse.json(deck);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerDeck(data, "mise à jour");
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

  const cartes = Array.isArray(data.cards) ? data.cards as Array<{ cardId: string; quantity?: number; section?: string }> : undefined;
  if (cartes) {
    const cardIds: string[] = [...new Set(cartes.map((c) => c.cardId))];
    const cartesExistantes = await prisma.card.findMany({ where: { id: { in: cardIds } }, select: { id: true } });
    const idsExistants = new Set(cartesExistantes.map((c) => c.id));
    const manquantes = cardIds.filter((cardId) => !idsExistants.has(cardId));
    if (manquantes.length > 0) return NextResponse.json({ error: "Cartes introuvables", cardIds: manquantes }, { status: 400 });
  }

  const deck = await prisma.$transaction(async (tx) => {
    const resultat = await tx.deck.update({
      where: { id },
      data: {
        title: data.title,
        legendId: data.legendId,
        legendName: data.legendName,
        description: data.description,
        guide: data.guide,
        format: data.format,
        tags: data.tags,
        authorName: data.authorName,
        sourceUrl: data.sourceUrl,
        featured: data.featured,
        published: data.published,
        sourceArticleId: data.sourceArticleId,
        tournamentContext: data.tournamentContext,
        playerName: data.playerName,
      },
    });
    if (cartes) {
      await tx.deckCard.deleteMany({ where: { deckId: id } });
      await tx.deckCard.createMany({
        data: cartes.map((c) => ({
          deckId: id, cardId: c.cardId, quantity: c.quantity ?? 1, section: c.section ?? "main",
        })),
      });
    }
    return resultat;
  });
  return NextResponse.json(deck);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  await prisma.deckCard.deleteMany({ where: { deckId: id } });
  await prisma.deck.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
