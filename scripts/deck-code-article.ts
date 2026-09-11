/**
 * Le code de deck tel qu'un bloc `decklist` d'article l'attend.
 *
 * Il vivait en double, dans `seed-barcelone-bestof.mts` et dans le script jumeau
 * de Singapour. Ce n'est pas le même que celui de `seed-tournament-decks.ts` :
 * là-bas le Champion est lié à part et ne doit PAS sortir dans le code, sinon
 * `parseDeckCode` le compte deux fois. Ici l'article affiche le deck entier,
 * Champion compris. Deux besoins, deux fonctions — mais une seule copie chacune.
 */
export type DeckJsonArticle = {
  champion: string | null;
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>;
  battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
};

export function buildDeckCode(d: DeckJsonArticle): string {
  const parts: string[] = [];
  if (d.champion) { parts.push("== Champion =="); parts.push(`1x ${d.champion}`); }
  parts.push("== Main Deck ==");
  for (const c of d.mainDeck) {
    if ((c.type ?? "").toLowerCase() === "champion") continue;
    parts.push(`${c.quantity}x ${c.name}`);
  }
  const runes = Object.entries(d.runes ?? {}).map(
    ([n, q]) => `${q}x ${n.endsWith(" Rune") ? n : n + " Rune"}`,
  );
  if (runes.length) { parts.push("== Runes =="); parts.push(...runes); }
  if (d.battlefields.length) {
    parts.push("== Battlefield ==");
    for (const b of d.battlefields) parts.push(`1x ${b}`);
  }
  const side = d.sideDeck ?? [];
  if (side.length) { parts.push("== Side Deck =="); for (const s of side) parts.push(`${s.quantity}x ${s.name}`); }
  return parts.join("\n");
}
