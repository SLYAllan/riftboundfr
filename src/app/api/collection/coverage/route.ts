import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getOwnedByName } from "@/lib/collection-server";
import { computeDeckCoverage, type DeckCardLike } from "@/lib/collection";

interface InItem {
  cardId: string;
  quantity: number;
  section?: string;
  name?: string;
}

// Calcule, pour l'utilisateur connecté, combien de cartes il lui manque pour un
// deck donné (liste d'impressions). L'agrégation se fait par cleanName côté
// serveur → posséder une autre impression (alt-art) de la carte compte.
export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ loggedIn: false });

  const body = await req.json().catch(() => null);
  const items: InItem[] = Array.isArray(body?.items) ? body.items : [];
  const valid = items.filter(
    (i) => typeof i.cardId === "string" && Number.isInteger(i.quantity) && i.quantity > 0,
  );
  if (valid.length === 0) {
    return NextResponse.json({ loggedIn: true, coverage: { entries: [], totals: { required: 0, owned: 0, missing: 0, completionPct: 100 } } });
  }

  const cards = await prisma.card.findMany({
    where: { id: { in: valid.map((i) => i.cardId) } },
    select: { id: true, name: true, cleanName: true },
  });
  const byId = new Map(cards.map((c) => [c.id, c]));

  const deckCards: DeckCardLike[] = valid.map((i) => {
    const c = byId.get(i.cardId);
    return {
      cardId: i.cardId,
      name: c?.name ?? i.name ?? i.cardId,
      section: i.section ?? "main",
      cleanName: c?.cleanName ?? null,
      quantity: i.quantity,
    };
  });

  const owned = await getOwnedByName(user.id);
  const coverage = computeDeckCoverage(owned, deckCards);
  return NextResponse.json({ loggedIn: true, coverage });
}
