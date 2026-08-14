import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

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
  const data = await req.json();

  const deck = await prisma.deck.update({
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

  if (data.cards && Array.isArray(data.cards)) {
    await prisma.deckCard.deleteMany({ where: { deckId: id } });
    for (const c of data.cards) {
      await prisma.deckCard.create({
        data: { deckId: id, cardId: c.cardId, quantity: c.quantity ?? 1, section: c.section ?? "main" },
      });
    }
  }

  return NextResponse.json(deck);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  await prisma.deckCard.deleteMany({ where: { deckId: id } });
  await prisma.deck.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
