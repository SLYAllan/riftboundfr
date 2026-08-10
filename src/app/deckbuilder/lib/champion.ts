import type { DeckEntry } from "@/types";

export function findMatchingChampion(mainDeck: DeckEntry[], legendName: string | undefined): DeckEntry | undefined {
  if (!legendName) return undefined;
  const firstName = legendName.split(",")[0].toLowerCase();
  return mainDeck.find((e) => e.supertype === "Champion" && e.name.toLowerCase().startsWith(firstName));
}

// Le champion élu est UNE carte. Les copies en plus sont des cartes ordinaires du deck
// principal : en les sortant du main avec lui, l'affichage annonçait « Champion (2) » et
// le deck principal perdait deux cartes. On n'en détache donc qu'un exemplaire.
export function splitChampion(main: DeckEntry[], legendName: string | undefined) {
  const champion = findMatchingChampion(main, legendName);
  if (!champion) return { champion: undefined, rest: main };
  const rest = main
    .map((e) => (e.cardId === champion.cardId ? { ...e, quantity: e.quantity - 1 } : e))
    .filter((e) => e.quantity > 0);
  return { champion: { ...champion, quantity: 1 }, rest };
}
