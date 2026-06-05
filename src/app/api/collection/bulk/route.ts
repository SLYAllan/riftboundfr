import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

interface BulkItem {
  cardId: string;
  quantity: number;
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const items: BulkItem[] = Array.isArray(body?.items) ? body.items : [];
  const valid = items.filter(
    (i) => typeof i.cardId === "string" && Number.isInteger(i.quantity) && i.quantity >= 0,
  );

  await prisma.$transaction(
    valid.map((i) =>
      i.quantity === 0
        ? prisma.collectionItem.deleteMany({ where: { userId: user.id, cardId: i.cardId } })
        : prisma.collectionItem.upsert({
            where: { userId_cardId: { userId: user.id, cardId: i.cardId } },
            create: { userId: user.id, cardId: i.cardId, quantity: i.quantity },
            update: { quantity: i.quantity },
          }),
    ),
  );
  return NextResponse.json({ ok: true, count: valid.length });
}
