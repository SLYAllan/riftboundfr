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

// Remise en forme de l'état.
//
// Le tableau de bord sauve l'état ENTIER. Un état écrit par une version plus
// ancienne (`cards.auto` en TABLEAU, pas de `mode`, champs disparus depuis) repartait
// tel quel : la validation le refuse alors en bloc, le serveur répond 400 et PLUS RIEN
// ne se sauve, sans un mot à l'écran. C'est la panne « aucun bouton ne réagit ».
// Tout ressort d'ici à la forme du jour, donc la première sauvegarde réussie répare
// l'état stocké. Les bornes recopient celles de `overlay-validation.ts` : ce qui sort
// d'ici doit toujours y passer.
const TEXTE_MAX = 120;
const URL_MAX = 2_048;
const CARTES_MAX = 80;

function texte(v: unknown, limite = TEXTE_MAX): string {
  return typeof v === "string" ? v.slice(0, limite) : "";
}

function entier(v: unknown, min: number, max: number, defaut: number): number {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.round(v) : defaut;
  return Math.max(min, Math.min(max, n));
}

function listeDeNoms(v: unknown, maximum: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((n) => typeof n === "string").slice(0, maximum).map((n) => texte(n));
}

function normaliserJoueur(v: unknown, nomParDefaut: string): OverlayPlayer {
  const p = (v ?? {}) as Record<string, unknown>;
  const joueur: OverlayPlayer = {
    name: typeof p.name === "string" ? texte(p.name) : nomParDefaut,
    legendId: typeof p.legendId === "string" ? texte(p.legendId) : null,
    legendName: texte(p.legendName),
    championName: texte(p.championName),
    battlefields: listeDeNoms(p.battlefields, 3),
    gamesWon: entier(p.gamesWon, 0, 5, 0),
    camUrl: texte(p.camUrl, URL_MAX),
    camBackground: p.camBackground === true,
  };
  // `camNonce` n'existe qu'une fois la caméra relancée. On l'omet plutôt que d'y poser
  // 0 : il sert de clé d'iframe, et le poser à chaque sauvegarde rechargerait le flux.
  if (p.camNonce !== undefined) joueur.camNonce = entier(p.camNonce, 0, 4e12, 0);
  return joueur;
}

function normaliserEvent(v: unknown): OverlayStateData["event"] {
  const e = (v ?? {}) as Record<string, unknown>;
  return {
    title: texte(e.title),
    round: texte(e.round),
    logoUrl: texte(e.logoUrl, URL_MAX),
    endsAt: typeof e.endsAt === "string" ? texte(e.endsAt) : null,
    // Absent = visible : c'est ce que voit un état d'avant ces deux interrupteurs.
    timerVisible: e.timerVisible !== false,
    pointsVisible: e.pointsVisible !== false,
    paused: typeof e.paused === "number" && Number.isFinite(e.paused) ? entier(e.paused, 0, 86_400, 0) : null,
  };
}

function normaliserCards(v: unknown): OverlayStateData["cards"] {
  const c = (v ?? {}) as Record<string, unknown>;
  const deuxListes = (x: unknown): [string[], string[]] => {
    const a = Array.isArray(x) ? x : [];
    return [listeDeNoms(a[0], CARTES_MAX), listeDeNoms(a[1], CARTES_MAX)];
  };
  const index = Array.isArray(c.index) ? c.index : [];
  return {
    lists: deuxListes(c.lists),
    ignored: deuxListes(c.ignored),
    mode: c.mode === "mixed" || c.mode === "split" ? c.mode : "none",
    // `=== true` et pas `?? false` : une version plus ancienne stockait `auto` en
    // tableau, et un tableau vaut vrai. Il repartait alors dans la sauvegarde, où la
    // validation l'a toujours refusé.
    auto: c.auto === true,
    index: [entier(index[0], 0, 9_999, 0), entier(index[1], 0, 9_999, 0)],
    seconds: entier(c.seconds, 1, 60, 5),
  };
}

export function applyStateUpdate(base: OverlayStateData, patch: DeepPartial<OverlayStateData> & { players?: Array<Partial<OverlayPlayer>> }): OverlayStateData {
  const format = patch.format ?? base?.format;
  const max = entier(patch.maxPoints ?? base?.maxPoints, 8, 10, 8);
  const points = { ...base?.points, ...(patch.points ?? {}) };
  return {
    event: normaliserEvent({ ...base?.event, ...(patch.event ?? {}) }),
    format: format === "BO1" || format === "BO5" ? format : "BO3",
    maxPoints: max === 9 ? 9 : max === 10 ? 10 : 8,
    points: { a: clampPoints(entier(points.a, 0, 10, 0), max), b: clampPoints(entier(points.b, 0, 10, 0), max) },
    players: [
      normaliserJoueur({ ...base?.players?.[0], ...(patch.players?.[0] ?? {}) }, "Joueur 1"),
      normaliserJoueur({ ...base?.players?.[1], ...(patch.players?.[1] ?? {}) }, "Joueur 2"),
    ],
    cards: normaliserCards({
      lists: patch.cards?.lists ?? base?.cards?.lists,
      ignored: patch.cards?.ignored ?? base?.cards?.ignored,
      mode: patch.cards?.mode ?? base?.cards?.mode,
      auto: patch.cards?.auto ?? base?.cards?.auto,
      index: patch.cards?.index ?? base?.cards?.index,
      seconds: patch.cards?.seconds ?? base?.cards?.seconds,
    }),
  };
}

export function makeToken(): string {
  // Token public de l'overlay OBS : aléatoire cryptographique (isomorphe Node 18+/navigateur).
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
