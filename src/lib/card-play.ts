import { prisma } from "./prisma";
import { getTournamentInfo } from "./tournament-flags";

// Ce que les decks de tournoi font d'une carte : combien la jouent, en combien
// d'exemplaires, sous quelles Légendes, à quels événements.
//
// Passage unique. La fiche carte affichait déjà cinq decks, mais sur SA seule
// impression : une carte réimprimée en avait autant de compteurs que de numéros,
// et aucun ne disait la vérité. Tout part donc du NOM, et l'impression n'est
// qu'une ligne de détail.
//
// Rien n'est compté sur les decks de la communauté : ce sont des listes que
// n'importe qui publie, pas des résultats. Mélanger les deux ferait passer une
// carte pour un choix de tournoi parce que dix personnes l'ont mise dans un
// brouillon.

/** Une impression de la carte, et le nombre de decks qui jouent celle-là. */
export interface ImpressionJouee {
  cardId: string;
  riftboundId: string;
  set: string;
  collectorNumber: number | null;
  alternateArt: boolean;
  overnumbered: boolean;
  decks: number;
}

export interface DeckQuiJoue {
  slug: string;
  title: string;
  legendName: string;
  placement: string | null;
  tournamentContext: string | null;
  featured: boolean;
  date: string | null;
  quantite: number;
  section: string;
}

export interface StatsJeuCarte {
  /** Decks de tournoi publiés qui jouent la carte, toutes impressions confondues. */
  decks: number;
  /** Ceux qui portent un classement. Le reste est du bruit de fond. */
  decksClasses: number;
  /**
   * Où la carte est jouée, du plus fréquent au plus rare, avec les exemplaires
   * moyens à chaque place. Six sections existent en base (`main`, `side`,
   * `legend`, `rune`, `battlefield`, `champion`) : tout ranger en « principal ou
   * réserve » faisait passer les champs de bataille et les runes pour de la
   * réserve.
   */
  emplacements: Array<{ section: string; decks: number; moyenne: number | null }>;
  legendes: Array<{ nom: string; decks: number }>;
  evenements: Array<{ nom: string; decks: number; date: string | null }>;
  impressions: ImpressionJouee[];
  meilleurs: DeckQuiJoue[];
}

/**
 * Le classement d'un deck, en nombre. `placement` est du TEXTE en base
 * (« 1st », « 1781th ») : trié comme une chaîne, « 10th » passe avant « 2nd ».
 */
export function rangPlacement(placement: string | null): number {
  if (!placement) return Number.POSITIVE_INFINITY;
  const n = Number.parseInt(placement.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(n) ? Number.POSITIVE_INFINITY : n;
}

/**
 * L'ordre des listes à montrer : le mieux classé d'abord, un deck sans
 * classement toujours après un deck classé, puis les mis en avant.
 */
export function comparerDecksJoues(a: DeckQuiJoue, b: DeckQuiJoue): number {
  const ra = rangPlacement(a.placement);
  const rb = rangPlacement(b.placement);
  if (ra !== rb) return ra - rb;
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  // À classement égal, le plus récent : le méta d'il y a un an ne dit plus rien
  // de ce qui se joue ce mois-ci.
  return (b.date ?? "").localeCompare(a.date ?? "");
}

/**
 * Le nom d'un événement sans la date que certains contextes traînent déjà
 * (« S3 National Open (2026-07-19) »). Affiché tel quel à côté de la date mise
 * en forme, il donnait deux fois la même date sur la même ligne.
 */
export function nomEvenement(contexte: string): string {
  return contexte.replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*$/, "").trim();
}

/** Combien d'exemplaires en moyenne, arrondi au dixième. `null` si personne ne la joue. */
export function moyenneExemplaires(exemplaires: number, decks: number): number | null {
  if (decks <= 0) return null;
  return Math.round((exemplaires / decks) * 10) / 10;
}

/**
 * Le nom français d'une section de deck, et la tournure qui va avec.
 *
 * La base les écrit en anglais, et « side » affiché tel quel ne veut rien dire
 * pour un lecteur francophone. La préposition est portée ici, avec le nom :
 * coller un « au » devant chacun donnait « au réserve » et « au Légende ».
 */
export const SECTIONS: Record<string, { nom: string; place: string }> = {
  main: { nom: "deck principal", place: "au deck principal" },
  side: { nom: "réserve", place: "en réserve" },
  legend: { nom: "Légende", place: "en Légende" },
  rune: { nom: "runes", place: "en rune" },
  battlefield: { nom: "champ de bataille", place: "au champ de bataille" },
  champion: { nom: "champion", place: "en champion" },
};

export function libelleSection(section: string): string {
  return SECTIONS[section]?.nom ?? section;
}

export function placeSection(section: string): string {
  return SECTIONS[section]?.place ?? section;
}

/** Le nombre de decks à afficher en exemple. Au-delà, la fiche devient une liste. */
const DECKS_MONTRES = 8;
/** Au-delà, la répartition ne se lit plus. Les autres tiennent dans « et N autres ». */
const LEGENDES_MONTREES = 6;
const EVENEMENTS_MONTRES = 6;

/**
 * Les statistiques de jeu d'une carte, par son NOM.
 *
 * Sept requêtes, toutes agrégées côté base : une carte courante est dans des
 * milliers de lignes de `DeckCard`, et les charger pour les compter en JS
 * mettrait la fiche à genoux. L'index `DeckCard(cardId)` porte le filtre.
 */
export async function statsJeuCarte(nomCarte: string): Promise<StatsJeuCarte | null> {
  // Toutes les impressions du même nom. `mode: "insensitive"` parce que la base
  // n'écrit pas toujours un nom pareil des deux côtés (« Rek'sai » / « Rek'Sai »).
  const impressions = await prisma.card.findMany({
    where: { name: { equals: nomCarte, mode: "insensitive" } },
    select: {
      id: true, riftboundId: true, set: true, collectorNumber: true,
      alternateArt: true, overnumbered: true,
    },
  });
  if (impressions.length === 0) return null;
  const ids = impressions.map((c) => c.id);

  const joueeDansUnDeck = { published: true, cards: { some: { cardId: { in: ids } } } } as const;

  const [decks, decksClasses, parSection, parImpression, parLegende, parEvenement, lignes] =
    await Promise.all([
      // Un deck qui joue la carte au principal ET en réserve fait deux lignes de
      // `DeckCard` : on compte des DECKS, jamais des lignes.
      prisma.deck.count({ where: joueeDansUnDeck }),
      prisma.deck.count({ where: { ...joueeDansUnDeck, placement: { not: null } } }),
      prisma.deckCard.groupBy({
        by: ["section"],
        where: { cardId: { in: ids }, deck: { published: true } },
        _sum: { quantity: true },
        _count: { _all: true },
      }),
      prisma.deckCard.groupBy({
        by: ["cardId"],
        where: { cardId: { in: ids }, deck: { published: true } },
        _count: { _all: true },
      }),
      prisma.deck.groupBy({
        by: ["legendName"],
        where: joueeDansUnDeck,
        _count: { _all: true },
      }),
      prisma.deck.groupBy({
        by: ["tournamentContext"],
        where: { ...joueeDansUnDeck, tournamentContext: { not: null } },
        _count: { _all: true },
      }),
      // Les listes à montrer. On prend large avant le tri fin : `placement` étant
      // du texte, la base ne sait pas le classer, et couper à huit ici écarterait
      // le vainqueur au profit d'un 40e importé plus récemment.
      prisma.deckCard.findMany({
        where: { cardId: { in: ids }, deck: { published: true } },
        select: {
          quantity: true,
          section: true,
          deck: {
            select: {
              slug: true, title: true, legendName: true, placement: true,
              tournamentContext: true, featured: true,
            },
          },
        },
        orderBy: [{ deck: { featured: "desc" } }, { deck: { createdAt: "desc" } }],
        take: 200,
      }),
    ]);

  const emplacements = parSection
    .map((s) => ({
      section: s.section,
      decks: s._count._all,
      moyenne: moyenneExemplaires(s._sum.quantity ?? 0, s._count._all),
    }))
    .sort((a, b) => b.decks - a.decks);

  const parSlug = new Map<string, DeckQuiJoue>();
  for (const ligne of lignes) {
    // Le même deck revient une fois par section : on garde la ligne du deck
    // principal, qui est celle qui dit ce que le joueur a vraiment monté.
    const deja = parSlug.get(ligne.deck.slug);
    if (deja && deja.section === "main") continue;
    parSlug.set(ligne.deck.slug, {
      ...ligne.deck,
      quantite: ligne.quantity,
      section: ligne.section,
      date: ligne.deck.tournamentContext
        ? getTournamentInfo(ligne.deck.tournamentContext)?.date ?? null
        : null,
    });
  }

  return {
    decks,
    decksClasses,
    emplacements,
    legendes: parLegende
      .map((l) => ({ nom: l.legendName, decks: l._count._all }))
      .sort((a, b) => b.decks - a.decks)
      .slice(0, LEGENDES_MONTREES),
    evenements: parEvenement
      .map((e) => ({
        nom: e.tournamentContext!,
        decks: e._count._all,
        date: getTournamentInfo(e.tournamentContext!)?.date ?? null,
      }))
      .sort((a, b) => b.decks - a.decks)
      .slice(0, EVENEMENTS_MONTRES),
    impressions: impressions
      .map(({ id, ...c }) => ({
        cardId: id,
        ...c,
        decks: parImpression.find((p) => p.cardId === id)?._count._all ?? 0,
      }))
      .sort((a, b) => b.decks - a.decks),
    meilleurs: [...parSlug.values()].sort(comparerDecksJoues).slice(0, DECKS_MONTRES),
  };
}
