import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
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

  if (existing) {
    await prisma.communityDeckLike.delete({ where: { id: existing.id } });
    await prisma.communityDeck.update({
      where: { id: deck.id },
      data: { likes: { decrement: 1 } },
    });
    return NextResponse.json({ liked: false });
  }

  await prisma.communityDeckLike.create({
    data: { userId: user.id, communityDeckId: deck.id },
  });
  await prisma.communityDeck.update({
    where: { id: deck.id },
    data: { likes: { increment: 1 } },
  });

  return NextResponse.json({ liked: true });
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
