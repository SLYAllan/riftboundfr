import type { Prisma } from "@prisma/client";
import { computeDeckCoverage, type DeckCardLike } from "./collection";
import { getOwnedByName } from "./collection-server";
import { prisma } from "./prisma";
import { getUserFromSession } from "./session";
import { comparerPlacements, construireWhere } from "./deck-listing-params";
import type { DeckListe, FiltresDecks, LotDecks } from "./deck-listing-params";

export { construireWhere, lireFiltresDecks, modifierParametresDecks, parametresDecks, setParDefaut } from "./deck-listing-params";

// Six rangées suffisent pour choisir sans transformer la page en mur de vignettes.
export const TAILLE_LOT_DECKS = 18;


export interface LigneLegende {
  legendName: string;
  decks: number;
  titres: number;
  tier: string | null;
}

const ORDRE_TIER = ["S", "A", "B", "C", "D"];

/**
 * Une ligne par Légende pour l'entrée de /decks.
 *
 * La page ouvrait sur 51 bannières presque identiques : impossible d'y lire quoi
 * jouer. Un joueur cherche d'abord SA Légende, puis ses listes. On compte donc
 * les decks et les titres de chacune, dans le filtre en cours (`legend` retiré,
 * sinon la liste se réduirait au choix déjà fait). Pas de « meilleur classement » :
 * `placement` est du texte, et « 10th » passe avant « 1st » dans un tri de chaînes.
 */
export async function listerLegendes(filtres: FiltresDecks): Promise<LigneLegende[]> {
  const where = construireWhere({ ...filtres, legend: undefined });
  const [groupes, titres, entrees] = await Promise.all([
    prisma.deck.groupBy({
      by: ["legendName"],
      where,
      _count: { _all: true },
    }),
    // `placement` est du texte (« 1st », « 1781th ») : un titre se compte sur la
    // chaîne exacte, pas sur un nombre.
    prisma.deck.groupBy({
      by: ["legendName"],
      where: { ...where, placement: "1st" },
      _count: { _all: true },
    }),
    prisma.tierListEntry.findMany({
      where: { tierList: { current: true, published: true } },
      select: { legendName: true, tier: true },
    }),
  ]);

  // La base n'écrit pas toujours un nom pareil des deux côtés (« Rek'sai » /
  // « Rek'Sai ») : on rapproche sur le nom en minuscules, jamais tel quel.
  const parNom = (nom: string) => nom.trim().toLowerCase();
  const titresParNom = new Map<string, number>(
    titres.map((t) => [parNom(t.legendName), t._count?._all ?? 0]),
  );
  const tierParNom = new Map(entrees.map((e) => [parNom(e.legendName), e.tier]));

  return groupes
    .map((g) => ({
      legendName: g.legendName,
      decks: g._count._all,
      titres: titresParNom.get(parNom(g.legendName)) ?? 0,
      tier: tierParNom.get(parNom(g.legendName)) ?? null,
    }))
    .sort((a, b) => {
      const ta = a.tier ? ORDRE_TIER.indexOf(a.tier) : 99;
      const tb = b.tier ? ORDRE_TIER.indexOf(b.tier) : 99;
      if (ta !== tb) return (ta < 0 ? 99 : ta) - (tb < 0 ? 99 : tb);
      return b.decks - a.decks;
    });
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
  // Le tri par défaut est le placement (voir `FiltresDecks.sort`).
  const tri = filtres.sort ?? "placement";
  const orderBy: Prisma.DeckOrderByWithRelationInput[] = tri === "popular"
    ? [{ likes: "desc" }, { createdAt: "desc" }]
    : [{ createdAt: "desc" }, { tournamentTier: "asc" }];
  const utilisateur = await getUserFromSession();

  // Prisma trie `placement` comme du texte (`10th` avant `2nd`). On ne charge ici
  // que trois champs légers, puis le lot de decks complet dans l'ordre numérique.
  const candidatsPlacement = tri === "placement"
    ? (await prisma.deck.findMany({
        where,
        select: { id: true, placement: true, createdAt: true },
      })).sort((a, b) => comparerPlacements(a.placement, b.placement) || b.createdAt.getTime() - a.createdAt.getTime())
    : null;
  const idsPlacement = candidatsPlacement
    ? candidatsPlacement
        .slice(filtres.owned ? 0 : filtres.offset, filtres.owned ? PLAFOND_SCAN_OWNED : filtres.offset + TAILLE_LOT_DECKS + 1)
        .map((deck) => deck.id)
    : null;
  const ordrePlacement = new Map(idsPlacement?.map((id, index) => [id, index]));

  const [brutsNonTries, totalSansCollection] = await Promise.all([
    prisma.deck.findMany({
      where: idsPlacement ? { ...where, id: { in: idsPlacement } } : where,
      orderBy,
      skip: filtres.owned || idsPlacement ? undefined : filtres.offset,
      // Le +1 sert de sonde : s'il revient, c'est qu'une page suivante existe.
      take: idsPlacement ? undefined : filtres.owned ? PLAFOND_SCAN_OWNED : TAILLE_LOT_DECKS + 1,
      select: deckSelect,
    }),
    // Le total ne sert qu'à l'affichage du premier écran. Le recompter à chaque
    // page de scroll rejouait un COUNT plein table : on ne le lance qu'au 1er lot.
    candidatsPlacement ? Promise.resolve(candidatsPlacement.length)
      : filtres.owned || filtres.offset > 0 ? Promise.resolve(0) : prisma.deck.count({ where }),
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
