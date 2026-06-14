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

  // Les items peuvent référencer une carte par sa clé primaire (`id`, envoyée par
  // les pages decks) ou par son `riftboundId` (le deckbuilder utilise riftboundId
  // comme identifiant de carte). On résout les deux pour ne pas retomber sur le
  // fallback (nom = id brut, pas d'image, 0 possédée).
  const ids = valid.map((i) => i.cardId);
  const cards = await prisma.card.findMany({
    where: { OR: [{ id: { in: ids } }, { riftboundId: { in: ids } }] },
    select: { id: true, riftboundId: true, name: true, cleanName: true, imageUrl: true, rarity: true, type: true, energy: true, might: true, domains: true },
  });
  const byId = new Map<string, (typeof cards)[number]>();
  for (const c of cards) {
    byId.set(c.id, c);
    byId.set(c.riftboundId, c);
  }

  const deckCards: DeckCardLike[] = valid.map((i) => {
    const c = byId.get(i.cardId);
    return {
      cardId: i.cardId,
      name: c?.name ?? i.name ?? i.cardId,
      section: i.section ?? "main",
      cleanName: c?.cleanName ?? null,
      quantity: i.quantity,
      imageUrl: c?.imageUrl ?? null,
      rarity: c?.rarity ?? null,
      type: c?.type ?? null,
      energy: c?.energy ?? null,
      might: c?.might ?? null,
      domains: c?.domains ?? [],
    };
  });

  const owned = await getOwnedByName(user.id);
  const coverage = computeDeckCoverage(owned, deckCards);
  return NextResponse.json({ loggedIn: true, coverage });
}
