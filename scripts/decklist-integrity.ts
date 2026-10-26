type CarteReserve = { quantity: number };

// Radiance garde la construction de Vendetta (66 cartes, réserve de 10). Écrit
// `set !== "Vendetta"`, le contrôle laissait passer une liste Radiance amputée.
const SETS_A_RESERVE = new Set(["Vendetta", "Radiance"]);

interface DecklistVendetta {
  set: string;
  mainDeck: CarteReserve[];
  champion: string | null;
  runes: Record<string, number>;
  battlefields: string[];
  sideDeck: CarteReserve[];
}

export function reserveVendettaComplete(set: string, sideDeck: CarteReserve[]): boolean {
  if (!SETS_A_RESERVE.has(set)) return true;
  return sideDeck.reduce((total, carte) => total + carte.quantity, 0) === 10;
}

export function decklistVendettaComplete(deck: DecklistVendetta): { complete: boolean; missing: string[] } {
  if (!SETS_A_RESERVE.has(deck.set)) return { complete: true, missing: [] };

  const main = deck.mainDeck.reduce((total, carte) => total + carte.quantity, 0);
  const runes = Object.values(deck.runes).reduce((total, quantity) => total + quantity, 0);
  const side = deck.sideDeck.reduce((total, carte) => total + carte.quantity, 0);
  const missing: string[] = [];
  if (main !== 39) missing.push(`deck principal ${main}/39`);
  if (!deck.champion) missing.push("champion 0/1");
  if (runes !== 12) missing.push(`runes ${runes}/12`);
  if (deck.battlefields.length !== 3) missing.push(`champs de bataille ${deck.battlefields.length}/3`);
  if (side !== 10) missing.push(`réserve ${side}/10`);
  return { complete: missing.length === 0, missing };
}
