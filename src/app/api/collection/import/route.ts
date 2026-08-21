import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultBinder } from "@/lib/collection-server";
import { parsePiltoverCsv, aggregateByCard, type PiltoverRow } from "@/lib/piltover-import";
import { rateLimit, tooMany } from "@/lib/rate-limit";

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

// Borne d'import : 2 Mio, largement au-dessus d'un export Piltover complet.
const LIMITE_IMPORT_OCTETS = 2 * 1024 * 1024;
// Borne anti-DoS : bien au-dessus de la taille du catalogue (~1048 cartes).
const LIMITE_IMPORT_LIGNES = 5000;

export async function POST(req: Request) {
  if (!rateLimit(req, { bucket: "collection-import", limit: 5 })) return tooMany();

  // Taille bornée AVANT toute lecture : l'en-tête Content-Length, quand le
  // navigateur le pose, évite de lire un corps de plusieurs méga-octets.
  const longueur = Number(req.headers.get("content-length"));
  if (Number.isFinite(longueur) && longueur > LIMITE_IMPORT_OCTETS) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }

  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const text = await req.text();
  if (Buffer.byteLength(text, "utf8") > LIMITE_IMPORT_OCTETS) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }
  // Borné AVANT toute requête en base : compter les lignes ne coûte rien à côté
  // d'une requête par ligne de carte.
  const lignes = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lignes.length > LIMITE_IMPORT_LIGNES) {
    return NextResponse.json({ error: "too_many_lines" }, { status: 413 });
  }
  const rows = parsePiltoverCsv(text);

  // classeur cible via ?binderId= (sinon classeur par défaut)
  let binderId = new URL(req.url).searchParams.get("binderId");
  if (binderId) {
    const binder = await prisma.binder.findFirst({ where: { id: binderId, userId: user.id }, select: { id: true } });
    if (!binder) return NextResponse.json({ error: "binder_not_found" }, { status: 404 });
  } else {
    binderId = (await getOrCreateDefaultBinder(user.id)).id;
  }
  const bId = binderId;
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
