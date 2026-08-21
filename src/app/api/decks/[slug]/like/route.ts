import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { rateLimit, tooMany } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!rateLimit(req, { bucket: "deck-like", limit: 30 })) return tooMany();
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const { slug } = await params;
  const deck = await prisma.deck.findUnique({
    where: { slug },
    select: { id: true, likes: true },
  });
  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  // Enregistre le like par utilisateur (idempotent grâce à la contrainte unique).
  // On n'incrémente le compteur que si le like est nouveau, pour préserver les
  // compteurs existants (decks seedés). Le like et son compteur bougent ensemble :
  // une panne entre les deux laisserait un like sans son point.
  try {
    const updated = await prisma.$transaction(async (tx) => {
      const ajout = await tx.deckLike.createMany({
        data: [{ userId: user.id, deckId: deck.id }],
        skipDuplicates: true,
      });
      if (ajout.count === 0) {
        const courant = await tx.deck.findUnique({
          where: { id: deck.id },
          select: { likes: true },
        });
        return { likes: courant?.likes ?? deck.likes };
      }

      return tx.deck.update({
        where: { id: deck.id },
        data: { likes: { increment: 1 } },
        select: { likes: true },
      });
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Le like n'a pas pu être enregistré" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const { slug } = await params;
  const deck = await prisma.deck.findUnique({
    where: { slug },
    select: { id: true, likes: true },
  });
  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  // Ne décrémente que si l'utilisateur avait bien un like enregistré.
  const removed = await prisma.deckLike.deleteMany({
    where: { userId: user.id, deckId: deck.id },
  });
  if (removed.count === 0) {
    return NextResponse.json({ likes: deck.likes });
  }

  const updated = await prisma.deck.update({
    where: { id: deck.id },
    data: { likes: { decrement: deck.likes > 0 ? 1 : 0 } },
    select: { likes: true },
  });

  return NextResponse.json({ likes: updated.likes });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const deck = await prisma.deck.findUnique({
    where: { slug },
    select: { likes: true },
  });
  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  return NextResponse.json({ likes: deck.likes });
}
