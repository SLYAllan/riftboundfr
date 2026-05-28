export const BANNED_CARD_NAMES = new Set([
  "Fight or Flight",
  "Scrapheap",
  "Obelisk of Power",
  "The Dreaming Tree",
  "Draven - Vanquisher",
  "Called Shot",
]);

export function isBanned(cardName: string): boolean {
  return BANNED_CARD_NAMES.has(cardName);
}
