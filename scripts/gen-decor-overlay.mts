/**
 * Tire de `src/lib/overlay-decor.ts` les images de l'overlay. À lancer par
 * `npm run gen:decor`, qui enchaîne avec les gabarits Photoshop.
 *
 * Écrit `public/stream/decor.webp`, `decor_compact.webp` et `decor_chrono.webp`, plus les
 * calques en PNG que lit `gen-gabarit-psd.py`, dans `node_modules/.cache/decor-overlay/`
 * (cadres de cartes compris, posés là où l'overlay les pose),
 * puis l'empreinte du dessin, que relit `overlay-decor.test.ts`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { placementCartes, sourcesDecor, svgCadres, svgCadresCompact, svgChrono, svgDecor, svgDecorCompact, svgFond, svgFondCompact, svgMasqueFond, svgMasqueFondCompact } from "../src/lib/overlay-decor";
import { empreinteDecor } from "../src/lib/overlay-decor-empreinte";

const STREAM = "public/stream";
const CALQUES = "node_modules/.cache/decor-overlay";
mkdirSync(CALQUES, { recursive: true });

const image = (svg: string) => sharp(Buffer.from(svg)).resize(1920, 1080);

for (const [nom, svg] of Object.entries(sourcesDecor())) {
  await image(svg).webp({ lossless: true }).toFile(`${STREAM}/${nom}.webp`);
  console.log(`${STREAM}/${nom}.webp`);
}
writeFileSync("src/lib/overlay-decor.empreinte.json", `${JSON.stringify({ sha256: empreinteDecor() })}\n`);
for (const [nom, svg] of [["fond", svgFond()], ["masque", svgMasqueFond()], ["cadres", svgCadres()], ["decor", svgDecor()], ["fond_compact", svgFondCompact()], ["masque_compact", svgMasqueFondCompact()], ["cadres_compact", svgCadresCompact()], ["decor_compact", svgDecorCompact()], ["chrono", svgChrono()]] as const) {
  await image(svg).png().toFile(`${CALQUES}/${nom}.png`);
}

// Les cadres de cartes tels que l'overlay les pose : agrandis et décalés par
// `placementCartes`. Le gabarit les montrait à leur place d'origine, jusqu'à 27 px à côté.
for (const compact of [false, true]) {
  for (const [cote, fichier] of [["left", "cartes_gauche"], ["right", "cartes_droite"]] as const) {
    const { e, dx, dy } = placementCartes(cote, compact);
    const [l, h] = [Math.round(1920 * e), Math.round(1080 * e)];
    // sharp refuse de composer une image plus grande que la toile : on découpe d'abord
    // la partie du calque agrandi qui tombe dans l'écran.
    const [gauche, haut] = [Math.max(0, -dx), Math.max(0, -dy)];
    const [x, y] = [Math.max(0, dx), Math.max(0, dy)];
    const morceau = await sharp(`${STREAM}/${fichier}.webp`)
      .resize(l, h, { kernel: "lanczos3" })
      .extract({ left: gauche, top: haut, width: Math.min(l - gauche, 1920 - x), height: Math.min(h - haut, 1080 - y) })
      .png()
      .toBuffer();
    await sharp({ create: { width: 1920, height: 1080, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: morceau, left: x, top: y }])
      .png()
      .toFile(`${CALQUES}/${fichier}${compact ? "_compact" : ""}.png`);
  }
}
