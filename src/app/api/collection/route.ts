import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getCollectionMap, getBinderQuantities, getOrCreateDefaultBinder } from "@/lib/collection-server";

// GET /api/collection            → quantités totales (somme tous classeurs) cardId->qty
// GET /api/collection?binderId=x → quantités du classeur x
export async function GET(req: Request) {
  const user = await getUserFromSession();
  const binderId = new URL(req.url).searchParams.get("binderId");

  // Visiteur non connecté : il ne possède simplement rien. On répond 200 avec un
  // marqueur au lieu d'un 401, que le navigateur journalisait en erreur sur CHAQUE
  // page (le provider interroge cette route partout). Un 401 reste la bonne réponse
  // pour l'accès à un classeur précis et pour toute écriture.
  if (!user) {
    if (binderId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return NextResponse.json({ anonymous: true });
  }

  if (binderId) {
    const binder = await prisma.binder.findFirst({ where: { id: binderId, userId: user.id }, select: { id: true } });
    if (!binder) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(await getBinderQuantities(binderId));
  }
  return NextResponse.json(await getCollectionMap(user.id));
}

// POST /api/collection { binderId?, cardId, quantity } → upsert dans un classeur
export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const cardId = typeof body?.cardId === "string" ? body.cardId : null;
  const quantity = Number(body?.quantity);
  if (!cardId || !Number.isInteger(quantity) || quantity < 0) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // classeur cible : celui fourni (vérifié) ou le classeur par défaut
  let binderId = typeof body?.binderId === "string" ? body.binderId : null;
  if (binderId) {
    const binder = await prisma.binder.findFirst({ where: { id: binderId, userId: user.id }, select: { id: true } });
    if (!binder) return NextResponse.json({ error: "binder_not_found" }, { status: 404 });
  } else {
    binderId = (await getOrCreateDefaultBinder(user.id)).id;
  }

  const card = await prisma.card.findUnique({ where: { id: cardId }, select: { id: true } });
  if (!card) return NextResponse.json({ error: "card_not_found" }, { status: 404 });

  if (quantity === 0) {
    await prisma.collectionItem.deleteMany({ where: { binderId, cardId } });
  } else {
    await prisma.collectionItem.upsert({
      where: { binderId_cardId: { binderId, cardId } },
      create: { userId: user.id, binderId, cardId, quantity },
      update: { quantity },
    });
  }
  return NextResponse.json({ ok: true, binderId, cardId, quantity });
}
