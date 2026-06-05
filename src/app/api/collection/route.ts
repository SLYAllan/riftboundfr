import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getCollectionMap } from "@/lib/collection-server";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await getCollectionMap(user.id));
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const cardId = typeof body?.cardId === "string" ? body.cardId : null;
  const quantity = Number(body?.quantity);
  if (!cardId || !Number.isInteger(quantity) || quantity < 0) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const card = await prisma.card.findUnique({ where: { id: cardId }, select: { id: true } });
  if (!card) return NextResponse.json({ error: "card_not_found" }, { status: 404 });

  if (quantity === 0) {
    await prisma.collectionItem.deleteMany({ where: { userId: user.id, cardId } });
  } else {
    await prisma.collectionItem.upsert({
      where: { userId_cardId: { userId: user.id, cardId } },
      create: { userId: user.id, cardId, quantity },
      update: { quantity },
    });
  }
  return NextResponse.json({ ok: true, cardId, quantity });
}
