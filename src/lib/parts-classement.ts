import partsDeClassement from "../../data/tournaments/meta-parts.json";
import { legendFicheSlug } from "./legend-fiche";

// Les parts d'un set, comptées sur les joueurs CLASSÉS (`meta-parts.json`, écrit par
// `npm run maj:stats`), pas sur les listes publiées. L'accueil faisait ce compte dans
// sa page ; la fiche Légende en a besoin aussi (rang, part du champ, écart au format).
// Une seule fonction, pour que les deux pages ne donnent jamais deux chiffres à la
// même Légende.

export interface PartClassement {
  legendName: string;
  tournament: string;
  set: string;
  joueurs: number;
  coupe: number;
}

export interface LigneParts {
  slug: string;
  legendName: string;
  joueurs: number;
  /** Joueurs arrivés dans les 10 % de tête. */
  coupe: number;
  /** Rang par joueurs classés, 1 pour la plus jouée. */
  rang: number;
  /** Part des joueurs classés du set, de 0 à 1. */
  part: number;
  /** Part de ses joueurs arrivée dans les 10 % de tête, de 0 à 1. */
  conversion: number;
}

export function classerParts(parts: PartClassement[], set: string) {
  const parSlug = new Map<string, { slug: string; legendName: string; joueurs: number; coupe: number }>();
  const tournois = new Set<string>();
  for (const p of parts) {
    if (p.set !== set) continue;
    tournois.add(p.tournament);
    // Le slug réunit les écritures d'une même Légende (« Rek'sai » et « Rek'Sai »).
    const slug = legendFicheSlug(p.legendName);
    const l = parSlug.get(slug) ?? { slug, legendName: p.legendName, joueurs: 0, coupe: 0 };
    l.joueurs += p.joueurs;
    l.coupe += p.coupe;
    parSlug.set(slug, l);
  }
  const brutes = [...parSlug.values()].sort((a, b) => b.joueurs - a.joueurs);
  const total = brutes.reduce((n, l) => n + l.joueurs, 0);
  const coupeTotale = brutes.reduce((n, l) => n + l.coupe, 0);
  const lignes: LigneParts[] = brutes.map((l, i) => ({
    ...l,
    rang: i + 1,
    part: total ? l.joueurs / total : 0,
    conversion: l.joueurs ? l.coupe / l.joueurs : 0,
  }));
  return { lignes, total, tournois: tournois.size, conversionFormat: total ? coupeTotale / total : 0 };
}

export const partsDuSet = (set: string) => classerParts(partsDeClassement as PartClassement[], set);

/** Écart entre un taux et celui du format, en points : « +8,4 pts », « −2,5 pts ». */
export function ecartEnPoints(taux: number, reference: number, locale = "fr-FR"): string {
  const points = (taux - reference) * 100;
  return `${points >= 0 ? "+" : "−"}${Math.abs(points).toLocaleString(locale, { maximumFractionDigits: 1 })} pts`;
}
