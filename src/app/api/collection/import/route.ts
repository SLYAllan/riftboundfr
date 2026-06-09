import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultBinder } from "@/lib/collection-server";
import { parsePiltoverCsv, aggregateByCard, type PiltoverRow } from "@/lib/piltover-import";

type CardVariant = {
  id: string;
  alternateArt: boolean;
  overnumbered: boolean;
  signature: boolean;
};

// Choisit l'impression Card correspondant à la variante Piltover, via les
// libellés (Variant Type + Variant Label) confrontés aux flags de la carte.
function pickVariant(cards: CardVariant[], row: PiltoverRow): string {
  if (cards.length === 1) return cards[0].id;
  const label = `${row.variantType} ${row.variantLabel}`.toLowerCase();
  const wantAlt = label.includes("alt");
  const wantOver = label.includes("overnumbered");
  const wantSig =
    label.includes("showcase") ||
    label.includes("signature") ||
    label.includes("pre-rift") ||
    label.includes("promo");
  const match = cards.find(
    (c) => c.alternateArt === wantAlt && c.overnumbered === wantOver && c.signature === wantSig,
  );
  const fallback = cards.find((c) => !c.alternateArt && !c.overnumbered && !c.signature);
  return (match ?? fallback ?? cards[0]).id;
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // classeur cible via ?binderId= (sinon classeur par défaut)
  let binderId = new URL(req.url).searchParams.get("binderId");
  if (binderId) {
    const binder = await prisma.binder.findFirst({ where: { id: binderId, userId: user.id }, select: { id: true } });
    if (!binder) return NextResponse.json({ error: "binder_not_found" }, { status: 404 });
  } else {
    binderId = (await getOrCreateDefaultBinder(user.id)).id;
  }
  const bId = binderId;

  const text = await req.text();
  const rows = parsePiltoverCsv(text);
  const unmatched: { variantNumber: string; name: string; raison: string }[] = [];
  const resolved: { cardId: string; quantity: number }[] = [];

  for (const row of rows) {
    if (row.collectorNumber == null) {
      unmatched.push({ variantNumber: row.variantNumber, name: row.cardName, raison: "numero illisible" });
      continue;
    }
    const cards = await prisma.card.findMany({
      where: { set: row.setPrefix, collectorNumber: row.collectorNumber },
      select: { id: true, alternateArt: true, overnumbered: true, signature: true },
    });
    if (cards.length === 0) {
      unmatched.push({ variantNumber: row.variantNumber, name: row.cardName, raison: "carte introuvable" });
      continue;
    }
    resolved.push({ cardId: pickVariant(cards, row), quantity: row.quantity });
  }

  // Somme les lignes multiples pointant vers la même impression (binders).
  const aggregated = aggregateByCard(resolved);

  await prisma.$transaction(
    aggregated.map((i) =>
      prisma.collectionItem.upsert({
        where: { binderId_cardId: { binderId: bId, cardId: i.cardId } },
        create: { userId: user.id, binderId: bId, cardId: i.cardId, quantity: i.quantity },
        update: { quantity: i.quantity },
      }),
    ),
  );

  return NextResponse.json({ imported: aggregated.length, rows: rows.length, unmatched, binderId: bId });
}
