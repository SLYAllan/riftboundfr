import { DATES_BANS } from "../src/lib/banned-cards";
import { interdictionsParDate } from "../src/lib/bans";
import { TOURNAMENTS } from "../src/lib/tournament-flags";

const AUJOURDHUI = new Date().toISOString().slice(0, 10);

/**
 * Le dernier ban EN VIGUEUR au jour donné, en date ISO. Une annonce qui prend effet
 * plus tard (13 novembre 2026 pour le 23) ne compte pas avant : jusque-là ses cartes
 * se jouent en tournoi, et les écarter tairait les cartes de toutes les fiches du
 * set en cours dix jours trop tôt.
 */
export const dernierBan = (jour: string) =>
  DATES_BANS.map((b) => b.effet ?? b.date).filter((d) => d <= jour).sort().at(-1)!;
export const DERNIER_BAN = dernierBan(AUJOURDHUI);

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
  jour: string = AUJOURDHUI,
) {
  const ban = dernierBan(jour);
  const tournois = new Map<string, { date: string | undefined; interdite: boolean }>();
  for (const l of listes) {
    const t = tournois.get(l.tournoi) ?? { date: l.date, interdite: false };
    if (interdictionsParDate(l.cartes, jour).some((g) => !g.aVenir)) t.interdite = true;
    tournois.set(l.tournoi, t);
  }
  const retenus = new Set<string>();
  const ecartes: string[] = [];
  for (const [nom, t] of tournois) {
    if (!t.date || t.date < ban) continue;
    if (t.interdite) ecartes.push(nom);
    else retenus.add(nom);
  }
  // Vendetta, devenu ancien avec Radiance, a joué après le ban du 18 septembre :
  // tout garder remettait Stacked Deck dans les fiches qui se replient sur lui.
  const depuisBan = !(ancienSet && retenus.size === 0 && ecartes.length === 0);
  return { retenus, ecartes, depuisBan, garder: (tournoi: string) => !depuisBan || retenus.has(tournoi) };
}
