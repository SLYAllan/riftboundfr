// Les tables SANS lesquelles le site ne peut pas servir une page. Le démarrage
// refuse une base qui en manque une.
//
// `OverlayMedia` n'y est pas, exprès : elle ne porte que le logo et le fond envoyés
// par un streameur depuis un fichier. L'y mettre ferait refuser le démarrage du
// conteneur entre le déploiement du code et le `prisma db push`, donc mettrait le
// site à terre pour un détail d'habillage. Sans la table, seul l'envoi d'image
// répond en erreur (500, le 19 août 2026, jusqu'à sa création à la main en prod).
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
