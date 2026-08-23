import type { Prisma } from "@prisma/client";
import { computeDeckCoverage, type DeckCardLike } from "./collection";
import { getOwnedByName } from "./collection-server";
import { prisma } from "./prisma";
import { getUserFromSession } from "./session";
import { construireWhere } from "./deck-listing-params";
import type { DeckListe, FiltresDecks, LotDecks } from "./deck-listing-params";

export { construireWhere, lireFiltresDecks, parametresDecks } from "./deck-listing-params";

// 51 decks remplit exactement 17 rangées sur la grille desktop à trois colonnes.
export const TAILLE_LOT_DECKS = 51;


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

// Filtre "owned" : la couverture se calcule en JS, donc il faut charger des decks
// entiers (avec leurs cartes) et les filtrer après coup. Avant, `take: undefined`
// chargeait TOUS les decks publiés à chaque requête. Plafond : on scanne au plus
// les 300 mieux classés (via orderBy). ponytail: si un jour un utilisateur possède
// assez pour dépasser 300 decks jouables, paginer la couverture côté DB.
const PLAFOND_SCAN_OWNED = 300;

export async function listerDecks(filtres: FiltresDecks): Promise<LotDecks> {
  const where = construireWhere(filtres);
  // "Récents" doit trier par date, pas par tier : sinon les tournois tier S
  // (anciens Regional) enterrent les nouveaux City Challenge et l'onglet ne fait
  // rien de visible. Le tier ne départage plus qu'à date égale (même seed).
  const orderBy: Prisma.DeckOrderByWithRelationInput[] = filtres.sort === "popular"
    ? [{ likes: "desc" }, { createdAt: "desc" }]
    : [{ createdAt: "desc" }, { tournamentTier: "asc" }];
  const utilisateur = await getUserFromSession();

  const [bruts, totalSansCollection] = await Promise.all([
    prisma.deck.findMany({
      where,
      orderBy,
      skip: filtres.owned ? undefined : filtres.offset,
      // Le +1 sert de sonde : s'il revient, c'est qu'une page suivante existe.
      take: filtres.owned ? PLAFOND_SCAN_OWNED : TAILLE_LOT_DECKS + 1,
      select: deckSelect,
    }),
    // Le total ne sert qu'à l'affichage du premier écran. Le recompter à chaque
    // page de scroll rejouait un COUNT plein table : on ne le lance qu'au 1er lot.
    filtres.owned || filtres.offset > 0 ? Promise.resolve(0) : prisma.deck.count({ where }),
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

  const versListe = ({ cards: _cards, ...deck }: (typeof decks)[number]): DeckListe => ({
    ...deck,
    createdAt: deck.createdAt.toISOString(),
    coverage: couvertures.get(deck.id),
  });

  if (filtres.owned) {
    const total = decks.length;
    const lot = decks.slice(filtres.offset, filtres.offset + TAILLE_LOT_DECKS);
    return {
      decks: lot.map(versListe),
      total,
      suivant: filtres.offset + lot.length < total ? filtres.offset + lot.length : null,
    };
  }

  // Non-owned : la sonde +1 dit s'il reste une page, sans dépendre du COUNT.
  const aSuite = bruts.length > TAILLE_LOT_DECKS;
  return {
    decks: decks.slice(0, TAILLE_LOT_DECKS).map(versListe),
    total: totalSansCollection,
    suivant: aSuite ? filtres.offset + TAILLE_LOT_DECKS : null,
  };
}
