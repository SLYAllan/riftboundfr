export const TABLES_ATTENDUES = Object.freeze([
  "Card",
  "sets",
  "Deck",
  "DeckCard",
  "TierList",
  "TierListEntry",
  "Article",
  "Event",
  "User",
  "Comment",
  "CommentVote",
  "CommunityDeck",
  "CommunityDeckVersion",
  "CommunityDeckLike",
  "DeckLike",
  "CollectionItem",
  "Binder",
  "OverlayState",
]);

export function tablesManquantes(tableNames) {
  const presentes = new Set(tableNames);
  return TABLES_ATTENDUES.filter((table) => !presentes.has(table));
}
