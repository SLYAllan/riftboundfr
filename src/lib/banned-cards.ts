// Ban list officielle Riftbound. Noms = exactement ceux de la base (Card.name)
// pour que isBanned() matche.
//
// Deux annonces cumulées :
//  - 31 mars 2026 (annonce design) : 7 cartes, jouables en draft/sealed mais
//    bannies en constructed. Cf. data/video-insights/cross-set-casts-2026-06.md.
//  - 24 juillet 2026 (July Ban List Updates, patch Vendetta) : 1 unité et 2 champs
//    de bataille bannis en Standard.
//    https://playriftbound.com/fr-fr/news/announcements/july-ban-list-updates/
//  - 15 septembre 2026 (September Ban List Updates, en vigueur le 18) : 1 unité et
//    1 sort bannis en Standard et en 2v2. Appliqués dès l'annonce, pour que les
//    listes montées cette semaine soient déjà légales le 18.
//    https://playriftbound.com/en-us/news/announcements/september-ban-list-updates-effective-september-18-2026/
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
  // 18 septembre 2026
  "Ekko, Recurrent",
  "Stacked Deck",
]);

// Aucune Légende n'est bannie dans les formats couverts par le site. L'annonce de
// juillet 2026 en bannit une en 2v2 construit, format qu'on ne suit pas : ne pas la
// remonter ici, tout le site l'afficherait bannie à tort.

/**
 * Les annonces, avec leur date. Les mêmes que le commentaire d'en-tête, mais
 * lisibles par le code : la cloche s'en sert pour prévenir les membres abonnés
 * aux changements de règles, et elle ne peut pas lire un commentaire.
 */
export const DATES_BANS: Array<{ date: string; libelle: string }> = [
  { date: "2026-03-31", libelle: "7 cartes interdites en construit" },
  { date: "2026-07-24", libelle: "3 cartes interdites en Standard" },
  { date: "2026-09-15", libelle: "2 cartes interdites en Standard le 18 septembre" },
];

export function isBanned(cardName: string): boolean {
  return BANNED_CARD_NAMES.has(cardName);
}
