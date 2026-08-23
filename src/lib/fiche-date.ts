const MOIS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/**
 * Extrait la date de relevé d'un champ `dataSource` de fiche Légende.
 *
 * Exemple : « Decklists de tournoi en base : 34 listes, 14 tournois. Relevé du
 * 17 août 2026, calcul par scripts/fiches-stats.mts. » -> 2026-08-17.
 *
 * Renvoie null quand la fiche n'est pas datée (14 fiches sur 43) : mieux vaut ne
 * rien afficher qu'afficher la date du dernier deck importé, qui n'a rien à voir
 * avec la date de l'analyse.
 */
export function dateAnalyseFiche(dataSource?: string | null): Date | null {
  if (!dataSource) return null;
  const m = dataSource.match(/Relevé du (\d{1,2})(?:er)? (\p{L}+) (\d{4})/u);
  if (!m) return null;
  const mois = MOIS.indexOf(m[2].toLowerCase());
  if (mois < 0) return null;
  const d = new Date(Date.UTC(Number(m[3]), mois, Number(m[1])));
  return Number.isNaN(d.getTime()) ? null : d;
}
