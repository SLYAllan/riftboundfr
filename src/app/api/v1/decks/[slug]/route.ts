import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: {
      cards: {
        include: { card: true },
        orderBy: [{ section: "asc" }, { card: { name: "asc" } }],
      },
    },
  });

  if (!deck || !deck.published) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    slug: deck.slug,
    title: deck.title,
    legendName: deck.legendName,
    legendId: deck.legendId,
    author: deck.authorName,
    tournament: deck.tournamentContext,
    format: deck.format,
    description: deck.description,
    createdAt: deck.createdAt,
    cards: deck.cards.map((dc) => ({
      id: dc.card.riftboundId,
      name: dc.card.name,
      type: dc.card.type,
      rarity: dc.card.rarity,
      energy: dc.card.energy,
      might: dc.card.might,
      domains: dc.card.domains,
      imageUrl: dc.card.imageUrl,
      quantity: dc.quantity,
      section: dc.section,
    })),
  });
}
