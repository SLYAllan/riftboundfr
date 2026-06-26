import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWishlistIds } from "@/lib/collection-server";
import { rateLimit, tooMany } from "@/lib/rate-limit";

// GET /api/wishlist → { ids: [cardId] }
export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ ids: await getWishlistIds(user.id) });
}

// POST /api/wishlist { cardId, wanted } → ajoute/retire de la wishlist
export async function POST(req: Request) {
  if (!rateLimit(req, { bucket: "wishlist-post", limit: 30 })) return tooMany();
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const cardId = typeof body?.cardId === "string" ? body.cardId : null;
  const wanted = body?.wanted !== false; // défaut = ajouter
  if (!cardId) return NextResponse.json({ error: "invalid" }, { status: 400 });

  if (wanted) {
    const card = await prisma.card.findUnique({ where: { id: cardId }, select: { id: true } });
    if (!card) return NextResponse.json({ error: "card_not_found" }, { status: 404 });
    await prisma.wishlistItem.upsert({
      where: { userId_cardId: { userId: user.id, cardId } },
      create: { userId: user.id, cardId },
      update: {},
    });
  } else {
    await prisma.wishlistItem.deleteMany({ where: { userId: user.id, cardId } });
  }
  return NextResponse.json({ ok: true, cardId, wanted });
}
