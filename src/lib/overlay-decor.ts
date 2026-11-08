/**
 * Géométrie de l'overlay et dessin de ses décors. Tout vit ici pour une raison : les
 * découpes du décor et les cases que le code y pose doivent tomber au même pixel.
 * Quand le décor était une image exportée à part, chaque case se remesurait sur son
 * canal alpha, et une retouche du dessin décalait tout sans rien dire.
 *
 * Les mesures sont relevées sur la retransmission officielle, en 1920x1080. Tout est
 * écrit pour la colonne de gauche : la droite en est le miroir exact.
 *
 * `npm run gen:decor` tire de ce fichier les images de `public/stream/` et les deux
 * gabarits Photoshop. Le module ne fait que du calcul, le navigateur peut l'importer.
 */

export type Cote = "left" | "right";
export type Piece = "panneau" | "bas";

const LARGEUR = 1920;
const HAUTEUR = 1080;
const COLONNE = 356;

export const COULEURS_DECOR = {
  or: "#c8a55c",
  filet: "#b8ab7e",
  filetLarge: "#c0a868",
  fondHaut: "#162130",
  fondBas: "#141e2f",
  lueurBas: "#103d5c",
  arc: "#23344a",
  panneauClair: "#0d3f5b",
  panneauSombre: "#132b41",
  plaqueHaut: "#0f3652",
  plaqueBas: "#162d45",
  plaqueCentre: "#08192d",
  bordPlaque: "#2c5068",
  compartimentHaut: "#122b42",
  compartimentBas: "#15263a",
  filetPale: "#9a9c8c",
  socle: "#10202f",
  bandeTerrain: "#151d32",
  chronoHaut: "#d8a044",
  chronoBas: "#e2802f",
  filigrane: "#2d6a8e",
  dessusPanneau: "#3d5c6e",
  chevron: "#c8b88a",
  coeurLosange: "#7a5c20",
  bordChrono: "#e8c98a",
  separateur: "#a7c4cf",
} as const;

type Point = readonly [number, number];
const points = (pts: readonly Point[]) => pts.map(([x, y]) => `${x},${y}`).join(" ");

const HEX_PORTRAIT: readonly Point[] = [[28, 82], [90, 82], [125, 131], [90, 180], [28, 180], [18, 170], [18, 92]];
/** Le bout de la bannière : elle ne finit pas en pointe, un arc la creuse. */
const BOUT_BANNIERE = "L362 116L358.5 120Q352 131 358.5 142L362 146L320.5 187";
const TRAPEZE_TERRAIN: readonly Point[] = [[27, 527], [318, 527], [293, 591], [52, 591]];

/** Les cases que le code remplit, en coordonnées de la colonne de gauche. */
const CASES = {
  portrait: { x: 14, y: 72, l: 118, h: 118, piece: "panneau" },
  legende: { x: 156, y: 88, l: 196, h: 36, piece: "panneau" },
  champion: { x: 156, y: 142, l: 196, h: 36, piece: "panneau" },
  camera: { x: 26, y: 187, l: 293, h: 305, piece: "panneau" },
  pseudo: { x: 62, y: 487, l: 221, h: 30, piece: "bas" },
  classement: { x: 132, y: 523, l: 81, h: 19, piece: "bas" },
  terrainArt: { x: 27, y: 527, l: 291, h: 64, piece: "bas" },
  terrainNom: { x: 44, y: 549, l: 257, h: 22, piece: "bas" },
  manches: { x: 26, y: 604, l: 293, h: 28, piece: "bas" },
} as const;

export type NomCase = keyof typeof CASES;

/**
 * Le compact n'a pas de colonne : il pose le panneau et le bas de colonne l'un sous
 * l'autre dans le coin, réduits. Il part sur un téléphone, où chaque pixel de vidéo
 * compte.
 */
const COMPACT: Record<Piece, { e: number; dx: number; dy: number }> = {
  panneau: { e: 0.85, dx: 11.5, dy: -48.9 },
  bas: { e: 0.85, dx: 11.5, dy: -299.7 },
};

export function caseOverlay(nom: NomCase, cote: Cote, compact = false) {
  const c = CASES[nom];
  const t = compact ? COMPACT[c.piece] : { e: 1, dx: 0, dy: 0 };
  const largeur = c.l * t.e;
  const x = c.x * t.e + t.dx;
  return {
    left: cote === "left" ? x : LARGEUR - x - largeur,
    top: c.y * t.e + t.dy,
    width: largeur,
    height: c.h * t.e,
  };
}

/**
 * Découpe CSS du portrait et de l'illustration du champ de bataille, en pourcentage de
 * leur case. Sans elle, un décor sans fond pour cacher les coins montrait le rectangle
 * de l'image autour de l'hexagone et du trapèze.
 */
export function decoupeCss(nom: "portrait" | "terrainArt", cote: Cote): string {
  const c = CASES[nom];
  const pts = nom === "portrait" ? HEX_PORTRAIT : TRAPEZE_TERRAIN;
  const sommets = pts.map(([x, y]) => {
    const px = ((x - c.x) / c.l) * 100;
    return `${(cote === "left" ? px : 100 - px).toFixed(2)}% ${(((y - c.y) / c.h) * 100).toFixed(2)}%`;
  });
  return `polygon(${sommets.join(",")})`;
}

const defs = `<defs>
  <linearGradient id="panneau" gradientUnits="userSpaceOnUse" x1="98" x2="358"><stop offset="0" stop-color="${COULEURS_DECOR.panneauSombre}"/><stop offset="1" stop-color="${COULEURS_DECOR.panneauClair}"/></linearGradient>
  <linearGradient id="colonne" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COULEURS_DECOR.fondHaut}"/><stop offset="1" stop-color="${COULEURS_DECOR.fondBas}"/></linearGradient>
  <linearGradient id="lueur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COULEURS_DECOR.lueurBas}" stop-opacity="0"/><stop offset="1" stop-color="${COULEURS_DECOR.lueurBas}"/></linearGradient>
  <linearGradient id="chrono" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COULEURS_DECOR.chronoHaut}"/><stop offset="1" stop-color="${COULEURS_DECOR.chronoBas}"/></linearGradient>
  <linearGradient id="plaque" gradientUnits="userSpaceOnUse" x1="0" y1="482" x2="0" y2="522"><stop offset="0" stop-color="${COULEURS_DECOR.plaqueHaut}"/><stop offset="1" stop-color="${COULEURS_DECOR.plaqueBas}"/></linearGradient>
  <linearGradient id="plaque-centre" gradientUnits="userSpaceOnUse" x1="60" x2="285" y1="0" y2="0"><stop offset="0" stop-color="${COULEURS_DECOR.plaqueCentre}" stop-opacity="0"/><stop offset=".35" stop-color="${COULEURS_DECOR.plaqueCentre}" stop-opacity=".35"/><stop offset=".65" stop-color="${COULEURS_DECOR.plaqueCentre}" stop-opacity=".35"/><stop offset="1" stop-color="${COULEURS_DECOR.plaqueCentre}" stop-opacity="0"/></linearGradient>
  <linearGradient id="compartiment" gradientUnits="userSpaceOnUse" x1="0" y1="492" x2="0" y2="522"><stop offset="0" stop-color="${COULEURS_DECOR.compartimentHaut}"/><stop offset="1" stop-color="${COULEURS_DECOR.compartimentBas}"/></linearGradient>
  <mask id="sans-portrait" maskUnits="userSpaceOnUse" x="-20" y="0" width="420" height="260"><rect x="-20" y="0" width="420" height="260" fill="#fff"/><polygon points="${points(HEX_PORTRAIT)}" fill="#000"/></mask>
</defs>`;

const trait = (pts: readonly Point[], couleur: string = COULEURS_DECOR.or, ep = 1.5) =>
  `<polyline points="${points(pts)}" fill="none" stroke="${couleur}" stroke-width="${ep}"/>`;
const trace = (d: string, couleur: string, ep: number) => `<path d="${d}" fill="none" stroke="${couleur}" stroke-width="${ep}"/>`;

/** Panneau Légende + Champion : le portrait hexagonal et la bannière en flèche. */
function panneau(avecChevron = true): string {
  const { or, filigrane, dessusPanneau, chevron, coeurLosange, separateur, socle } = COULEURS_DECOR;
  return `<g mask="url(#sans-portrait)">
    <path d="M98 74H320.5${BOUT_BANNIERE}H98Z" fill="url(#panneau)"/>
    <path fill-rule="evenodd" fill="${filigrane}" opacity=".55" d="M113 79L129 73L146 79V103L129 123L113 103Z M129 81a5 5 0 1 0 .01 0Z M122 92H136L133 110L129 114L125 110Z"/>
    <path fill-rule="evenodd" fill="${filigrane}" opacity=".55" d="M112 152Q112 138 129 138Q147 138 147 152V168L136 184V166L129 171L122 166V184L112 168Z M117 153H141V158L129 162L117 158Z"/>
    <polygon points="25,75 98,74 134,131 98,187 24.5,187 11,173 11,89" fill="${socle}"/>
  </g>
  ${trace("M98 73.5H320.5", dessusPanneau, 1)}
  ${trace(`M320.5 74${BOUT_BANNIERE}`, or, 2.5)}
  ${trace("M24.5 186H321", or, 2.5)}
  ${trace("M98 74.5H25L11 89V117M11 144V173L24.5 187M98 74L134 131L98 187", or, 1.5)}
  <polygon points="${points(HEX_PORTRAIT)}" fill="none" stroke="${or}" stroke-width="1.5"/>
  ${trace("M327.5 83V90.5L354.5 117.5M327.5 179V171.5L354.5 144.5", separateur, 1)}
  ${avecChevron ? trace("M361.5 124.5L368 131L359 139.5", chevron, 1) : ""}
  ${trace("M156 131.5H353", separateur, 1)}
  <rect x="7.25" y="122.75" width="15.5" height="15.5" transform="rotate(45 15 130.5)" fill="${socle}" stroke="${or}" stroke-width="1.5"/>
  <rect x="10" y="125.5" width="10" height="10" transform="rotate(45 15 130.5)" fill="${coeurLosange}" stroke="${or}" stroke-width="1"/>`;
}

/** La colonne est symétrique autour de x = 172,5 : on dessine sa moitié gauche. */
const deuxBords = (moitie: string) => `${moitie}<g transform="translate(345 0) scale(-1 1)">${moitie}</g>`;

/**
 * Cadre doré de la caméra, à part de `bas` : le compact n'a pas de caméra. Le bas du
 * filet intérieur appartient à la caméra, et sa bande reste opaque sur la vidéo.
 */
function cadreCamera(): string {
  const { or, filetPale, fondBas } = COULEURS_DECOR;
  return deuxBords(`<polygon points="26,446 30.5,452 30.5,492 26,492" fill="${fondBas}"/>
  ${trait([[26, 187], [26, 492]], or, 2)}
  ${trait([[26, 446], [30.5, 452], [30.5, 492]], filetPale, 1)}`);
}

/** Plaque du pseudo, cadre et bande du champ de bataille, losange de jonction. */
function bas(): string {
  const { or, bordPlaque, filetPale, bandeTerrain, socle } = COULEURS_DECOR;
  const contourPlaque = "52.5,492 69.5,492 75.5,481.5 269.5,481.5 275.5,492 292.5,492 284.5,522 60.5,522";
  return `<polygon points="${contourPlaque}" fill="url(#plaque)"/>
  <polygon points="${contourPlaque}" fill="url(#plaque-centre)"/>
  ${trait([[69.5, 491.5], [75.5, 481.5], [269.5, 481.5], [275.5, 491.5]], bordPlaque, 1)}
  ${deuxBords(`<polygon points="31,492 52.5,492 60.5,522 31,522" fill="url(#compartiment)"/>
    ${trait([[52.5, 491.5], [69.5, 491.5]], bordPlaque, 1)}
    ${trait([[26, 491.5], [26, 527]], or, 2)}
    ${trait([[30.5, 491.5], [30.5, 522.5]], filetPale, 1)}
    ${trait([[26, 499.5], [30.5, 499.5]], filetPale, 1)}
    ${trait([[26, 491.5], [52.5, 491.5], [60.5, 521]])}
    ${trait([[30.5, 522.5], [81, 522.5], [82.5, 524.5]])}
    ${trait([[44, 523], [44, 527]], filetPale, 1)}
    ${trait([[61, 523], [61, 527]])}
    ${trait([[113, 524.5], [115, 522.5], [133, 522.5]])}`)}
  <polygon points="36,549 309,549 301,571 44,571" fill="${bandeTerrain}" opacity=".88"/>
  <polygon points="${points(TRAPEZE_TERRAIN)}" fill="none" stroke="${or}" stroke-width="2"/>
  ${trait([[58, 587], [287, 587]], or, 2)}
  <polygon points="172.5,582.75 180,591.25 172.5,599.75 165,591.25" fill="${socle}" stroke="${or}" stroke-width="1.5"/>
  <polygon points="172.5,587.25 176.5,591.25 172.5,595.25 168.5,591.25" fill="${or}"/>`;
}

const MIROIR = `translate(${LARGEUR} 0) scale(-1 1)`;
const deuxCotes = (dessin: string) => `<g>${dessin}</g><g transform="${MIROIR}">${dessin}</g>`;
const reduit = (piece: Piece, dessin: string) => {
  const t = COMPACT[piece];
  return `<g transform="translate(${t.dx} ${t.dy}) scale(${t.e})">${dessin}</g>`;
};

function svg(contenu: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR}" height="${HAUTEUR}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}">${defs}${contenu}</svg>`;
}

/** Ce qu'il y a dans la colonne, sans ses découpes : calque de fond du gabarit. */
function fondColonne(): string {
  const { arc, filet, filetLarge } = COULEURS_DECOR;
  const courbe = (d: string) => `<path d="${d}" fill="none" stroke="${arc}" stroke-width="1.5" opacity=".8"/>`;
  return `<rect width="${COLONNE}" height="${HAUTEUR}" fill="url(#colonne)"/>
  <rect y="1035" width="${COLONNE}" height="45" fill="url(#lueur)"/>
  ${courbe("M0 628C60 640 120 690 128 790C132 860 120 960 100 1040")}
  ${courbe("M190 640C260 690 330 800 345 960")}
  ${courbe("M0 378C12 376 22 378 30 382")}
  <rect x="346" width="2" height="${HAUTEUR}" fill="${filet}"/>
  <rect x="353" width="3" height="${HAUTEUR}" fill="${filetLarge}"/>`;
}

/**
 * Le socle du compact, dans le coin de l'écran. Sans lui les pièces flottaient sur la
 * vidéo : le panneau dépassait la plaque de 40 px, et l'image passait dans les encoches.
 * La pointe de la bannière et les manches tiennent dedans, rien ne dépasse.
 */
export const SOCLE_COMPACT = { l: 328, h: 249 };

function fondCompact(): string {
  const { filet, filetLarge } = COULEURS_DECOR;
  const { l, h } = SOCLE_COMPACT;
  return `<rect width="${l}" height="${h}" fill="url(#colonne)"/>
  ${trait([[l - 6, 0], [l - 6, h - 6], [0, h - 6]], filet, 1.7)}
  ${trait([[l - 1.25, 0], [l - 1.25, h - 1.25], [0, h - 1.25]], filetLarge, 2.5)}`;
}

/** Blanc = le fond se voit. Noir = on voit la vidéo ou ce que le code pose dessous. */
const hexagone = `<polygon points="${points(HEX_PORTRAIT)}" fill="#000"/>`;
const trapeze = `<polygon points="${points(TRAPEZE_TERRAIN)}" fill="#000"/>`;
const zoneComplet = () => `<rect width="${COLONNE}" height="${HAUTEUR}" fill="#fff"/>${hexagone}<rect x="26" y="187" width="293" height="305" fill="#000"/>${trapeze}`;
const zoneCompact = () => `<rect width="${SOCLE_COMPACT.l}" height="${SOCLE_COMPACT.h}" fill="#fff"/>${reduit("panneau", hexagone)}${reduit("bas", trapeze)}`;

const cadresComplet = () => cadreCamera() + panneau() + bas();
// Pas de chevron : il tombe au bord du socle, et rien ne doit le toucher.
const cadresCompact = () => reduit("panneau", panneau(false)) + reduit("bas", bas());

const masque = (zone: string) => svg(`<rect width="${LARGEUR}" height="${HAUTEUR}" fill="#000"/>${deuxCotes(zone)}`);
/** Le décor tel que l'overlay l'affiche : le fond découpé, les cadres dessus. */
const decor = (zone: string, fond: string, cadres: string) =>
  svg(`<mask id="colonnes" maskUnits="userSpaceOnUse" x="0" y="0" width="${LARGEUR}" height="${HAUTEUR}">${deuxCotes(zone)}</mask>
  <g mask="url(#colonnes)">${deuxCotes(fond)}</g>${deuxCotes(cadres)}`);

export const svgFond = () => svg(deuxCotes(fondColonne()));
export const svgMasqueFond = () => masque(zoneComplet());
export const svgCadres = () => svg(deuxCotes(cadresComplet()));
export const svgDecor = () => decor(zoneComplet(), fondColonne(), cadresComplet());

export const svgFondCompact = () => svg(deuxCotes(fondCompact()));
export const svgMasqueFondCompact = () => masque(zoneCompact());
export const svgCadresCompact = () => svg(deuxCotes(cadresCompact()));
export const svgDecorCompact = () => decor(zoneCompact(), fondCompact(), cadresCompact());

/** Case du chrono, à part du décor : elle s'éteint avec lui. */
export function svgChrono(): string {
  const { or, bordChrono } = COULEURS_DECOR;
  const repere = (x: number) => `<rect x="${x - 3}" y="989" width="6" height="6" transform="rotate(45 ${x} 992)" fill="${or}"/>
    <rect x="${x - 0.5}" y="968" width="1" height="14" fill="${or}"/><rect x="${x - 0.5}" y="1002" width="1" height="14" fill="${or}"/>`;
  return svg(`<rect x="98.5" y="968.5" width="149" height="50" fill="url(#chrono)" stroke="${bordChrono}" stroke-width="1"/>${repere(85)}${repere(261)}`);
}
