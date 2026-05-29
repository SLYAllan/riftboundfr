import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";

export async function POST(
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

  // Enregistre le like par utilisateur (idempotent grâce à la contrainte unique).
  // On n'incrémente le compteur que si le like est nouveau, pour préserver les
  // compteurs existants (decks seedés).
  try {
    await prisma.deckLike.create({ data: { userId: user.id, deckId: deck.id } });
  } catch {
    return NextResponse.json({ likes: deck.likes });
  }

  const updated = await prisma.deck.update({
    where: { id: deck.id },
    data: { likes: { increment: 1 } },
    select: { likes: true },
  });

  return NextResponse.json({ likes: updated.likes });
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
