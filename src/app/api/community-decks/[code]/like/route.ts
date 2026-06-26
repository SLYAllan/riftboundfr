import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { rateLimit, tooMany } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!rateLimit(req, { bucket: "cd-like", limit: 30 })) return tooMany();
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { code } = await params;
  const deck = await prisma.communityDeck.findUnique({
    where: { shareCode: code },
    select: { id: true },
  });
  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  const existing = await prisma.communityDeckLike.findUnique({
    where: { userId_communityDeckId: { userId: user.id, communityDeckId: deck.id } },
  });

  // Transaction + recompte du compteur depuis le count réel : jamais de drift ni de
  // valeur négative (les decks communautaires n'ont pas de baseline seedée).
  const liked = !existing;
  const likes = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.communityDeckLike.delete({ where: { id: existing.id } });
    } else {
      await tx.communityDeckLike.create({ data: { userId: user.id, communityDeckId: deck.id } });
    }
    const count = await tx.communityDeckLike.count({ where: { communityDeckId: deck.id } });
    await tx.communityDeck.update({ where: { id: deck.id }, data: { likes: count } });
    return count;
  });

  return NextResponse.json({ liked, likes });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const user = await getUserFromSession();
  const { code } = await params;

  const deck = await prisma.communityDeck.findUnique({
    where: { shareCode: code },
    select: { id: true, likes: true },
  });
  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  let liked = false;
  if (user) {
    const existing = await prisma.communityDeckLike.findUnique({
      where: { userId_communityDeckId: { userId: user.id, communityDeckId: deck.id } },
    });
    liked = !!existing;
  }

  return NextResponse.json({ likes: deck.likes, liked });
}
