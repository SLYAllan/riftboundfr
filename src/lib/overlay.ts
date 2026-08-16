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
  // `timerVisible` : le chrono n'a pas sa place partout, on doit pouvoir l'éteindre
  // sans perdre l'heure de fin qui tourne.
  event: { title: string; round: string; logoUrl?: string; endsAt?: string | null; timerVisible?: boolean };
  format: OverlayFormat;
  maxPoints: number;
  points: { a: number; b: number };
  players: [OverlayPlayer, OverlayPlayer];
  // Deux affiches de cartes, gauche (0) et droite (1). Chaque côté : sa decklist
  // collée (`lists`), les cartes décochées à ignorer dans la diapo (`ignored`), son
  // drapeau d'affichage (`visible`), rotation auto ou manuelle (`auto`) et la carte
  // courante en manuel (`index`). `seconds` = durée d'une carte en rotation auto.
  // Dès qu'une affiche est visible, le chrono et le logo se cachent (mode vitrine).
  cards: {
    lists: [string[], string[]];
    ignored: [string[], string[]];
    visible: [boolean, boolean];
    auto: [boolean, boolean];
    index: [number, number];
    seconds: number;
  };
}

function emptyPlayer(name: string): OverlayPlayer {
  return { name, legendId: null, legendName: "", championName: "", battlefields: [], gamesWon: 0, camEnabled: true, camUrl: "" };
}

export function defaultOverlayState(): OverlayStateData {
  return {
    event: { title: "Riftbound France", round: "", logoUrl: "", endsAt: null, timerVisible: true },
    format: "BO3",
    maxPoints: 8,
    points: { a: 0, b: 0 },
    players: [emptyPlayer("Joueur 1"), emptyPlayer("Joueur 2")],
    cards: { lists: [[], []], ignored: [[], []], visible: [false, false], auto: [false, false], index: [0, 0], seconds: 5 },
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
      ignored: (patch.cards?.ignored ?? base.cards?.ignored ?? [[], []]) as [string[], string[]],
      visible: (patch.cards?.visible ?? base.cards?.visible ?? [false, false]) as [boolean, boolean],
      auto: (patch.cards?.auto ?? base.cards?.auto ?? [false, false]) as [boolean, boolean],
      index: (patch.cards?.index ?? base.cards?.index ?? [0, 0]) as [number, number],
      seconds: patch.cards?.seconds ?? base.cards?.seconds ?? 5,
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
