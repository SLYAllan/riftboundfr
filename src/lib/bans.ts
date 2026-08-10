// Ban list officielle, sous forme lisible. `banned-cards.ts` reste la liste de noms
// que le deckbuilder interroge ; ici on garde la date et l'annonce, pour la recherche
// de règles et la page ban list.
export interface BanEntry {
  en: string;
  fr?: string;
  type: string;
  date: string;
  source: string;
}

const ANNONCE_MARS = "Annonce design du 31 mars 2026";
const ANNONCE_JUILLET =
  "https://playriftbound.com/fr-fr/news/announcements/july-ban-list-updates/";

export const BAN_ENTRIES: BanEntry[] = [
  { en: "Called Shot", type: "Sort", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Draven, Vanquisher", type: "Unité", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Fight or Flight", type: "Sort", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Scrapheap", type: "Champ de bataille", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "The Dreaming Tree", type: "Champ de bataille", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Obelisk of Power", type: "Champ de bataille", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Reaver's Row", type: "Champ de bataille", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Stealthy Pursuer", fr: "Traqueuse furtive", type: "Unité", date: "24 juillet 2026", source: ANNONCE_JUILLET },
  { en: "The Arena's Greatest", fr: "Légende de l'arène", type: "Champ de bataille", date: "24 juillet 2026", source: ANNONCE_JUILLET },
  { en: "Aspirant's Climb", fr: "Ascension des aspirants", type: "Champ de bataille", date: "24 juillet 2026", source: ANNONCE_JUILLET },
];
