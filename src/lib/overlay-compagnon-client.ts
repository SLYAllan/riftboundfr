import { manchesPourGagner, type OverlayStateData, type PatchOverlay } from "./overlay";

export type PatchCompagnon = PatchOverlay;

// Le tableau de bord empile lui aussi des patchs depuis qu'il a cessé de poster
// l'état entier. La fusion vit donc dans `overlay.ts`, avec le reste de la forme
// de l'état, et n'existe qu'une fois.
export { fusionnerPatchs } from "./overlay";

export interface MemoireManche {
  points: OverlayStateData["points"];
  manches: [number, number];
}

export function bornerEtape(etape: number): 0 | 1 | 2 {
  return Math.max(0, Math.min(2, etape)) as 0 | 1 | 2;
}

export function memoriserManche(state: OverlayStateData): MemoireManche {
  return {
    points: { ...state.points },
    manches: [state.players[0].gamesWon, state.players[1].gamesWon],
  };
}

export function patchPourRestaurerManche(memoire: MemoireManche): PatchCompagnon {
  return {
    points: { ...memoire.points },
    players: [{ gamesWon: memoire.manches[0] }, { gamesWon: memoire.manches[1] }],
  } as PatchCompagnon;
}

export function resultatFinDeManche(state: OverlayStateData, gagnant: 0 | 1): { patch: PatchCompagnon; matchTermine: boolean } {
  const manchesMax = manchesPourGagner(state.format);
  const manches = Math.min(state.players[gagnant].gamesWon + 1, manchesMax);
  return {
    patch: {
      points: { a: 0, b: 0 },
      players: gagnant === 0 ? [{ gamesWon: manches }, {}] : [{}, { gamesWon: manches }],
    } as PatchCompagnon,
    matchTermine: manches === manchesMax,
  };
}

export function patchPourNouveauMatch(state: OverlayStateData): PatchCompagnon {
  return {
    format: state.format,
    maxPoints: state.maxPoints,
    points: { a: 0, b: 0 },
    players: state.players.map((joueur) => ({
      name: joueur.name,
      legendId: joueur.legendId,
      legendName: joueur.legendName,
      championName: joueur.championName,
      battlefields: [...joueur.battlefields],
      gamesWon: 0,
    })) as OverlayStateData["players"],
    cards: { lists: [[], []], ignored: [[], []], mode: "none", auto: false, index: [0, 0] },
  } as PatchCompagnon;
}
