import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultBinder } from "@/lib/collection-server";
import { rateLimit, tooMany } from "@/lib/rate-limit";

interface BulkItem {
  cardId: string;
  quantity: number;
}

// POST /api/collection/bulk { binderId?, items: [{cardId, quantity}] }
export async function POST(req: Request) {
  if (!rateLimit(req, { bucket: "collection-bulk", limit: 10 })) return tooMany();
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const items: BulkItem[] = Array.isArray(body?.items) ? body.items : [];
  const valid = items.filter(
    (i) => typeof i.cardId === "string" && Number.isInteger(i.quantity) && i.quantity >= 0,
  );

  let binderId = typeof body?.binderId === "string" ? body.binderId : null;
  if (binderId) {
    const binder = await prisma.binder.findFirst({ where: { id: binderId, userId: user.id }, select: { id: true } });
    if (!binder) return NextResponse.json({ error: "binder_not_found" }, { status: 404 });
  } else {
    binderId = (await getOrCreateDefaultBinder(user.id)).id;
  }
  const bId = binderId;

  await prisma.$transaction(
    valid.map((i) =>
      i.quantity === 0
        ? prisma.collectionItem.deleteMany({ where: { binderId: bId, cardId: i.cardId } })
        : prisma.collectionItem.upsert({
            where: { binderId_cardId: { binderId: bId, cardId: i.cardId } },
            create: { userId: user.id, binderId: bId, cardId: i.cardId, quantity: i.quantity },
            update: { quantity: i.quantity },
          }),
    ),
  );
  return NextResponse.json({ ok: true, count: valid.length, binderId: bId });
}
