// Rattacher un article à un tournoi.
//
// La page /tournois/[slug] ne comparait que la ville. Or une ville reçoit
// plusieurs tournois : l'article « Best of Tianjin » du Regional Open du 7 juin
// s'est retrouvé sur la page du City Challenge du 16 août, à qui il donnait sa
// date et ses 640 joueurs. La ville ne suffit pas, il faut aussi la date.

/** Trois jours : un tournoi peut tenir sur deux jours, et l'article être daté du second. */
const ECART_MAX_MS = 3 * 24 * 60 * 60 * 1000;

export interface ArticleTournoi {
  tournamentLocation: string | null;
  tournamentDate: Date | null;
}

/**
 * Vrai si l'article parle bien de ce tournoi.
 *
 * `villeTournoi` vient des drapeaux (ou du contexte à défaut), `dateTournoi` de
 * la même source. Un article sans date reste rattaché à sa ville : trois vieux
 * best-of (Hartford, Vancouver, Utrecht) n'en portent pas, et les exclure ferait
 * disparaître leur lien de la page.
 */
export function articleDuTournoi(
  article: ArticleTournoi,
  villeTournoi: string,
  dateTournoi: Date | null,
): boolean {
  const villeArticle = article.tournamentLocation?.split(",")[0]?.trim().toLowerCase() ?? "";
  if (!villeArticle || !villeTournoi.toLowerCase().includes(villeArticle)) return false;
  if (!article.tournamentDate || !dateTournoi) return true;
  return Math.abs(article.tournamentDate.getTime() - dateTournoi.getTime()) <= ECART_MAX_MS;
}
