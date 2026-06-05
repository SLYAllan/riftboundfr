export type OwnedByName = Map<string, number>;

function nameKey(cleanName: string | null, name: string): string {
  return (cleanName || name).trim().toLowerCase();
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
}

export interface CoverageEntry {
  cardId: string;
  name: string;
  section: string;
  required: number;
  owned: number;
  missing: number;
}

export interface DeckCoverage {
  entries: CoverageEntry[];
  totals: { required: number; owned: number; missing: number; completionPct: number };
}

export function computeDeckCoverage(
  owned: OwnedByName,
  deckCards: DeckCardLike[],
): DeckCoverage {
  const entries: CoverageEntry[] = deckCards.map((dc) => {
    const key = nameKey(dc.cleanName, dc.name);
    const have = owned.get(key) ?? 0;
    const usableForCard = Math.min(have, dc.quantity);
    return {
      cardId: dc.cardId,
      name: dc.name,
      section: dc.section,
      required: dc.quantity,
      owned: usableForCard,
      missing: Math.max(0, dc.quantity - have),
    };
  });
  const required = entries.reduce((s, e) => s + e.required, 0);
  const ownedTotal = entries.reduce((s, e) => s + e.owned, 0);
  const missing = entries.reduce((s, e) => s + e.missing, 0);
  const completionPct = required === 0 ? 100 : Math.round((ownedTotal / required) * 100);
  return { entries, totals: { required, owned: ownedTotal, missing, completionPct } };
}
