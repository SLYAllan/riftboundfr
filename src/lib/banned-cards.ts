// Ban list officielle Riftbound (annonce design, effective 31 mars 2026) : 7 cartes,
// jouables en draft/sealed mais bannies en constructed. Noms = exactement ceux de la
// base (Card.name) pour que isBanned() matche. Cf. data/video-insights/cross-set-casts-2026-06.md.
export const BANNED_CARD_NAMES = new Set([
  "Called Shot",
  "Draven, Vanquisher",
  "Fight or Flight",
  "Scrapheap",
  "The Dreaming Tree",
  "Obelisk of Power",
  "Reaver's Row",
]);

export function isBanned(cardName: string): boolean {
  return BANNED_CARD_NAMES.has(cardName);
}
