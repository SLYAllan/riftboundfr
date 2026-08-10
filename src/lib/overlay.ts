export type OverlayFormat = "BO1" | "BO3" | "BO5";

export interface OverlayPlayer {
  name: string;
  legendId: string | null;
  legendName: string;
  championName: string;
  battlefields: string[];
  gamesWon: number;
  camEnabled: boolean;
  // Lien « view » VDO.Ninja : chacun colle le sien, la camera arrive dans le cadre
  // sans passer par OBS. Vide = cadre laisse transparent.
  camUrl?: string;
}

export interface OverlayStateData {
  // `logoUrl` : logo de la compétition, vide par défaut (emplacement réservé).
  // `endsAt` : instant de fin du chrono, en ISO. Le décompte se calcule à l'affichage,
  // sinon il faudrait pousser une mise à jour chaque seconde.
  event: { title: string; round: string; logoUrl?: string; endsAt?: string | null };
  format: OverlayFormat;
  maxPoints: number;
  points: { a: number; b: number };
  players: [OverlayPlayer, OverlayPlayer];
  // Deux decklists chargees depuis le tableau de bord, et la carte montree a droite.
  cards: { lists: [string[], string[]]; shown: string | null };
}

function emptyPlayer(name: string): OverlayPlayer {
  return { name, legendId: null, legendName: "", championName: "", battlefields: [], gamesWon: 0, camEnabled: true, camUrl: "" };
}

export function defaultOverlayState(): OverlayStateData {
  return {
    event: { title: "Riftbound France", round: "", logoUrl: "", endsAt: null },
    format: "BO3",
    maxPoints: 8,
    points: { a: 0, b: 0 },
    players: [emptyPlayer("Joueur 1"), emptyPlayer("Joueur 2")],
    cards: { lists: [[], []], shown: null },
  };
}

export function clampPoints(n: number, max: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(max, Math.round(n)));
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export function applyStateUpdate(base: OverlayStateData, patch: DeepPartial<OverlayStateData> & { players?: Array<Partial<OverlayPlayer>> }): OverlayStateData {
  const next: OverlayStateData = {
    ...base,
    ...patch,
    event: { ...base.event, ...(patch.event ?? {}) },
    points: { ...base.points, ...(patch.points ?? {}) },
    cards: {
      lists: (patch.cards?.lists ?? base.cards?.lists ?? [[], []]) as [string[], string[]],
      shown: patch.cards?.shown !== undefined ? (patch.cards.shown as string | null) : (base.cards?.shown ?? null),
    },
    players: [
      { ...base.players[0], ...(patch.players?.[0] ?? {}) },
      { ...base.players[1], ...(patch.players?.[1] ?? {}) },
    ] as [OverlayPlayer, OverlayPlayer],
  };
  const max = next.maxPoints === 9 ? 9 : 8;
  next.maxPoints = max;
  next.points = { a: clampPoints(next.points.a, max), b: clampPoints(next.points.b, max) };
  return next;
}

export function makeToken(): string {
  // Token public de l'overlay OBS : aléatoire cryptographique (isomorphe Node 18+/navigateur).
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
