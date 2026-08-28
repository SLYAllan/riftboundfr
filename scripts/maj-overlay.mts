/**
 * LA routine de mise à jour de l'overlay. Un seul point d'entrée.
 *
 *   npm run maj:overlay            # releve et écrit
 *   npm run maj:overlay -- --sec   # dit ce qui changerait, n'écrit rien
 *
 * À lancer après chaque sortie de set, une fois `npm run sync-cards` passé : c'est
 * lui qui met les nouvelles cartes en base, et tout ce qui suit les lit.
 *
 * Pourquoi elle existe. L'overlay tombe en panne EN SILENCE quand un set sort. Une
 * Légende toute neuve apparaît dans les listes du tableau de bord, un streamer la
 * choisit, et son cadre reste vide : la bannière et l'icône n'existent pas encore,
 * et rien ne le dit nulle part. Pareil pour les cartes chinoises, dont le figurier
 * publie chaque set à son rythme. On regardait donc l'overlay en direct pour
 * découvrir ce qui manquait.
 *
 * Ce qu'elle fait, dans l'ordre :
 *
 *   1. `sync-cartes-zh.mts`   noms et images chinoises du figurier officiel
 *                             → data/cards-zh.json
 *   2. l'inventaire des habillages de Légende : bannière et icône, carte par carte
 *
 * Ce qu'elle NE fait PAS, et pourquoi : elle ne fabrique aucune image. Une bannière
 * de Légende est un visuel qu'Allan produit ; la routine dit lesquelles manquent, et
 * s'arrête là. Elle ne lance pas non plus `sync-cards` : celui-là écrit en base et
 * a sa propre commande, on ne l'enterre pas dans une routine.
 *
 * Elle SORT EN ERREUR quand une entrée de `banners.ts` désigne un fichier absent du
 * disque : ce cas-là n'est pas un visuel à dessiner, c'est une faute de frappe, et
 * elle rend le cadre aussi vide que l'oubli.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { BANNER_MAP, ICON_MAP, cleLegende } from "../src/lib/banners";

const sec = process.argv.includes("--sec");

console.log(sec ? "Marche à sec : rien ne sera écrit.\n" : "Mise à jour de l'overlay.\n");

console.log("=== 1/2  Cartes chinoises (noms et images) ===");
const releve = spawnSync("npx", ["tsx", "--env-file=.env", "scripts/sync-cartes-zh.mts", ...(sec ? ["--sec"] : [])], {
  stdio: "inherit",
  shell: process.platform === "win32",
  encoding: "utf-8",
});
if (releve.status !== 0) {
  console.error("\nÉTAPE EN ÉCHEC : cartes chinoises.");
  console.error("L'inventaire qui suit n'est pas lancé : il lirait une releve à moitié écrite.");
  process.exit(1);
}

console.log("\n=== 2/2  Habillages de Légende (bannière et icône) ===");

const prisma = new PrismaClient();
const legendes = await prisma.card.findMany({
  where: { type: "Legend", alternateArt: false },
  select: { name: true, set: true },
  orderBy: [{ set: "asc" }, { collectorNumber: "asc" }],
});
await prisma.$disconnect();

const sansBanniere: string[] = [];
const sansIcone: string[] = [];
const fichiersAbsents: string[] = [];
const vues = new Set<string>();

for (const legende of legendes) {
  const cle = cleLegende(legende.name);
  if (vues.has(cle)) continue;
  vues.add(cle);

  const banniere = BANNER_MAP[cle];
  const icone = ICON_MAP[cle];
  if (!banniere) sansBanniere.push(`${legende.set}  ${legende.name}`);
  else if (!existsSync(join(process.cwd(), "public", "bannieres", `${banniere}.webp`))) {
    fichiersAbsents.push(`public/bannieres/${banniere}.webp  (${legende.name})`);
  }
  if (!icone) sansIcone.push(`${legende.set}  ${legende.name}`);
  else if (!existsSync(join(process.cwd(), "public", "img", "legend_icon", `${icone}.webp`))) {
    fichiersAbsents.push(`public/img/legend_icon/${icone}.webp  (${legende.name})`);
  }
}

console.log(`${vues.size} Légendes en base, ${vues.size - sansBanniere.length} avec bannière, ${vues.size - sansIcone.length} avec icône.`);
if (sansBanniere.length) {
  console.log(`\nSANS BANNIÈRE (${sansBanniere.length}) — cadre vide dans le décor « avec caméras » :`);
  for (const l of sansBanniere) console.log(`  ${l}`);
}
if (sansIcone.length) {
  console.log(`\nSANS ICÔNE (${sansIcone.length}) — cadre vide dans le décor « sans caméras » et dans le compact :`);
  for (const l of sansIcone) console.log(`  ${l}`);
}
if (fichiersAbsents.length) {
  console.error(`\nFICHIERS ABSENTS DU DISQUE (${fichiersAbsents.length}) — l'entrée existe dans banners.ts mais pas l'image :`);
  for (const f of fichiersAbsents) console.error(`  ${f}`);
}

const aFournir = sansBanniere.length + sansIcone.length > 0;
console.log(`
=== Fini ===

Ce qui reste à faire À LA MAIN :
${aFournir ? `
  - Fournir les visuels listés ci-dessus : la bannière dans 'public/bannieres/' et
    l'icône dans 'public/img/legend_icon/', en .webp, puis ajouter leur ligne dans
    BANNER_MAP et ICON_MAP de 'src/lib/banners.ts'. La clé est le nom du champion
    en minuscules : 'annie', "rek'sai".` : `
  - Rien côté visuels : chaque Légende de la base a sa bannière et son icône.`}
  - Vérifier l'overlay DANS OBS, pas dans le navigateur : c'est le seul endroit où
    la transparence composée se voit. Demander à Allan avant de toucher à son
    habillage.

Puis : npm run verify
`);

// Un renvoi dans banners.ts vers une image absente est une faute qui se corrige
// tout de suite, contrairement à un visuel qui reste à dessiner.
if (fichiersAbsents.length) process.exit(1);
