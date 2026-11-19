import type { Carte } from "./cardnexus";
import { buildOwnedByName, computeDeckCoverage } from "./collection";
import { decksPasChers, type ListeClassee } from "./listes-classees";

/** Un deck de départ tel que l'écrit `scripts/decks-de-depart.mts`. */
export interface DeckDeDepart {
  set: string;
  produit: string;
  source: string;
  legende: { riftboundId: string; name: string };
  principal: Carte[];
  champsDeBataille: Carte[];
  runes: Carte[];
  /** Cartes de la liste Riot qu'aucune source ne permet d'identifier : montrées, jamais remplacées. */
  inconnues: { nom: string; quantity: number }[];
}

export function contenuDeck(deck: DeckDeDepart): Carte[] {
  return [{ ...deck.legende, quantity: 1 }, ...deck.principal, ...deck.champsDeBataille, ...deck.runes];
}

/**
 * Ce qu'il faut acheter pour passer du deck de départ à `liste`. Même règle que la
 * couverture de collection : une carte se compte par son nom, toutes impressions
 * confondues, la carte du deck de départ n'étant souvent qu'une autre impression.
 */
export function cartesAAcheter(deck: DeckDeDepart, liste: Carte[]): Carte[] {
  const possedees = buildOwnedByName(
    contenuDeck(deck).map((c) => ({ card: { cleanName: null, name: c.name }, quantity: c.quantity })),
  );
  const { entries } = computeDeckCoverage(
    possedees,
    liste.map((c) => ({ cardId: c.riftboundId, name: c.name, section: "main", cleanName: null, quantity: c.quantity })),
  );
  return entries.filter((e) => e.missing > 0).map((e) => ({ riftboundId: e.cardId, name: e.name, quantity: e.missing }));
}

/**
 * La liste de la même Légende, classée dans les 16 premiers et sans carte interdite,
 * qui coûte le moins à monter depuis ce deck. `null` si la Légende n'en a aucune.
 */
export function meilleureMontee<T extends ListeClassee>(
  deck: DeckDeDepart,
  listes: T[],
  chiffrer: (cartes: Carte[]) => { total: number; exemplairesSansPrix: number },
): { liste: T; prix: number; manquantes: Carte[] } | null {
  // ponytail: decksPasChers écarte un total nul ; aucun deck de départ ne contient
  // une liste de tournoi entière, le cas ne se présente pas.
  const [meilleure] = decksPasChers(
    listes.filter((l) => l.legende === deck.legende.name),
    (cartes) => chiffrer(cartesAAcheter(deck, cartes)),
  );
  return meilleure ? { ...meilleure, manquantes: cartesAAcheter(deck, meilleure.liste.cartes) } : null;
}
