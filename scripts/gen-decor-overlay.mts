/**
 * Tire de `src/lib/overlay-decor.ts` les images de l'overlay. À lancer par
 * `npm run gen:decor`, qui enchaîne avec les gabarits Photoshop.
 *
 * Écrit `public/stream/decor.webp`, `decor_compact.webp`, `decor_chrono.webp` et les deux
 * cadres de cartes du complet (`cadre_cartes_*.webp`, tirés des dessins d'Allan), plus les
 * calques en PNG que lit `gen-gabarit-psd.py`, dans `node_modules/.cache/decor-overlay/`
 * (cadres de cartes compris, posés là où l'overlay les pose),
 * puis, rappelé avec `--empreinte` après les gabarits, l'empreinte du dessin que relit
 * `overlay-decor.test.ts`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { placementCartes, sourcesDecor, svgCadres, svgCadresCompact, svgChrono, svgDecor, svgDecorCompact, svgFond, svgFondCompact, svgMasqueFond, svgMasqueFondCompact } from "../src/lib/overlay-decor";
import { empreinteDecor } from "../src/lib/overlay-decor-empreinte";

const STREAM = "public/stream";
const CALQUES = "node_modules/.cache/decor-overlay";
mkdirSync(CALQUES, { recursive: true });

// L'empreinte s'écrit en DERNIER : `npm run gen:decor` rappelle ce script avec
// `--empreinte` une fois les gabarits Photoshop refaits. Écrite dès la première étape,
// elle passait le test au vert alors que l'étape Photoshop avait échoué, faute de
// `psd-tools` : les gabarits restaient ceux d'avant, et rien ne le disait.
if (process.argv.includes("--empreinte")) {
  writeFileSync("src/lib/overlay-decor.empreinte.json", `${JSON.stringify({ sha256: empreinteDecor() })}\n`);
  console.log("src/lib/overlay-decor.empreinte.json");
  process.exit(0);
}

const image = (svg: string) => sharp(Buffer.from(svg)).resize(1920, 1080);

for (const [nom, svg] of Object.entries(sourcesDecor())) {
  await image(svg).webp({ lossless: true }).toFile(`${STREAM}/${nom}.webp`);
  console.log(`${STREAM}/${nom}.webp`);
}
for (const [nom, svg] of [["fond", svgFond()], ["masque", svgMasqueFond()], ["cadres", svgCadres()], ["decor", svgDecor()], ["fond_compact", svgFondCompact()], ["masque_compact", svgMasqueFondCompact()], ["cadres_compact", svgCadresCompact()], ["decor_compact", svgDecorCompact()], ["chrono", svgChrono()]] as const) {
  await image(svg).png().toFile(`${CALQUES}/${nom}.png`);
}

/**
 * Un cadre de cartes à la place et à la taille où l'overlay le pose, en pleine toile.
 *
 * Le dessin d'Allan est un trait d'une seule couleur, à taille réelle. Agrandi par le
 * navigateur, il s'étalait : 2,6 px de trait devenaient 3,8 au lieu de 3,0, et Allan le
 * voyait flou. On agrandit donc sa FORME quatre fois trop grand, on la tranche net, puis
 * on la ramène à la taille voulue : les bords retrouvent une vraie marche (3,0 px
 * mesurés). À l'échelle 1, le dessin est déjà juste : on ne fait que le déplacer.
 */
async function cadreCartes(fichier: string, { e, dx, dy }: { e: number; dx: number; dy: number }): Promise<Buffer> {
  const source = `${STREAM}/${fichier}.webp`;
  const [l, h] = [Math.round(1920 * e), Math.round(1080 * e)];
  let calque = await sharp(source).ensureAlpha().png().toBuffer();
  if (e !== 1) {
    const forme = await sharp(source).ensureAlpha().extractChannel("alpha")
      .resize(l * 4, h * 4, { kernel: "cubic" }).threshold(128)
      .resize(l, h, { kernel: "linear" }).raw().toBuffer();
    const { data } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const plein = data.findIndex((v, i) => i % 4 === 3 && v === 255);
    if (plein < 0) throw new Error(`${source} : aucun pixel plein, impossible d'en lire la couleur`);
    const couleur = { r: data[plein - 3], g: data[plein - 2], b: data[plein - 1] };
    calque = await sharp({ create: { width: l, height: h, channels: 3, background: couleur } })
      .joinChannel(forme, { raw: { width: l, height: h, channels: 1 } }).png().toBuffer();
  }
  // sharp refuse de composer une image plus grande que la toile : on découpe d'abord
  // la partie du calque qui tombe dans l'écran.
  const [gauche, haut] = [Math.max(0, -dx), Math.max(0, -dy)];
  const [x, y] = [Math.max(0, dx), Math.max(0, dy)];
  const morceau = await sharp(calque)
    .extract({ left: gauche, top: haut, width: Math.min(l - gauche, 1920 - x), height: Math.min(h - haut, 1080 - y) })
    .png().toBuffer();
  return sharp({ create: { width: 1920, height: 1080, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: morceau, left: x, top: y }]).png().toBuffer();
}

// Les gabarits montrent ces cadres en repère, là où l'overlay les pose (`placementCartes`).
// Le complet affiche en plus le sien : `cadre_cartes_gauche.webp`, `cadre_cartes_droite.webp`.
for (const compact of [false, true]) {
  for (const [cote, fichier] of [["left", "cartes_gauche"], ["right", "cartes_droite"]] as const) {
    const cadre = await cadreCartes(fichier, placementCartes(cote, compact));
    await sharp(cadre).toFile(`${CALQUES}/${fichier}${compact ? "_compact" : ""}.png`);
    if (!compact) {
      await sharp(cadre).webp({ lossless: true }).toFile(`${STREAM}/cadre_${fichier}.webp`);
      console.log(`${STREAM}/cadre_${fichier}.webp`);
    }
  }
}
