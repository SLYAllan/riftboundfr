/**
 * Remet `data/decklists-index.json` d'accord avec les fichiers sur le disque.
 *
 * L'index n'a pas de générateur : chaque parseur de tournoi y ajoute ses lignes.
 * Après un audit qui supprime ou renomme des decklists, il garde donc des chemins
 * morts, et le test `scripts/decklists-index.test.ts` passe au rouge.
 *
 * On garde l'ordre existant pour ne pas réécrire 18 000 lignes à chaque passe :
 * on retire les chemins sans fichier, puis on ajoute les fichiers absents.
 *
 * Un fichier dont l'`id` est déjà indexé n'est pas ajouté. Certaines listes
 * existent en double sur le disque, sous l'ancien et le nouveau nom de fichier
 * (`shanghai-cc-437-12-de.json` et `shanghai-cc-12--de.json`, même deck) : les
 * indexer deux fois compterait la même liste deux fois dans la couverture des
 * best-of.
 *
 *   npx tsx scripts/fix-decklists-index.ts
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RACINE = "data/decklists";
const INDEX = "data/decklists-index.json";

interface Entree {
  id: string;
  legend: string;
  player: string;
  placement: number | null;
  file: string;
}

function fichiersSurDisque(): string[] {
  const trouves: string[] = [];
  for (const dossier of readdirSync(RACINE)) {
    const chemin = join(RACINE, dossier);
    if (!statSync(chemin).isDirectory()) continue;
    for (const nom of readdirSync(chemin)) {
      if (nom.endsWith(".json")) trouves.push(`${dossier}/${nom}`);
    }
  }
  return trouves.sort();
}

function lireEntree(file: string): Entree {
  const deck = JSON.parse(readFileSync(join(RACINE, file), "utf8"));
  return {
    id: deck.id,
    legend: deck.legend,
    player: deck.player,
    placement: deck.placement ?? null,
    file,
  };
}

const index = JSON.parse(readFileSync(INDEX, "utf8")) as Entree[];
const surDisque = new Set(fichiersSurDisque());

const vus = new Set<string>();
const gardees = index.filter((e) => {
  if (!surDisque.has(e.file) || vus.has(e.file)) return false;
  vus.add(e.file);
  return true;
});

const ids = new Set(gardees.map((e) => e.id));
const ajoutees: Entree[] = [];
for (const file of [...surDisque].filter((f) => !vus.has(f))) {
  const entree = lireEntree(file);
  if (ids.has(entree.id)) continue;
  ids.add(entree.id);
  ajoutees.push(entree);
}
const resultat = [...gardees, ...ajoutees];

writeFileSync(INDEX, `${JSON.stringify(resultat, null, 2)}\n`);
console.log(
  `index: ${index.length} -> ${resultat.length} ` +
    `(${index.length - gardees.length} retirées, ${ajoutees.length} ajoutées)`,
);
