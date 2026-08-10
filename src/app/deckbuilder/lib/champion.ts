import type { DeckEntry } from "@/types";

function championIndex(mainDeck: DeckEntry[], legendName: string | undefined): number {
  if (!legendName) return -1;
  const firstName = legendName.split(",")[0].toLowerCase();
  return mainDeck.findIndex((e) => e.supertype === "Champion" && e.name.toLowerCase().startsWith(firstName));
}

export function findMatchingChampion(mainDeck: DeckEntry[], legendName: string | undefined): DeckEntry | undefined {
  const i = championIndex(mainDeck, legendName);
  return i === -1 ? undefined : mainDeck[i];
}

// Le champion élu est UNE carte. Les copies en plus sont des cartes ordinaires du deck
// principal : en les sortant du main avec lui, l'affichage annonçait « Champion (2) » et
// le deck principal perdait deux cartes. On n'en détache donc qu'un exemplaire.
//
// La décrémentation vise la ligne trouvée, pas toutes celles qui portent le même
// identifiant : une liste importée peut contenir deux lignes pour la même carte, et
// décrémenter les deux faisait disparaître un exemplaire.
export function splitChampion(main: DeckEntry[], legendName: string | undefined) {
  const i = championIndex(main, legendName);
  if (i === -1) return { champion: undefined, rest: main };
  const rest = main
    .map((e, idx) => (idx === i ? { ...e, quantity: e.quantity - 1 } : e))
    .filter((e) => e.quantity > 0);
  return { champion: { ...main[i], quantity: 1 }, rest };
}
