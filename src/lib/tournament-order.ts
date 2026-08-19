const ORDRE_SETS = ["Vendetta", "Unleashed", "Spiritforged", "Origins"];

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
  return [...groupes].map(([set, membres]) => ({ set, tournois: membres.sort(comparerTournois) })).sort(
    (a, b) => {
      const rangA = ORDRE_SETS.indexOf(a.set);
      const rangB = ORDRE_SETS.indexOf(b.set);
      return (rangA < 0 ? ORDRE_SETS.length : rangA) - (rangB < 0 ? ORDRE_SETS.length : rangB);
    },
  );
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
