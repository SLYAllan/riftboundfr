// Ban list officielle Riftbound. Noms = exactement ceux de la base (Card.name)
// pour que isBanned() matche.
//
// Deux annonces cumulées :
//  - 31 mars 2026 (annonce design) : 7 cartes, jouables en draft/sealed mais
//    bannies en constructed. Cf. data/video-insights/cross-set-casts-2026-06.md.
//  - 24 juillet 2026 (July Ban List Updates, patch Vendetta) : 1 unité et 2 champs
//    de bataille bannis en Standard.
//    https://playriftbound.com/fr-fr/news/announcements/july-ban-list-updates/
export const BANNED_CARD_NAMES = new Set([
  // 31 mars 2026
  "Called Shot",
  "Draven, Vanquisher",
  "Fight or Flight",
  "Scrapheap",
  "The Dreaming Tree",
  "Obelisk of Power",
  "Reaver's Row",
  // 24 juillet 2026
  "Stealthy Pursuer",
  "The Arena's Greatest",
  "Aspirant's Climb",
]);

// Aucune Légende n'est bannie dans les formats couverts par le site. L'annonce de
// juillet 2026 en bannit une en 2v2 construit, format qu'on ne suit pas : ne pas la
// remonter ici, tout le site l'afficherait bannie à tort.

export function isBanned(cardName: string): boolean {
  return BANNED_CARD_NAMES.has(cardName);
}
