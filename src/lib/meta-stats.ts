export interface TrancheMeta {
  legendName: string;
  tournament: string;
  set: string;
  count: number;
}

export interface FiltresMeta {
  tournoi: string;
  set: string;
}

export function calculerMeta(tranches: TrancheMeta[], filtres: FiltresMeta) {
  const selection = tranches.filter((tranche) => {
    if (filtres.tournoi !== "all" && tranche.tournament !== filtres.tournoi) return false;
    if (filtres.set !== "all" && tranche.set !== filtres.set) return false;
    return true;
  });

  const totalDecks = selection.reduce((total, tranche) => total + tranche.count, 0);
  const parLegende = new Map<string, number>();
  for (const tranche of selection) {
    parLegende.set(tranche.legendName, (parLegende.get(tranche.legendName) ?? 0) + tranche.count);
  }

  const legendes = [...parLegende].map(([legendName, deckCount]) => ({
    legendName,
    deckCount,
    popularity: totalDecks ? Math.round((deckCount / totalDecks) * 1000) / 10 : 0,
  }));
  legendes.sort((a, b) => b.deckCount - a.deckCount || a.legendName.localeCompare(b.legendName));

  return { totalDecks, legendes };
}
