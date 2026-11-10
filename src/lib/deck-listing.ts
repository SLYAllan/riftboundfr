import { unstable_cache } from "next/cache";
import { parcourirLots } from "./collection-lots";
import { cartesInterdites } from "./banned-cards";
import { chargerPrix, chiffrerDeck, prixPerimes } from "./cardnexus";
import type { Prisma } from "@prisma/client";
import { computeDeckCoverage, type DeckCardLike } from "./collection";
import { getOwnedByName } from "./collection-server";
import { prisma } from "./prisma";
import { getUserFromSession } from "./session";
import { getTournamentTier } from "./tournament-flags";
import { comparerPlacements, construireWhere, palierAccessibilite } from "./deck-listing-params";
import type { DeckListe, FiltresDecks, LotDecks } from "./deck-listing-params";

export { construireWhere, lireFiltresDecks, modifierParametresDecks, parametresDecks, setParDefaut } from "./deck-listing-params";

// Six rangées suffisent pour choisir sans transformer la page en mur de vignettes.
export const TAILLE_LOT_DECKS = 18;

const deckSelect = {
  id: true, slug: true, title: true, legendName: true, legendId: true,
  playerName: true, authorName: true, placement: true, record: true,
  tournamentContext: true, tournamentTier: true, featured: true, setTag: true,
  sourceUrl: true, guide: true, createdAt: true, description: true, format: true, likes: true,
  sourceArticle: { select: { slug: true, title: true } },
  cards: { select: {
    quantity: true, section: true,
    card: { select: { id: true, riftboundId: true, name: true, cleanName: true } },
  } },
} satisfies Prisma.DeckSelect;

const placementsTries = unstable_cache(async (where: Prisma.DeckWhereInput) => {
  const candidats = await prisma.deck.findMany({
    where, select: { id: true, placement: true, createdAt: true, tournamentContext: true },
  });
  const rang = (contexte: string | null) => contexte && getTournamentTier(contexte) === "S" ? 0 : 1;
  return candidats.sort((a, b) => rang(a.tournamentContext) - rang(b.tournamentContext)
    || comparerPlacements(a.placement, b.placement)
    || b.createdAt.getTime() - a.createdAt.getTime() || a.id.localeCompare(b.id)).map((d) => d.id);
}, ["placements-decks"], { revalidate: 60 });

export async function listerDecks(filtres: FiltresDecks): Promise<LotDecks> {
  const where = construireWhere(filtres);
  // "Récents" doit trier par date, pas par tier : sinon les tournois tier S
  // (anciens Regional) enterrent les nouveaux City Challenge et l'onglet ne fait
  // rien de visible. Le tier ne départage plus qu'à date égale (même seed).
  // Le tri par défaut est le placement (voir `FiltresDecks.sort`).
  const utilisateur = await getUserFromSession();
  // Le tri par accessibilité n'a de sens qu'avec une collection : sans compte, il
  // retombe sur le tri par défaut plutôt que de rendre une page vide.
  const triDemande = filtres.sort ?? "placement";
  const tri = triDemande === "accessible" && !utilisateur ? "placement" : triDemande;
  const orderBy: Prisma.DeckOrderByWithRelationInput[] = tri === "popular"
    ? [{ likes: "desc" }, { createdAt: "desc" }]
    : [{ createdAt: "desc" }, { tournamentTier: "asc" }];
  // Deux besoins, un seul chemin : le filtre collection et le tri par
  // accessibilité classent des decks sur leur couverture, qui se calcule en JS.
  // Les deux doivent donc charger des decks ENTIERS puis trancher après coup,
  // au lieu de découper un lot que la base aurait déjà ordonné.
  const balayage = filtres.owned || tri === "accessible";

  // Prisma trie `placement` comme du texte (`10th` avant `2nd`). On ne charge ici
  // que quatre champs légers, puis le lot de decks complet dans l'ordre voulu.
  //
  // Le tier du TOURNOI passe avant le placement : un Regional (tier S) pèse plus
  // qu'un City Challenge, et sans ça la page ouvrait sur des dizaines de « 1st »
  // de petits tournois. Il se calcule ici, jamais en base : la colonne
  // `tournamentTier` d'un deck dit tout autre chose (la qualité de SON résultat,
  // S = top 3), et la confondre casserait le classement de /legendes.
  //
  // Le tri se fait sur TOUS les candidats avant la découpe en lots. Trier après
  // la découpe ne trierait qu'à l'intérieur d'une page.
  const candidatsPlacement = tri === "placement" ? await placementsTries(where) : null;
  if (balayage && utilisateur) {
    const possedees = await getOwnedByName(utilisateur.id);
    const prix = chargerPrix();
    const prixAnciens = prixPerimes(prix);
    const retenus: DeckListe[] = [];
    const positions = new Map(candidatsPlacement?.map((id, i) => [id, i]));
    await parcourirLots(
      (skip, take) => prisma.deck.findMany({ where, select: deckSelect, orderBy: [{ id: "asc" }], skip, take }),
      (lot) => {
        for (const { cards, ...deck } of lot) {
          if (!cards.length) continue;
          const couverture = computeDeckCoverage(possedees, cards.map((dc) => ({
            cardId: dc.card.riftboundId, name: dc.card.name, cleanName: dc.card.cleanName,
            quantity: dc.quantity, section: dc.section,
          })));
          const { owned, required, missing } = couverture.totals;
          if (filtres.owned && missing > 0) continue;
          const chiffre = chiffrerDeck(couverture.entries.filter((e) => e.missing > 0)
            .map((e) => ({ riftboundId: e.cardId, name: e.name, quantity: e.missing })), prix);
          const eur = prixAnciens || chiffre.exemplairesSansPrix > 0 ? null : chiffre.total;
          retenus.push({ ...deck, createdAt: deck.createdAt.toISOString(),
            interdites: cartesInterdites(cards.map((dc) => dc.card.name)),
            coverage: { owned, required, missing },
            accessibilite: tri === "accessible" ? { palier: palierAccessibilite(missing, eur), manquantes: missing, eur } : undefined,
          });
        }
      },
    );
    retenus.sort((a, b) => {
      if (tri === "accessible") {
        const x = a.accessibilite!, y = b.accessibilite!;
        return x.palier - y.palier || x.manquantes - y.manquantes || (x.eur ?? Infinity) - (y.eur ?? Infinity) || a.id.localeCompare(b.id);
      }
      if (tri === "placement") return positions.get(a.id)! - positions.get(b.id)!;
      return (tri === "popular" ? b.likes - a.likes : 0) || b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id);
    });
    return {
      decks: retenus.slice(filtres.offset, filtres.offset + TAILLE_LOT_DECKS),
      total: retenus.length,
      suivant: filtres.offset + TAILLE_LOT_DECKS < retenus.length ? filtres.offset + TAILLE_LOT_DECKS : null,
    };
  }
  if (filtres.owned) return { decks: [], total: 0, suivant: null };
  const idsPlacement = candidatsPlacement?.slice(filtres.offset, filtres.offset + TAILLE_LOT_DECKS + 1) ?? null;
  const ordrePlacement = new Map(idsPlacement?.map((id, index) => [id, index]));

  const [brutsNonTries, totalSansCollection] = await Promise.all([
    prisma.deck.findMany({
      where: idsPlacement ? { ...where, id: { in: idsPlacement } } : where,
      orderBy,
      skip: balayage || idsPlacement ? undefined : filtres.offset,
      // Le +1 sert de sonde : s'il revient, c'est qu'une page suivante existe.
      take: idsPlacement ? undefined : TAILLE_LOT_DECKS + 1,
      select: deckSelect,
    }),
    // Le total ne sert qu'à l'affichage du premier écran. Le recompter à chaque
    // page de scroll rejouait un COUNT plein table : on ne le lance qu'au 1er lot.
    candidatsPlacement ? Promise.resolve(candidatsPlacement.length)
      : balayage || filtres.offset > 0 ? Promise.resolve(0) : prisma.deck.count({ where }),
  ]);
  const bruts = ordrePlacement.size
    ? brutsNonTries.sort((a, b) => ordrePlacement.get(a.id)! - ordrePlacement.get(b.id)!)
    : brutsNonTries;

  let decks = bruts;
  const couvertures = new Map<string, DeckListe["coverage"]>();
  if (utilisateur && bruts.length) {
    const possedees = await getOwnedByName(utilisateur.id);
    for (const deck of bruts) {
      const cartes: DeckCardLike[] = deck.cards.map((dc) => ({
        // Le riftboundId et pas l'id de base : la couverture recopie `cardId`
        // dans ses entrées, et c'est la seule clé qui retrouve un prix au relevé.
        cardId: dc.card.riftboundId,
        name: dc.card.name,
        cleanName: dc.card.cleanName,
        section: dc.section,
        quantity: dc.quantity,
      }));
      if (!cartes.length) continue;
      const couverture = computeDeckCoverage(possedees, cartes);
      const total = couverture.totals;
      couvertures.set(deck.id, { owned: total.owned, required: total.required, missing: total.missing });


    }
    if (filtres.owned) decks = decks.filter((deck) => couvertures.get(deck.id)?.missing === 0);
  } else if (filtres.owned) {
    decks = [];
  }

  const versListe = ({ cards, ...deck }: (typeof decks)[number]): DeckListe => ({
    ...deck,
    createdAt: deck.createdAt.toISOString(),
    interdites: cartesInterdites(cards.map((dc) => dc.card.name)),
    coverage: couvertures.get(deck.id),
  });

  if (balayage) {
    const total = decks.length;
    const lot = decks.slice(filtres.offset, filtres.offset + TAILLE_LOT_DECKS);
    return {
      decks: lot.map(versListe),
      total,
      suivant: filtres.offset + lot.length < total ? filtres.offset + lot.length : null,
    };
  }

  // Sans balayage : la sonde +1 dit s'il reste une page, sans dépendre du COUNT.
  const aSuite = bruts.length > TAILLE_LOT_DECKS;
  return {
    decks: decks.slice(0, TAILLE_LOT_DECKS).map(versListe),
    total: totalSansCollection,
    suivant: aSuite ? filtres.offset + TAILLE_LOT_DECKS : null,
  };
}
