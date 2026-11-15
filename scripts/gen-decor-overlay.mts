/**
 * Tire de `src/lib/overlay-decor.ts` les images de l'overlay. À lancer par
 * `npm run gen:decor`, qui enchaîne avec les gabarits Photoshop.
 *
 * Écrit `public/stream/decor.webp`, `decor_compact.webp` et `Chrono.webp`, plus les
 * calques en PNG que lit `gen-gabarit-psd.py`, dans `node_modules/.cache/decor-overlay/`,
 * puis l'empreinte du dessin, que relit `overlay-decor.test.ts`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { sourcesDecor, svgCadres, svgCadresCompact, svgChrono, svgDecor, svgDecorCompact, svgFond, svgFondCompact, svgMasqueFond, svgMasqueFondCompact } from "../src/lib/overlay-decor";
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
