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
    select: { id: true },
  });
  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
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
