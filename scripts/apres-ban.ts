import { cartesInterdites, DATES_BANS } from "../src/lib/banned-cards";

/** La dernière annonce de `DATES_BANS`, en date ISO. */
export const DERNIER_BAN = DATES_BANS.map((b) => b.date).sort().at(-1)!;

/**
 * Les tournois dont les CARTES se comptent : ceux d'après le dernier ban (choix
 * d'Allan, 17 octobre 2026). Mêlées aux listes d'avant, plus nombreuses, elles
 * faisaient conseiller une carte bannie à douze fiches Légendes.
 *
 * Un tournoi daté après l'annonce n'entre que si AUCUNE de ses listes ne joue une
 * carte bannie : la Chine jouait encore Stacked Deck le 19 septembre, au lendemain
 * du ban. Un corpus sans tournoi d'après le ban (un ancien set) garde tout.
 */
export function tournoisApresBan(
  listes: Iterable<{ tournoi: string; date: string | undefined; cartes: string[] }>,
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
  return { retenus, ecartes, garder: (tournoi: string) => retenus.size === 0 || retenus.has(tournoi) };
}
