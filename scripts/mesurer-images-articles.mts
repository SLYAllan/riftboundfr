// Mesure les images d'articles servies depuis public/, une fois pour toutes.
//
// Le rendu posait un <img> sans dimensions : le navigateur ne peut pas réserver
// la place avant d'avoir téléchargé l'image, donc le texte sautait sous elle à
// chaque chargement d'article. On ne peut pas lire le fichier au rendu — le
// composant est côté navigateur — d'où ce relevé, écrit dans le dépôt.
//
// Usage : npx tsx scripts/mesurer-images-articles.mts
import { readdirSync, writeFileSync, statSync } from "fs";
import { join } from "path";
import sharp from "sharp";

const DOSSIERS = ["img/articles"];
const SORTIE = join(process.cwd(), "data", "images-articles.json");

const mesures: Record<string, [number, number]> = {};

for (const dossier of DOSSIERS) {
  const chemin = join(process.cwd(), "public", dossier);
  let fichiers: string[];
  try {
    fichiers = readdirSync(chemin);
  } catch {
    console.log(`(${dossier} absent, ignoré)`);
    continue;
  }
  for (const fichier of fichiers) {
    if (!statSync(join(chemin, fichier)).isFile()) continue;
    try {
      const { width, height } = await sharp(join(chemin, fichier)).metadata();
      if (width && height) mesures[`/${dossier}/${fichier}`] = [width, height];
    } catch (cause) {
      console.error(`illisible : ${dossier}/${fichier}`, cause instanceof Error ? cause.message : cause);
    }
  }
}

const triees = Object.fromEntries(Object.entries(mesures).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(SORTIE, JSON.stringify(triees, null, 1) + "\n", "utf-8");
console.log(`${Object.keys(triees).length} images mesurées -> ${SORTIE}`);
