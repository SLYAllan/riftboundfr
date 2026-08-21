import { applyStateUpdate, manchesPourGagner, type OverlayStateData } from "./overlay";

export type PatchCompagnon = Parameters<typeof applyStateUpdate>[1];

export interface MemoireManche {
  points: OverlayStateData["points"];
  manches: [number, number];
}

export function fusionnerPatchs(a: PatchCompagnon, b: PatchCompagnon): PatchCompagnon {
  const joueurs = a.players || b.players;
  return {
    ...a,
    ...b,
    event: a.event || b.event ? { ...a.event, ...b.event } : undefined,
    points: a.points || b.points ? { ...a.points, ...b.points } : undefined,
    players: joueurs
      ? [
          { ...a.players?.[0], ...b.players?.[0] },
          { ...a.players?.[1], ...b.players?.[1] },
        ]
      : undefined,
  } as PatchCompagnon;
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
