export type OverlayFormat = "BO1" | "BO3" | "BO5";

export interface OverlayPlayer {
  name: string;
  legendId: string | null;
  legendName: string;
  championName: string;
  battlefields: string[];
  gamesWon: number;
  camEnabled: boolean;
}

export interface OverlayStateData {
  event: { title: string; round: string };
  format: OverlayFormat;
  maxPoints: number;
  points: { a: number; b: number };
  players: [OverlayPlayer, OverlayPlayer];
}

function emptyPlayer(name: string): OverlayPlayer {
  return { name, legendId: null, legendName: "", championName: "", battlefields: [], gamesWon: 0, camEnabled: true };
}

export function defaultOverlayState(): OverlayStateData {
  return {
    event: { title: "Riftbound France", round: "" },
    format: "BO3",
    maxPoints: 8,
    points: { a: 0, b: 0 },
    players: [emptyPlayer("Joueur 1"), emptyPlayer("Joueur 2")],
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
