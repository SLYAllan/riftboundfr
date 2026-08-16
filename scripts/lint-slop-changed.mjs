// Porte anti-slop sur le code NEUF seulement : oxlint sur les .ts/.tsx modifiés
// par rapport à une base, jamais sur tout le dépôt. But : empêcher d'AJOUTER du
// slop sans exiger la migration des 414 findings existants.
//
//   node scripts/lint-slop-changed.mjs            # vs HEAD (changements en cours)
//   node scripts/lint-slop-changed.mjs origin/main # vs une branche (utile en CI)
import { execSync, spawnSync } from "node:child_process";

const base = process.argv[2] || "HEAD";

// Fichiers suivis modifiés vs base + nouveaux fichiers pas encore ajoutés :
// un fichier neuf non commité contient justement le slop qu'on veut attraper.
function lignes(cmd) {
  return execSync(cmd, { encoding: "utf8" }).split("\n").map((l) => l.trim()).filter(Boolean);
}

let fichiers;
try {
  fichiers = [
    ...lignes(`git diff --name-only --diff-filter=ACMR ${base}`),
    ...lignes("git ls-files --others --exclude-standard"),
  ];
} catch (e) {
  console.error("git a échoué :", e.message);
  process.exit(1);
}

const cibles = [...new Set(fichiers)].filter(
  (f) => /\.(ts|tsx)$/.test(f) && !f.startsWith("tools/"),
);

if (cibles.length === 0) {
  console.log("Aucun .ts/.tsx modifié — rien à vérifier.");
  process.exit(0);
}

console.log(`anti-slop sur ${cibles.length} fichier(s) modifié(s) :`);
const r = spawnSync("npx", ["oxlint", ...cibles], { stdio: "inherit", shell: true });
process.exit(r.status ?? 1);
