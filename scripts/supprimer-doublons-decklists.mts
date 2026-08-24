/**
 * Supprime les decklists en double sur le disque.
 *
 *   npx tsx scripts/supprimer-doublons-decklists.mts          (liste, ne supprime rien)
 *   npx tsx scripts/supprimer-doublons-decklists.mts --appliquer
 *
 * 130 decks du Shanghai City Challenge existent en deux fichiers, sous l'ancien
 * nom (`shanghai-cc-12--de.json`) et sous le nouveau (`shanghai-cc-437-12-de.json`).
 * Les cartes sont les mêmes des deux côtés ; ce qui change, c'est la qualité de la
 * fiche : le fichier `-437-` porte le nom complet du tournoi (avec sa date) et le
 * pseudo complet du joueur (« XXT.Wh1t3zZ » contre « XXT »).
 *
 * On garde donc le fichier indexé dans `data/decklists-index.json` et on supprime
 * l'autre. Trois garde-fous : la paire doit compter exactement deux fichiers, un
 * seul des deux doit être indexé, et les cartes doivent être identiques. Au moindre
 * écart de cartes, on ne touche à rien et on le signale : ce serait deux decks
 * différents, pas un doublon.
 */
import { readFileSync, unlinkSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RACINE = "data/decklists";
const appliquer = process.argv.includes("--appliquer");

interface Carte { name: string; quantity: number }
interface Deck {
  id?: string;
  player?: string;
  tournament?: string;
  mainDeck?: Carte[];
  sideDeck?: Carte[];
  battlefields?: string[];
}

function empreinteCartes(d: Deck): string {
  const pool = (cartes: Carte[] = []) =>
    cartes
      .map((c) => `${c.name}x${c.quantity}`)
      .sort()
      .join(",");
  return [pool(d.mainDeck), pool(d.sideDeck), [...(d.battlefields ?? [])].sort().join(",")].join(" || ");
}

const index = JSON.parse(readFileSync("data/decklists-index.json", "utf8")) as Array<{ file: string }>;
const indexes = new Set(index.map((e) => e.file));

const parId = new Map<string, Array<{ rel: string; deck: Deck }>>();
for (const dossier of readdirSync(RACINE)) {
  const chemin = join(RACINE, dossier);
  if (!statSync(chemin).isDirectory()) continue;
  for (const nom of readdirSync(chemin)) {
    if (!nom.endsWith(".json")) continue;
    const rel = `${dossier}/${nom}`;
    const deck = JSON.parse(readFileSync(join(RACINE, rel), "utf8")) as Deck;
    if (!deck.id) continue;
    const liste = parId.get(deck.id) ?? [];
    liste.push({ rel, deck });
    parId.set(deck.id, liste);
  }
}

const aSupprimer: string[] = [];
const refuses: Array<{ id: string; raison: string; fichiers: string[] }> = [];

for (const [id, liste] of parId) {
  if (liste.length < 2) continue;
  const fichiers = liste.map((l) => l.rel);
  if (liste.length !== 2) {
    refuses.push({ id, raison: `${liste.length} fichiers, pas 2`, fichiers });
    continue;
  }
  const empreintes = new Set(liste.map((l) => empreinteCartes(l.deck)));
  if (empreintes.size !== 1) {
    refuses.push({ id, raison: "cartes différentes : ce sont deux decks, pas un doublon", fichiers });
    continue;
  }
  const indexesDeLaPaire = liste.filter((l) => indexes.has(l.rel));
  if (indexesDeLaPaire.length !== 1) {
    refuses.push({ id, raison: `${indexesDeLaPaire.length} fichier(s) indexé(s), il en faut 1`, fichiers });
    continue;
  }
  const garde = indexesDeLaPaire[0].rel;
  const perdu = liste.find((l) => l.rel !== garde)!;
  aSupprimer.push(perdu.rel);
}

console.log(`${aSupprimer.length} fichier(s) à supprimer, ${refuses.length} paire(s) refusée(s)`);
for (const r of refuses.slice(0, 20)) console.log(`  REFUS ${r.id} : ${r.raison}\n         ${r.fichiers.join("\n         ")}`);
for (const f of aSupprimer.slice(0, 5)) console.log(`  exemple : ${f}`);

if (!appliquer) {
  console.log("\nRien n'a été supprimé. Relancer avec --appliquer.");
  process.exit(refuses.length ? 1 : 0);
}

for (const rel of aSupprimer) unlinkSync(join(RACINE, rel));
console.log(`\n${aSupprimer.length} fichiers supprimés. Relancer scripts/fix-decklists-index.ts.`);
