export type OwnedByName = Map<string, number>;

// Clé de carte JOUABLE : on ignore le suffixe de variante/traitement entre
// parenthèses - (Metal), (Overnumbered), (alt art)… - qui ne sont que des
// éditions cosmétiques de la même carte. Posséder n'importe quelle impression
// d'une carte suffit donc à la jouer dans un deck.
function nameKey(_cleanName: string | null, name: string): string {
  return name
    .replace(/\s*\([^)]*\)\s*$/, "") // retire le suffixe de variante
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // accents
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function buildOwnedByName(
  items: { card: { cleanName: string | null; name: string }; quantity: number }[],
): OwnedByName {
  const owned: OwnedByName = new Map();
  for (const it of items) {
    const key = nameKey(it.card.cleanName, it.card.name);
    owned.set(key, (owned.get(key) ?? 0) + it.quantity);
  }
  return owned;
}

export interface DeckCardLike {
  cardId: string;
  name: string;
  section: string;
  cleanName: string | null;
  quantity: number;
  imageUrl?: string | null;
  rarity?: string | null;
  type?: string | null;
  energy?: number | null;
  might?: number | null;
  domains?: string[];
}

export interface CoverageEntry {
  cardId: string;
  name: string;
  section: string;
  required: number;
  owned: number;
  missing: number;
  imageUrl?: string | null;
  rarity?: string | null;
  type?: string | null;
  energy?: number | null;
  might?: number | null;
  domains?: string[];
}

export interface DeckCoverage {
  entries: CoverageEntry[];
  totals: { required: number; owned: number; missing: number; completionPct: number };
}

export function computeDeckCoverage(
  owned: OwnedByName,
  deckCards: DeckCardLike[],
): DeckCoverage {
  // Une carte jouée en main ET en réserve arrivait ici en deux lignes, donc deux
  // vignettes de la même carte dans « cartes manquantes ». On additionne d'abord
  // les quantités par carte : une carte, une ligne. La section retenue est celle
  // de la première ligne, elle ne sert pas à l'affichage.
  const merged = new Map<string, DeckCardLike>();
  for (const dc of deckCards) {
    const key = nameKey(dc.cleanName, dc.name);
    const seen = merged.get(key);
    if (seen) seen.quantity += dc.quantity;
    else merged.set(key, { ...dc });
  }

  // On consomme les exemplaires possédés au fur et à mesure : si deux lignes du
  // deck pointent vers la même carte (impressions différentes), elles puisent
  // dans le même stock au lieu de le compter deux fois.
  const remaining = new Map(owned);
  const entries: CoverageEntry[] = [...merged.values()].map((dc) => {
    const key = nameKey(dc.cleanName, dc.name);
    const have = remaining.get(key) ?? 0;
    const used = Math.min(have, dc.quantity);
    remaining.set(key, have - used);
    return {
      cardId: dc.cardId,
      name: dc.name,
      section: dc.section,
      required: dc.quantity,
      owned: used,
      missing: Math.max(0, dc.quantity - used),
      imageUrl: dc.imageUrl ?? null,
      rarity: dc.rarity ?? null,
      type: dc.type ?? null,
      energy: dc.energy ?? null,
      might: dc.might ?? null,
      domains: dc.domains ?? [],
    };
  });
  const required = entries.reduce((s, e) => s + e.required, 0);
  const ownedTotal = entries.reduce((s, e) => s + e.owned, 0);
  const missing = entries.reduce((s, e) => s + e.missing, 0);
  const completionPct = required === 0 ? 100 : Math.round((ownedTotal / required) * 100);
  return { entries, totals: { required, owned: ownedTotal, missing, completionPct } };
}
