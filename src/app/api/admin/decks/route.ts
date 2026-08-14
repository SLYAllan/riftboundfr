import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const decks = await prisma.deck.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(decks);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const data = await req.json();
  const deck = await prisma.deck.create({
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

  if (data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
    await prisma.deckCard.createMany({
      data: data.cards.map((c: { cardId: string; quantity?: number; section?: string }) => ({
        deckId: deck.id,
        cardId: c.cardId,
        quantity: c.quantity ?? 1,
        section: c.section ?? "main",
      })),
    });
  }

  return NextResponse.json(deck, { status: 201 });
}
