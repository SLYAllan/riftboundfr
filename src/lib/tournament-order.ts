/**
 * Les sets de tournoi, du plus récent au plus ancien. Le premier est le set en
 * cours : l'accueil, /decks, /meta et les fiches Légendes s'ouvrent dessus. Il
 * était écrit en dur à huit endroits, et passer à Radiance obligeait à tous les
 * retrouver.
 */
export const ORDRE_SETS = ["Radiance", "Vendetta", "Unleashed", "Spiritforged", "Origins"] as const;
export const SET_EN_COURS: string = ORDRE_SETS[0];

/** Rang d'un set dans `ORDRE_SETS` ; un set inconnu passe après tous les autres. */
export function rangSet(set: string | null): number {
  const rang = set ? (ORDRE_SETS as readonly string[]).indexOf(set) : -1;
  return rang < 0 ? ORDRE_SETS.length : rang;
}

interface TournoiOrdonne {
  slug: string;
  name: string;
  set: string | null;
  tier: "S" | "A";
  date: string | null;
}

function comparerTournois(a: TournoiOrdonne, b: TournoiOrdonne) {
  if (a.tier !== b.tier) return a.tier === "S" ? -1 : 1;
  const ecartDate = (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0);
  return ecartDate || a.name.localeCompare(b.name, "fr") || a.slug.localeCompare(b.slug, "fr");
}

export function grouperTournoisParSet<T extends TournoiOrdonne>(tournois: T[]) {
  const groupes = Map.groupBy(tournois, (tournoi) => tournoi.set ?? "Autres");
  return [...groupes]
    .map(([set, membres]) => ({ set, tournois: membres.sort(comparerTournois) }))
    .sort((a, b) => rangSet(a.set) - rangSet(b.set));
}

export function voisinsDuTournoi<T extends TournoiOrdonne>(tournois: T[], slug: string) {
  const courant = tournois.find((tournoi) => tournoi.slug === slug);
  if (!courant) return { precedent: null, suivant: null };
  const memeSet = tournois
    .filter((tournoi) => tournoi.set === courant.set)
    .sort((a, b) => {
      const ecartDate = (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0);
      return ecartDate || a.name.localeCompare(b.name, "fr") || a.slug.localeCompare(b.slug, "fr");
    });
  const index = memeSet.findIndex((tournoi) => tournoi.slug === slug);
  return { precedent: memeSet[index + 1] ?? null, suivant: memeSet[index - 1] ?? null };
}
