// À quoi un membre s'abonne, et ce que ça lui fait remonter.
//
// On stocke l'ABONNEMENT, jamais la notification : la cloche recalcule tout à la
// lecture (voir `notifications.ts`). Un abonnement est une ligne par personne et
// par sujet, écrite au clic ; une notification aurait été une ligne par geste de
// chaque visiteur, à tenir en accord avec les suppressions en cascade.

/** Les sujets auxquels on peut s'abonner. */
export type GenreAbonnement = "legende" | "deck" | "tournois-fr" | "regles";

export interface SujetAbonnement {
  // `string` et pas `GenreAbonnement` : c'est ce que la base rend. Un genre
  // retiré du code laisserait des lignes derrière lui, et les typer trop
  // étroitement ferait mentir la lecture au lieu de les ignorer.
  genre: string;
  /** Ce qu'on suit. Vide pour un abonnement global. */
  cible: string;
}

/**
 * Les sujets qui ne visent rien en particulier : on les suit ou pas, il n'y a
 * pas d'instance à désigner. Leur cible est la chaîne vide, pas `null` : une
 * colonne nulle laisse passer les doublons dans une contrainte d'unicité
 * PostgreSQL, et on se serait abonné dix fois au même sujet.
 */
export const GENRES_GLOBAUX: GenreAbonnement[] = ["tournois-fr", "regles"];

export const LIBELLES_ABONNEMENT: Record<GenreAbonnement, string> = {
  legende: "Nouvelles listes pour cette Légende",
  deck: "Nouvelles versions de ce deck",
  "tournois-fr": "Nouveaux tournois français",
  regles: "Changements de règles et d’interdictions",
};

const GENRES: GenreAbonnement[] = ["legende", "deck", "tournois-fr", "regles"];

/** Vrai si le couple genre/cible est demandable. Sert de garde à l'API. */
export function sujetValide(genre: string, cible: string): genre is GenreAbonnement {
  if (!GENRES.includes(genre as GenreAbonnement)) return false;
  const global = GENRES_GLOBAUX.includes(genre as GenreAbonnement);
  // Un abonnement global avec une cible, ou un abonnement ciblé sans cible, sont
  // des demandes malformées : les accepter créerait des lignes que rien ne relit.
  if (global) return cible === "";
  return cible.trim().length > 0 && cible.length <= 200;
}

/** La clé d'un abonnement, pour comparer sans se soucier de la casse de la cible. */
export function cleAbonnement(genre: string, cible: string): string {
  return `${genre}|${cible.trim().toLowerCase()}`;
}

/** Vrai si la liste d'abonnements contient ce sujet. */
export function estAbonne(abonnements: SujetAbonnement[], genre: string, cible = ""): boolean {
  const cle = cleAbonnement(genre, cible);
  return abonnements.some((a) => cleAbonnement(a.genre, a.cible) === cle);
}
