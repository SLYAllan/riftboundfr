export type OverlayFormat = "BO1" | "BO3" | "BO5";

/** Décor : avec cadres webcam, ou sans. */
export type OverlayLayout = "cams" | "nocam";

/**
 * Formats acceptés pour une image envoyée depuis un fichier. Lus des deux côtés : le
 * champ de fichier du tableau de bord et la route qui reçoit. Pas de SVG — servi sur
 * notre domaine, il peut porter du script.
 */
export const TYPES_IMAGE = ["image/png", "image/jpeg", "image/webp", "image/gif"];

/** Les images qu'un streamer peut fournir. Un décor par mode : les gabarits
 * n'ont pas les mêmes découpes, un seul fond pour tous tomberait à côté. */
export type GenreMedia = "logo" | "background" | "backgroundNocam" | "backgroundCompact";

/** Où vit l'adresse d'une image envoyée, dans `event`. Partagée par le tableau de
 * bord et par la route qui supprime : les deux doivent viser le même champ. */
export const CLE_URL_MEDIA: Record<GenreMedia, "logoUrl" | "backgroundUrl" | "backgroundNocamUrl" | "backgroundCompactUrl"> = {
  logo: "logoUrl",
  background: "backgroundUrl",
  backgroundNocam: "backgroundNocamUrl",
  backgroundCompact: "backgroundCompactUrl",
};

export function estGenreMedia(v: string): v is GenreMedia {
  return v === "logo" || v === "background" || v === "backgroundNocam" || v === "backgroundCompact";
}

/**
 * Côté le plus long après réduction dans le navigateur, et poids maximum accepté.
 * Le décor doit rester en 1920x1080 : il se pose au pixel près sur les découpes du
 * gabarit. Le logo, lui, s'affiche dans une case de 275x184.
 */
export const COTE_MAX_MEDIA: Record<GenreMedia, number> = { logo: 512, background: 1920, backgroundNocam: 1920, backgroundCompact: 1920 };

/**
 * Le vrai format d'une image, lu dans ses premiers octets.
 *
 * L'en-tête `Content-Type` d'un envoi est déclaré par celui qui envoie : il suffit
 * d'écrire `image/png` au-dessus de n'importe quoi. On ne garde donc en base que ce
 * qu'on a reconnu, et on le sert sous CE type-là, jamais sous le type annoncé.
 * Rend `null` si la signature n'est pas reconnue.
 */
export function typeReel(octets: Uint8Array): string | null {
  const a = (i: number) => octets[i];
  if (octets.length >= 8 && a(0) === 0x89 && a(1) === 0x50 && a(2) === 0x4e && a(3) === 0x47) return "image/png";
  if (octets.length >= 3 && a(0) === 0xff && a(1) === 0xd8 && a(2) === 0xff) return "image/jpeg";
  if (octets.length >= 4 && a(0) === 0x47 && a(1) === 0x49 && a(2) === 0x46 && a(3) === 0x38) return "image/gif";
  if (
    octets.length >= 12 &&
    a(0) === 0x52 && a(1) === 0x49 && a(2) === 0x46 && a(3) === 0x46 &&
    a(8) === 0x57 && a(9) === 0x45 && a(10) === 0x42 && a(11) === 0x50
  ) return "image/webp";
  return null;
}
export const TAILLE_MAX_MEDIA: Record<GenreMedia, number> = { logo: 512 * 1024, background: 3 * 1024 * 1024, backgroundNocam: 3 * 1024 * 1024, backgroundCompact: 3 * 1024 * 1024 };

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
  // tourne). En pause on gèle l'affichage ; reprendre repose un `endsAt`. Peut être
  // NÉGATIF quand le chrono a dépassé zéro : sinon mettre en pause une prolongation
  // la ramenait à 00:00.
  // `timerDepassement` : le chrono continue après zéro au lieu de s'y arrêter, et
  // compte le temps de dépassement, affiché en rouge avec un plus devant.
  // `timerMonte` : chrono qui monte. Il part de zéro, ne s'arrête jamais, et
  // s'affiche comme un temps écoulé ordinaire — ni plus, ni rouge : rien n'est
  // dépassé, on mesure. Sert aux rondes libres et aux pauses annoncées.
  // `layout` : quel décor. "cams" = celui d'origine, avec un cadre webcam par joueur.
  // "nocam" = le décor sans ces cadres, pour les locales qui n'ont qu'une caméra
  // plateau : la Légende occupe alors la grande case.
  // `backgroundUrl` / `backgroundNocamUrl` : décor fourni par le streamer, envoyé
  // depuis un fichier à partir du gabarit Photoshop. Un par mode, parce que les
  // découpes diffèrent. Vide = le décor du site pour ce mode.
  event: { title: string; round: string; logoUrl?: string; endsAt?: string | null; timerVisible?: boolean; pointsVisible?: boolean; paused?: number | null; timerDepassement?: boolean; timerMonte?: boolean; layout?: OverlayLayout; backgroundUrl?: string; backgroundNocamUrl?: string; backgroundCompactUrl?: string };
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
    event: { title: "Riftbound France", round: "", logoUrl: "", endsAt: null, timerVisible: true, pointsVisible: true, timerDepassement: false, timerMonte: false, layout: "cams", backgroundUrl: "", backgroundNocamUrl: "", backgroundCompactUrl: "" },
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

/**
 * Manches à gagner pour emporter le match. Lue par le tableau de bord et par le
 * compagnon : les deux bornaient le compteur de manches chacun de leur côté.
 */
export function manchesPourGagner(format: OverlayFormat): number {
  return format === "BO5" ? 3 : format === "BO3" ? 2 : 1;
}

/**
 * Secondes affichées par le chrono. `null` = pas de chrono lancé.
 *
 * En pause on rend le temps figé tel quel. Sinon on compte depuis `endsAt`. Sans
 * option on s'arrête à zéro ; avec le dépassement ou le chrono qui monte, on passe
 * en négatif et c'est l'affichage qui décide comment le montrer.
 */
export function secondesChrono(
  e: { endsAt?: string | null; paused?: number | null; timerDepassement?: boolean; timerMonte?: boolean },
  maintenant: number,
): number | null {
  const brut = e.paused != null
    ? Math.floor(e.paused)
    : e.endsAt ? Math.floor((new Date(e.endsAt).getTime() - maintenant) / 1000) : null;
  if (brut === null || Number.isNaN(brut)) return null;
  // Le chrono qui monte passe zéro par nature : sans lui laisser le négatif, il
  // resterait figé sur 00:00 dès la première seconde.
  return e.timerDepassement || e.timerMonte ? brut : Math.max(0, brut);
}

export function clampPoints(n: number, max: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(max, Math.round(n)));
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export type PatchOverlay = DeepPartial<OverlayStateData> & { players?: Array<Partial<OverlayPlayer>> };

/**
 * Deux patchs en un, le second l'emporte champ par champ.
 *
 * Le tableau de bord postait l'ÉTAT ENTIER. Le compagnon, lui, poste des patchs :
 * un score marqué au téléphone pendant que le streamer changeait un réglage depuis
 * une copie plus ancienne de l'état revenait en arrière à l'écran. Les deux
 * envoient maintenant des patchs, et la file d'envoi les empile avec cette
 * fonction quand plusieurs attendent leur tour.
 */
export function fusionnerPatchs(a: PatchOverlay, b: PatchOverlay): PatchOverlay {
  const sortie: PatchOverlay = { ...a, ...b };
  if (a.event || b.event) sortie.event = { ...a.event, ...b.event };
  if (a.points || b.points) sortie.points = { ...a.points, ...b.points };
  // `cards` porte des tableaux (listes, index) : on remplace, on ne concatène pas.
  if (a.cards || b.cards) sortie.cards = { ...a.cards, ...b.cards };
  if (a.players || b.players) {
    // Le cast tient à l'intersection du type : `players` y est à la fois un tuple
    // profond et un tableau de Partial, et TypeScript ne réconcilie pas les deux.
    sortie.players = [
      { ...a.players?.[0], ...b.players?.[0] },
      { ...a.players?.[1], ...b.players?.[1] },
    ] as PatchOverlay["players"];
  }
  return sortie;
}

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
    paused: typeof e.paused === "number" && Number.isFinite(e.paused) ? entier(e.paused, -86_400, 86_400, 0) : null,
    // Absent = faux : un état écrit avant ces options garde le chrono qui s'arrête.
    timerDepassement: e.timerDepassement === true,
    timerMonte: e.timerMonte === true,
    // Absent = décor d'origine : c'est ce que porte tout état écrit avant ce champ.
    layout: e.layout === "nocam" ? "nocam" : "cams",
    backgroundUrl: texte(e.backgroundUrl, URL_MAX),
    backgroundNocamUrl: texte(e.backgroundNocamUrl, URL_MAX),
    backgroundCompactUrl: texte(e.backgroundCompactUrl, URL_MAX),
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
    // Plancher à -1, pas 0 : -1 veut dire « aucune carte dans ce cadre ». C'est ce
    // qu'écrit le tableau de bord quand on reclique la carte à l'écran pour la retirer.
    index: [entier(index[0], -1, 9_999, 0), entier(index[1], -1, 9_999, 0)],
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

/**
 * Recale les adresses d'images sur un nouveau jeton.
 *
 * Les images envoyées sont servies SOUS le jeton (`/api/overlay/<jeton>/media/...`)
 * et leur adresse est gardée dans l'état. « Nouveau lien » changeait le jeton sans y
 * toucher : les adresses pointaient dans le vide, le logo et le décor disparaissaient
 * de l'habillage sans un mot, et il fallait les renvoyer un par un.
 */
export function recalerMedias(event: OverlayStateData["event"], ancien: string, nouveau: string): OverlayStateData["event"] {
  const prefixe = `/api/overlay/${ancien}/media/`;
  const sortie = { ...event };
  for (const cle of ["logoUrl", "backgroundUrl", "backgroundNocamUrl", "backgroundCompactUrl"] as const) {
    const v = sortie[cle];
    if (v && v.startsWith(prefixe)) sortie[cle] = `/api/overlay/${nouveau}/media/${v.slice(prefixe.length)}`;
  }
  return sortie;
}

/** Toile de l'habillage : tout y est posé au pixel, elle ne change jamais de taille. */
export const TOILE = { largeur: 1920, hauteur: 1080 };

/**
 * De combien réduire (ou agrandir) la toile pour tenir dans la source d'OBS.
 *
 * L'habillage est dessiné sur 1920x1080 fixes, ancrés en haut à gauche. Une source
 * navigateur réglée à autre chose (1600x900 est courant) laissait donc le décor
 * déborder à droite, et TOUT paraissait décalé vers la droite — la rangée de points
 * la première, puisqu'elle est la seule chose que l'œil compare au centre de l'écran.
 * On garde les proportions : le plus petit des deux rapports.
 */
export function echelleOverlay(largeur: number, hauteur: number): number {
  if (!(largeur > 0) || !(hauteur > 0)) return 1;
  return Math.min(largeur / TOILE.largeur, hauteur / TOILE.hauteur);
}

export function makeToken(): string {
  // Token public de l'overlay OBS : aléatoire cryptographique (isomorphe Node 18+/navigateur).
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
