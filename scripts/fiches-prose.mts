/**
 * Applique la prose relue de `data/fiches-prose.json` aux fiches Légendes.
 *
 * Les fiches décrivaient Déchaînement dans un français plein d'anglicismes, et
 * citaient les cartes par leur code. Le texte de remplacement est écrit à la
 * main, à partir des decklists Vendetta et du texte réel des cartes ; ce script
 * ne fait que le poser au bon endroit, sans toucher aux sections chiffrées.
 *
 *   npx tsx scripts/fiches-prose.mts [--ecrire]
 */
import { promises as fs } from "fs";
import path from "path";

const FICHES = path.join(process.cwd(), "data", "fiches");
const ecrire = process.argv.includes("--ecrire");
const prose: Record<string, Record<string, unknown>> = JSON.parse(
  await fs.readFile(path.join(process.cwd(), "data", "fiches-prose.json"), "utf-8"),
);

let n = 0;
for (const [fichier, champs] of Object.entries(prose)) {
  if (fichier.startsWith("_")) continue;
  const p = path.join(FICHES, fichier);
  const fiche = JSON.parse(await fs.readFile(p, "utf-8"));
  const avant = JSON.stringify(fiche);
  // null = on retire le champ : pour une Légende sortie du format, un plan de jeu
  // hérité de Déchaînement vaut moins que pas de plan du tout.
  for (const [k, v] of Object.entries(champs)) {
    if (v === null) delete fiche[k];
    else fiche[k] = v;
  }
  if (JSON.stringify(fiche) === avant) {
    console.log(`  ${fichier} : déjà à jour`);
    continue;
  }
  n++;
  console.log(`  ${fichier} : ${Object.keys(champs).join(", ")}`);
  if (ecrire) await fs.writeFile(p, JSON.stringify(fiche, null, 2) + "\n", "utf-8");
}
console.log(`\n${n} fiches${ecrire ? " réécrites" : " à réécrire (essai à blanc)"}`);
