export type OverlayFormat = "BO1" | "BO3" | "BO5";

export interface OverlayPlayer {
  name: string;
  legendId: string | null;
  legendName: string;
  championName: string;
  battlefields: string[];
  gamesWon: number;
  // Lien « view » VDO.Ninja : chacun colle le sien, la camera arrive dans le cadre
  // sans passer par OBS. Vide = cadre laisse transparent (une source OBS peut se
  // poser dessous).
  camUrl?: string;
  // Fond de webcam optionnel (image fournie) : à cocher pour ne pas laisser le cadre
  // vide quand on n'a pas de caméra. Le flux, s'il arrive, se pose par-dessus.
  camBackground?: boolean;
  // Change à chaque « Relancer » : l'overlay s'en sert comme clé d'iframe, ce qui
  // recharge le flux. Un VDO.Ninja figé ne repart pas tout seul, et la seule
  // parade était de retirer le lien puis de le recoller.
  camNonce?: number;
}

export interface OverlayStateData {
  // `logoUrl` : logo de la compétition, vide par défaut (emplacement réservé).
  // `endsAt` : instant de fin du chrono, en ISO. Le décompte se calcule à l'affichage,
  // sinon il faudrait pousser une mise à jour chaque seconde.
  // `timerVisible` : le chrono n'a pas sa place partout, on doit pouvoir l'éteindre
  // sans perdre l'heure de fin qui tourne.
  // `pointsVisible` : même chose pour la rangée de points. Une partie hors match
  // (démo, deck tech, pause) n'a pas de score à montrer, et on ne veut pas perdre
  // les points en cours pour autant.
  // `paused` : secondes restantes figées quand le chrono est en pause (null = il
  // tourne). En pause on gèle l'affichage ; reprendre repose un `endsAt`.
  event: { title: string; round: string; logoUrl?: string; endsAt?: string | null; timerVisible?: boolean; pointsVisible?: boolean; paused?: number | null };
  format: OverlayFormat;
  maxPoints: number;
  points: { a: number; b: number };
  players: [OverlayPlayer, OverlayPlayer];
  // Cartes à l'écran. `lists` porte une decklist par JOUEUR (0 = joueur 1, 1 = joueur
  // 2), pas par cadre. `mode` décide de l'affichage :
  //   - "none"  : rien ;
  //   - "mixed" : UN cadre, à droite, où défilent les cartes des deux decks mêlées
  //     (la gauche garde le chrono et le logo, elle a déjà les infos) ;
  //   - "split" : DEUX cadres, un par joueur (gauche = joueur 1, droite = joueur 2).
  // `auto` = diapo automatique ; en auto seulement, `ignored` retire des cartes du
  // défilé. En manuel on choisit la carte d'un clic (`index`, par cadre : gauche,
  // droite). `seconds` = durée d'une carte en diapo. Le chrono et le logo se cachent
  // seulement quand le cadre GAUCHE montre des cartes (mode "split").
  cards: {
    lists: [string[], string[]];
    ignored: [string[], string[]];
    mode: "none" | "mixed" | "split";
    auto: boolean;
    index: [number, number];
    seconds: number;
  };
}

function emptyPlayer(name: string): OverlayPlayer {
  return { name, legendId: null, legendName: "", championName: "", battlefields: [], gamesWon: 0, camUrl: "", camBackground: false };
}

export function defaultOverlayState(): OverlayStateData {
  return {
    event: { title: "Riftbound France", round: "", logoUrl: "", endsAt: null, timerVisible: true, pointsVisible: true },
    format: "BO3",
    maxPoints: 8,
    points: { a: 0, b: 0 },
    players: [emptyPlayer("Joueur 1"), emptyPlayer("Joueur 2")],
    cards: { lists: [[], []], ignored: [[], []], mode: "none", auto: false, index: [0, 0], seconds: 5 },
  };
}

// Deux decks mêlés en un seul défilé : on alterne une carte de chacun (joueur 1,
// joueur 2, joueur 1…) au lieu de coller les listes bout à bout, pour que les deux
// decks se voient dès les premières cartes. Servi par l'overlay et le tableau de bord.
export function entrelace(a: string[], b: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
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
      mode: (patch.cards?.mode ?? base.cards?.mode ?? "none") as OverlayStateData["cards"]["mode"],
      auto: patch.cards?.auto ?? base.cards?.auto ?? false,
      index: (patch.cards?.index ?? base.cards?.index ?? [0, 0]) as [number, number],
      seconds: patch.cards?.seconds ?? base.cards?.seconds ?? 5,
    },
    players: [
      { ...base.players[0], ...(patch.players?.[0] ?? {}) },
      { ...base.players[1], ...(patch.players?.[1] ?? {}) },
    ] as [OverlayPlayer, OverlayPlayer],
  };
  const max = next.maxPoints === 10 ? 10 : next.maxPoints === 9 ? 9 : 8;
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
