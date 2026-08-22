import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultBinder } from "@/lib/collection-server";
import { rateLimit, tooMany } from "@/lib/rate-limit";
import { validerLotCollection } from "@/lib/piltover-import";

// POST /api/collection/bulk { binderId?, items: [{cardId, quantity}] }
export async function POST(req: Request) {
  if (!rateLimit(req, { bucket: "collection-bulk", limit: 10 })) return tooMany();
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const itemsBruts = body?.items;
  // Borne anti-DoS : bien au-dessus de la taille du catalogue (~1048 cartes).
  if (Array.isArray(itemsBruts) && itemsBruts.length > 5000) {
    return NextResponse.json({ error: "too_many_items" }, { status: 413 });
  }
  const items = validerLotCollection(itemsBruts);
  if (!items) return NextResponse.json({ error: "invalid" }, { status: 400 });
  // Valide l'existence des cartes (évite les FK orphelines / 500).
  const ids = items.map((i) => i.cardId);
  const existingIds = new Set(
    (await prisma.card.findMany({ where: { id: { in: ids } }, select: { id: true } })).map((c) => c.id),
  );
  if (existingIds.size !== ids.length) {
    return NextResponse.json({ error: "card_not_found" }, { status: 404 });
  }

  let binderId = typeof body?.binderId === "string" ? body.binderId : null;
  if (binderId) {
    const binder = await prisma.binder.findFirst({ where: { id: binderId, userId: user.id }, select: { id: true } });
    if (!binder) return NextResponse.json({ error: "binder_not_found" }, { status: 404 });
  } else {
    binderId = (await getOrCreateDefaultBinder(user.id)).id;
  }
  const bId = binderId;

  await prisma.$transaction(
    items.map((i) =>
      i.quantity === 0
        ? prisma.collectionItem.deleteMany({ where: { binderId: bId, cardId: i.cardId } })
        : prisma.collectionItem.upsert({
            where: { binderId_cardId: { binderId: bId, cardId: i.cardId } },
            create: { userId: user.id, binderId: bId, cardId: i.cardId, quantity: i.quantity },
            update: { quantity: i.quantity },
          }),
    ),
  );
  return NextResponse.json({ ok: true, count: items.length, binderId: bId });
}
