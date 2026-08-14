import type { Prisma } from "@prisma/client";
import { computeDeckCoverage, type DeckCardLike } from "./collection";
import { getOwnedByName } from "./collection-server";
import { prisma } from "./prisma";
import { getUserFromSession } from "./session";
import type { DeckListe, FiltresDecks, LotDecks } from "./deck-listing-params";

export { lireFiltresDecks, parametresDecks } from "./deck-listing-params";

// 51 decks remplit exactement 17 rangées sur la grille desktop à trois colonnes.
export const TAILLE_LOT_DECKS = 51;

function construireWhere(filtres: FiltresDecks): Prisma.DeckWhereInput {
  const where: Prisma.DeckWhereInput = { published: true };
  if (filtres.cat === "guide") where.guide = { not: null };
  else if (filtres.cat === "bestof" || filtres.tournament) {
    where.featured = true;
    if (filtres.tournament) where.tournamentContext = filtres.tournament;
  } else {
    where.OR = [{ tournamentContext: null }, { featured: true }];
  }
  if (filtres.legend) where.legendName = { contains: filtres.legend, mode: "insensitive" };
  if (filtres.set) where.setTag = filtres.set;
  if (filtres.q) {
    const like = { contains: filtres.q, mode: "insensitive" as const };
    where.AND = [{ OR: [
      { title: like }, { legendName: like }, { playerName: like },
      { tournamentContext: like }, { cards: { some: { card: { name: like } } } },
    ] }];
  }
  return where;
}

const deckSelect = {
  id: true, slug: true, title: true, legendName: true, legendId: true,
  playerName: true, authorName: true, placement: true, record: true,
  tournamentContext: true, tournamentTier: true, featured: true, setTag: true,
  sourceUrl: true, guide: true, createdAt: true, description: true, format: true, likes: true,
  sourceArticle: { select: { slug: true, title: true } },
  cards: { select: {
    quantity: true, section: true,
    card: { select: { id: true, name: true, cleanName: true } },
  } },
} satisfies Prisma.DeckSelect;

export async function listerDecks(filtres: FiltresDecks): Promise<LotDecks> {
  const where = construireWhere(filtres);
  const orderBy: Prisma.DeckOrderByWithRelationInput[] = filtres.sort === "popular"
    ? [{ likes: "desc" }, { createdAt: "desc" }]
    : [{ tournamentTier: "asc" }, { createdAt: "desc" }];
  const utilisateur = await getUserFromSession();

  const [bruts, totalSansCollection] = await Promise.all([
    prisma.deck.findMany({
      where,
      orderBy,
      skip: filtres.owned ? undefined : filtres.offset,
      take: filtres.owned ? undefined : TAILLE_LOT_DECKS + 1,
      select: deckSelect,
    }),
    filtres.owned ? Promise.resolve(0) : prisma.deck.count({ where }),
  ]);

  let decks = bruts;
  const couvertures = new Map<string, DeckListe["coverage"]>();
  if (utilisateur && bruts.length) {
    const possedees = await getOwnedByName(utilisateur.id);
    for (const deck of bruts) {
      const cartes: DeckCardLike[] = deck.cards.map((dc) => ({
        cardId: dc.card.id,
        name: dc.card.name,
        cleanName: dc.card.cleanName,
        section: dc.section,
        quantity: dc.quantity,
      }));
      if (!cartes.length) continue;
      const total = computeDeckCoverage(possedees, cartes).totals;
      couvertures.set(deck.id, { owned: total.owned, required: total.required, missing: total.missing });
    }
    if (filtres.owned) decks = decks.filter((deck) => couvertures.get(deck.id)?.missing === 0);
  } else if (filtres.owned) {
    decks = [];
  }

  const total = filtres.owned ? decks.length : totalSansCollection;
  const lot = decks.slice(filtres.owned ? filtres.offset : 0, (filtres.owned ? filtres.offset : 0) + TAILLE_LOT_DECKS);
  return {
    decks: lot.map(({ cards: _cards, ...deck }) => ({
      ...deck,
      createdAt: deck.createdAt.toISOString(),
      coverage: couvertures.get(deck.id),
    })),
    total,
    suivant: filtres.offset + lot.length < total ? filtres.offset + lot.length : null,
  };
}
