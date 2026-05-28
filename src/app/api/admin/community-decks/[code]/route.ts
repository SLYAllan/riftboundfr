import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { code } = await params;
  const deck = await prisma.communityDeck.findUnique({
    where: { shareCode: code },
    select: { id: true },
  });
  if (!deck)
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.slice(0, 200);
  if (typeof body.description === "string")
    data.description = body.description.slice(0, 500) || null;
  if (typeof body.isPublic === "boolean") data.isPublic = body.isPublic;

  if (Object.keys(data).length === 0)
    return NextResponse.json(
      { error: "Rien à mettre à jour" },
      { status: 400 },
    );

  const updated = await prisma.communityDeck.update({
    where: { id: deck.id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { code } = await params;
  const deck = await prisma.communityDeck.findUnique({
    where: { shareCode: code },
    select: { id: true },
  });
  if (!deck)
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });

  await prisma.communityDeck.delete({ where: { id: deck.id } });
  return NextResponse.json({ ok: true });
}
