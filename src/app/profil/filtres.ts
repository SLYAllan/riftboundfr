export interface FiltresProfil {
  visibilite?: string;
  legende?: string;
}

/**
 * Construit le lien d'un filtre de « Mes decks » en gardant l'autre filtre.
 *
 * Le test se fait avec `in` et non `?? courant` : passer `{ visibilite: undefined }`
 * doit EFFACER le filtre, alors que ne pas passer la clé doit le CONSERVER. Avec
 * `??`, les deux cas seraient confondus et aucune pastille ne pourrait se désactiver.
 */
export function lienFiltreProfil(courant: FiltresProfil, maj: FiltresProfil): string {
  const q = new URLSearchParams();
  const visibilite = "visibilite" in maj ? maj.visibilite : courant.visibilite;
  const legende = "legende" in maj ? maj.legende : courant.legende;
  if (visibilite) q.set("visibilite", visibilite);
  if (legende) q.set("legende", legende);
  const chaine = q.toString();
  return `/profil${chaine ? `?${chaine}` : ""}#mes-decks`;
}
