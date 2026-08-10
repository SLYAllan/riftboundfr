// Quatre-vingt-seize noms de cartes existent en plusieurs impressions (promo OPP,
// showcase, réimpression d'un set plus récent). Le code texte d'un deck ne transporte
// que des noms : au rendu, on gardait « la dernière ligne renvoyée par la base », donc
// une illustration au hasard, souvent différente de celle affichée dans le deckbuilder.
//
// On ne privilégie aucune rareté : on reprend simplement le tri du deckbuilder, qui
// dédoublonne par nom après `orderBy: [{ set: "asc" }, { collectorNumber: "asc" }]`
// (src/app/deckbuilder/page.tsx). La carte du visuel est donc celle qu'on a vue en la
// choisissant, quelle que soit sa rareté.

export interface Printing {
  name: string;
  set?: string | null;
  collectorNumber?: number | null;
}

function rank(c: Printing): [string, number] {
  return [c.set ?? "￿", c.collectorNumber ?? Number.MAX_SAFE_INTEGER];
}

/** Renvoie l'impression à afficher entre deux cartes de même nom. */
export function preferredPrinting<T extends Printing>(a: T, b: T): T {
  const [sa, na] = rank(a);
  const [sb, nb] = rank(b);
  if (sa !== sb) return sa < sb ? a : b;
  return na <= nb ? a : b;
}

/**
 * Indexe des cartes par identifiant ET par nom (sensible et insensible à la casse).
 * Sur un nom partagé, garde la même impression que le deckbuilder.
 */
export function buildCardLookup<T extends Printing & { riftboundId: string }>(cards: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const c of cards) {
    map.set(c.riftboundId, c);
    for (const key of [c.name, c.name.toLowerCase()]) {
      const existing = map.get(key);
      map.set(key, existing ? preferredPrinting(existing, c) : c);
    }
  }
  return map;
}
