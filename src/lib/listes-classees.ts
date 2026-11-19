import { tournoisApresBan } from "./apres-ban";
import { BAN_ENTRIES } from "./bans";
import { DATES_BANS, cartesInterdites } from "./banned-cards";
import { rangPlacement } from "./card-play";
import type { Carte } from "./cardnexus";

/**
 * Une liste de tournoi classée, réduite à ce que lisent les pages « après le ban »
 * et « decks pas chers ». Le chargement est dans `listes-classees-serveur.ts` : ce
 * fichier-ci reste sans base, pour que ses règles se testent.
 */
export interface ListeClassee {
  slug: string;
  legende: string;
  joueur: string | null;
  placement: string;
  tournoi: string;
  date: string | undefined;
  joueurs: number | undefined;
  noms: string[];
  cartes: Carte[];
}

/**
 * Le dernier ban ANNONCÉ, même s'il n'est pas encore en vigueur : la page après-ban
 * parle de lui dès l'annonce. `effet` est le jour où ses cartes quittent le format.
 */
export function dernierBanAnnonce() {
  const dernier = DATES_BANS.at(-1)!;
  const jour = BAN_ENTRIES.at(-1)!.date;
  return {
    effet: dernier.effet ?? dernier.date,
    cartes: BAN_ENTRIES.filter((b) => b.date === jour).map((b) => b.en),
  };
}

/**
 * Les listes des tournois joués une fois le ban en vigueur, et sans aucune de ses
 * cartes. Avant le jour d'effet il n'y en a aucune : on lit la règle au jour d'effet,
 * sinon `tournoisApresBan` partait du ban précédent et rendait tout Radiance.
 */
export function listesApresBan<T extends ListeClassee>(listes: T[], effet: string, aujourdhui: string): T[] {
  const jour = aujourdhui > effet ? aujourdhui : effet;
  const { retenus } = tournoisApresBan(
    listes.map((l) => ({ tournoi: l.tournoi, date: l.date, cartes: l.noms })),
    false,
    jour,
  );
  return listes.filter((l) => retenus.has(l.tournoi));
}

export interface BilanLegende {
  legende: string;
  listes: number;
  /** Listes qui jouent au moins une des cartes visées. */
  touchees: number;
  /** La carte visée que ses listes jouent le plus, `null` si aucune. */
  carte: string | null;
}

/** Ce que le ban retire à chaque Légende, la plus jouée d'abord. */
export function bilanDuBan(listes: ListeClassee[], cartesVisees: string[]): BilanLegende[] {
  const visees = new Set(cartesVisees);
  const parLegende = new Map<string, { listes: number; touchees: number; compte: Map<string, number> }>();
  for (const l of listes) {
    const b = parLegende.get(l.legende) ?? { listes: 0, touchees: 0, compte: new Map<string, number>() };
    parLegende.set(l.legende, b);
    b.listes++;
    // Une carte jouée au principal ET en réserve fait deux lignes : on compte des listes.
    const presentes = [...new Set(l.noms)].filter((n) => visees.has(n));
    if (presentes.length > 0) b.touchees++;
    for (const n of presentes) b.compte.set(n, (b.compte.get(n) ?? 0) + 1);
  }
  return [...parLegende]
    .map(([legende, b]) => ({
      legende,
      listes: b.listes,
      touchees: b.touchees,
      carte: [...b.compte].sort((x, y) => y[1] - x[1])[0]?.[0] ?? null,
    }))
    .sort((a, b) => b.listes - a.listes || a.legende.localeCompare(b.legende));
}

/** « Assez méta » : une liste qui a fini dans les 16 premiers de son tournoi. */
export const RANG_MAX_PAS_CHER = 16;

/**
 * Pour chaque Légende, la liste la moins chère qui a fini dans les 16 premiers et
 * ne joue aucune carte interdite (annoncée comprise : elle doit rester jouable).
 * Une liste dont une carte n'a pas de prix est écartée : son total serait faux, et
 * c'est elle qui passerait en tête du classement.
 */
export function decksPasChers<T extends ListeClassee>(
  listes: T[],
  chiffrer: (cartes: Carte[]) => { total: number; exemplairesSansPrix: number },
): Array<{ liste: T; prix: number }> {
  const meilleure = new Map<string, { liste: T; prix: number }>();
  for (const l of listes) {
    if (rangPlacement(l.placement) > RANG_MAX_PAS_CHER) continue;
    if (cartesInterdites(l.noms).length > 0) continue;
    const { total, exemplairesSansPrix } = chiffrer(l.cartes);
    if (exemplairesSansPrix > 0 || total <= 0) continue;
    const deja = meilleure.get(l.legende);
    if (!deja || total < deja.prix) meilleure.set(l.legende, { liste: l, prix: total });
  }
  return [...meilleure.values()].sort((a, b) => a.prix - b.prix);
}
