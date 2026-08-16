export function slugsDuLot(decks: { id: string }[]): string[] {
  return [...new Set(decks.map((deck) => deck.id))];
}

export function sourceDuDeck(deck: { source?: string | null; sourceUrl?: string | null }): string | null {
  return deck.sourceUrl ?? deck.source ?? null;
}
