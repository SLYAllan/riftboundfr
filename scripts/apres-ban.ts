import { cartesInterdites, DATES_BANS } from "../src/lib/banned-cards";
import { TOURNAMENTS } from "../src/lib/tournament-flags";

/** La dernière annonce de `DATES_BANS`, en date ISO. */
export const DERNIER_BAN = DATES_BANS.map((b) => b.date).sort().at(-1)!;

/** Le set du tournoi le plus récent de `tournament-flags.ts`. */
export function setEnCours(): string {
  const datés = Object.values(TOURNAMENTS).filter((t) => t.date && t.set);
  const dernier = datés.reduce((a, b) => (b.date! > a.date! ? b : a));
  return dernier.set!;
}

/**
 * Les tournois dont les CARTES se comptent : ceux d'après le dernier ban (choix
 * d'Allan, 17 octobre 2026). Mêlées aux listes d'avant, plus nombreuses, elles
 * faisaient conseiller une carte bannie à douze fiches Légendes.
 *
 * Un tournoi daté après l'annonce n'entre que si AUCUNE de ses listes ne joue une
 * carte bannie : la Chine jouait encore Stacked Deck le 19 septembre, au lendemain
 * du ban.
 *
 * Un ancien set garde tout, à condition qu'aucun de ses tournois ne suive le ban.
 * Le set en cours ne garde que l'après-ban, même vide : au lendemain d'un ban,
 * avant tout tournoi importé, recompter tout le set ramenait la carte bannie dans
 * les fiches. `depuisBan` dit lequel des deux s'applique.
 */
export function tournoisApresBan(
  listes: Iterable<{ tournoi: string; date: string | undefined; cartes: string[] }>,
  ancienSet: boolean,
) {
  const tournois = new Map<string, { date: string | undefined; interdite: boolean }>();
  for (const l of listes) {
    const t = tournois.get(l.tournoi) ?? { date: l.date, interdite: false };
    if (cartesInterdites(l.cartes).length) t.interdite = true;
    tournois.set(l.tournoi, t);
  }
  const retenus = new Set<string>();
  const ecartes: string[] = [];
  for (const [nom, t] of tournois) {
    if (!t.date || t.date < DERNIER_BAN) continue;
    if (t.interdite) ecartes.push(nom);
    else retenus.add(nom);
  }
  // Vendetta, devenu ancien avec Radiance, a joué après le ban du 18 septembre :
  // tout garder remettait Stacked Deck dans les fiches qui se replient sur lui.
  const depuisBan = !(ancienSet && retenus.size === 0 && ecartes.length === 0);
  return { retenus, ecartes, depuisBan, garder: (tournoi: string) => !depuisBan || retenus.has(tournoi) };
}
