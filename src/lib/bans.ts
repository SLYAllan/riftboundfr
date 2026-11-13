// Ban list officielle, sous forme lisible. `banned-cards.ts` reste la liste de noms
// que le deckbuilder interroge ; ici on garde la date et l'annonce, pour la recherche
// de règles et la page ban list.
export interface BanEntry {
  en: string;
  fr?: string;
  type: string;
  date: string;
  /**
   * Date d'effet en ISO, quand l'annonce la précède de plusieurs jours : d'ici là
   * la carte se joue encore en tournoi, et la page d'un deck doit le dire.
   */
  effet?: string;
  source: string;
}

const ANNONCE_MARS = "Annonce design du 31 mars 2026";
const ANNONCE_JUILLET =
  "https://playriftbound.com/fr-fr/news/announcements/july-ban-list-updates/";
// Publiée en anglais seulement : pas de nom français officiel à reprendre.
const ANNONCE_SEPTEMBRE =
  "https://playriftbound.com/en-us/news/announcements/september-ban-list-updates-effective-september-18-2026/";

// Publiée en anglais seulement, elle aussi.
const ANNONCE_NOVEMBRE =
  "https://playriftbound.com/en-us/news/announcements/radiance-ban-list-updates-effective-november-23-2026/";
const NOVEMBRE = { date: "23 novembre 2026", effet: "2026-11-23", source: ANNONCE_NOVEMBRE };

export const BAN_ENTRIES: BanEntry[] = [
  { en: "Called Shot", type: "Sort", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Draven, Vanquisher", type: "Unité", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Fight or Flight", type: "Sort", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Scrapheap", type: "Équipement", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "The Dreaming Tree", type: "Champ de bataille", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Obelisk of Power", type: "Champ de bataille", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Reaver's Row", type: "Champ de bataille", date: "31 mars 2026", source: ANNONCE_MARS },
  { en: "Stealthy Pursuer", fr: "Traqueuse furtive", type: "Unité", date: "24 juillet 2026", source: ANNONCE_JUILLET },
  { en: "The Arena's Greatest", fr: "Légende de l'arène", type: "Champ de bataille", date: "24 juillet 2026", source: ANNONCE_JUILLET },
  { en: "Aspirant's Climb", fr: "Ascension des aspirants", type: "Champ de bataille", date: "24 juillet 2026", source: ANNONCE_JUILLET },
  { en: "Ekko, Recurrent", type: "Unité", date: "18 septembre 2026", source: ANNONCE_SEPTEMBRE },
  { en: "Stacked Deck", type: "Sort", date: "18 septembre 2026", source: ANNONCE_SEPTEMBRE },
  { en: "Riven, Broken Blade", type: "Unité", ...NOVEMBRE },
  { en: "Zhonya's Hourglass", type: "Équipement", ...NOVEMBRE },
  { en: "Stellacorn Herder", type: "Unité", ...NOVEMBRE },
  { en: "Nocturne, Horrifying", type: "Unité", ...NOVEMBRE },
  { en: "Rhasa the Sunderer", type: "Unité", ...NOVEMBRE },
  { en: "Brynhir Thundersong", type: "Unité", ...NOVEMBRE },
  { en: "Dazzling Aurora", type: "Équipement", ...NOVEMBRE },
  { en: "Baited Hook", type: "Équipement", ...NOVEMBRE },
  { en: "Emperor's Dais", type: "Champ de bataille", ...NOVEMBRE },
  { en: "Star Spring", type: "Champ de bataille", ...NOVEMBRE },
];

/**
 * Les cartes interdites d'une liste, regroupées par date d'interdiction, de la
 * plus ancienne à la plus récente (l'ordre de `BAN_ENTRIES`). Sert à dire depuis
 * QUAND une liste de tournoi ne se joue plus : elle était légale le jour où elle
 * a été jouée, et le lecteur doit le comprendre.
 *
 * `aVenir` : l'interdiction est annoncée mais pas encore en vigueur au jour donné.
 * Le ban du 23 novembre 2026 a été annoncé dix jours avant : écrire « interdite
 * depuis le 23 » dès le 13 aurait été faux.
 */
export function interdictionsParDate(
  noms: Iterable<string>,
  jour: string = new Date().toISOString().slice(0, 10),
): Array<{ date: string; cartes: string[]; aVenir: boolean }> {
  const presentes = new Set(noms);
  const groupes: Array<{ date: string; cartes: string[]; aVenir: boolean }> = [];
  for (const ban of BAN_ENTRIES) {
    if (!presentes.has(ban.en)) continue;
    const dernier = groupes.at(-1);
    if (dernier?.date === ban.date) dernier.cartes.push(ban.en);
    else groupes.push({ date: ban.date, cartes: [ban.en], aVenir: !!ban.effet && ban.effet > jour });
  }
  return groupes;
}

/**
 * Les interdictions des cartes qu'un texte écrit à la main nomme. Les guides de
 * Légende datent d'avant le ban du 23 novembre 2026, et aucune liste jouée sans ces
 * cartes n'existait pour les réécrire : la fiche le dit, au lieu de laisser le
 * texte conseiller une carte interdite sans un mot.
 */
export function interdictionsCitees(texte: string, jour?: string) {
  const net = texte.replaceAll("’", "'");
  return interdictionsParDate(BAN_ENTRIES.filter((b) => net.includes(b.en)).map((b) => b.en), jour);
}
