// Quatre-vingt-seize noms de cartes existent en plusieurs impressions (promo OPP,
// showcase, réimpression d'un set plus récent). Le code texte d'un deck ne transporte
// que des noms : au rendu, on gardait « la dernière ligne renvoyée par la base », donc
// une illustration au hasard, souvent différente de celle affichée dans le deckbuilder.
//
// On ne privilégie aucune rareté : on reprend simplement le tri du deckbuilder, qui
// dédoublonne par nom après `orderBy: [{ set: "asc" }, { collectorNumber: "asc" }]`
// (src/app/deckbuilder/page.tsx). La carte du visuel est donc celle qu'on a vue en la
// choisissant, quelle que soit sa rareté.

// Marqueurs de traitement cosmétique. Aucune carte ne les porte dans son `name`
// en base : ce sont des drapeaux (alternateArt, overnumbered, signature). Collés
// au nom, ils rendent la carte introuvable. À garder aligné avec VARIANT_SUFFIXES
// de src/app/api/legends/route.ts.
export const VARIANT_SUFFIX = /\s*\((Metal|Overnumbered|Signature|Alternate Art|Alt Art|Starter)\)\s*$/i;

// Forme d'un riftboundId : « ogn-183-298 », « unl-060-219 ». Sert à distinguer un
// identifiant d'un nom de carte. Le test « contient un espace » ne suffisait pas :
// « Defy » ou « Vilemaw » passaient pour des identifiants et n'étaient jamais trouvés.
export const RIFTBOUND_ID = /^[a-z]{2,4}-\d{1,3}(-\d{1,3})?$/i;

export function looksLikeRiftboundId(value: string): boolean {
  return RIFTBOUND_ID.test(value.trim());
}

/**
 * Clé de recherche d'un nom de carte, tolérante à ce que les joueurs collent :
 * apostrophe typographique ou absente, espaces multiples, casse, suffixe de
 * variante. « Zhonya’s Hourglass », « Zhonyas Hourglass » et « ZHONYA'S
 * HOURGLASS » mènent tous à la même carte.
 */
export function normalizeCardName(name: string): string {
  return name
    .replace(VARIANT_SUFFIX, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .replace(/[‘’ʼ`´']/g, "") // toutes les apostrophes, y compris absente
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export interface Printing {
  name: string;
  set?: string | null;
  collectorNumber?: number | null;
  alternateArt?: boolean | null;
}

function rank(c: Printing): [number, string, number] {
  // Une impression normale passe avant une alt-art à nom égal : c'est celle que
  // le deckbuilder montre. Mais une carte qui n'existe qu'en alt-art reste
  // trouvable, alors qu'un filtre `alternateArt: false` la faisait disparaître.
  return [c.alternateArt ? 1 : 0, c.set ?? "￿", c.collectorNumber ?? Number.MAX_SAFE_INTEGER];
}

/** Renvoie l'impression à afficher entre deux cartes de même nom. */
export function preferredPrinting<T extends Printing>(a: T, b: T): T {
  const [aa, sa, na] = rank(a);
  const [ab, sb, nb] = rank(b);
  if (aa !== ab) return aa < ab ? a : b;
  if (sa !== sb) return sa < sb ? a : b;
  return na <= nb ? a : b;
}

/**
 * Indexe des cartes par identifiant ET par nom (exact, minuscules, normalisé).
 * Sur un nom partagé, garde la même impression que le deckbuilder.
 */
export function buildCardLookup<T extends Printing & { riftboundId: string }>(cards: T[]): Map<string, T> {
  const map = new Map<string, T>();
  for (const c of cards) {
    map.set(c.riftboundId, c);
    for (const key of [c.name, c.name.toLowerCase(), normalizeCardName(c.name)]) {
      if (!key) continue;
      const existing = map.get(key);
      map.set(key, existing ? preferredPrinting(existing, c) : c);
    }
  }
  return map;
}

/** Retrouve une carte depuis un identifiant OU un nom, quelle que soit sa forme. */
export function findCard<T extends Printing & { riftboundId: string }>(
  map: Map<string, T>,
  identifier: string,
): T | undefined {
  return (
    map.get(identifier) ??
    map.get(identifier.toLowerCase()) ??
    map.get(normalizeCardName(identifier))
  );
}
