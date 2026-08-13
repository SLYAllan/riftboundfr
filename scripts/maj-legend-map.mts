/**
 * Complète `data/raw-scrapes/legend-map.json` avec les Légendes de la base.
 *
 * Cette carte associe `SET-NUMÉRO` (« VEN-139 ») au nom canonique de la Légende.
 * Le scraping de riftdecks s'en sert pour reconnaître la Légende d'un deck à
 * partir des images de cartes de la page. **Une Légende absente de la carte fait
 * sauter le deck entier**, rangé en `no-legend` : c'est silencieux, et ça vide un
 * tournoi de la moitié de ses decks sans que rien ne prévienne.
 *
 * C'est arrivé avec Vendetta : le set était en base et jouée en tournoi, mais
 * aucune de ses 9 Légendes n'était dans la carte.
 *
 *   npx tsx scripts/maj-legend-map.mts            # dit ce qui manque
 *   npx tsx scripts/maj-legend-map.mts --apply    # écrit
 *
 * N'écrase jamais une entrée existante : la carte a été relue à la main, et une
 * réécriture en masse reperdrait ce travail.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CHEMIN = join(process.cwd(), "data", "raw-scrapes", "legend-map.json");
const ecrire = process.argv.includes("--apply");

const prisma = new PrismaClient();

/**
 * La clé du scraper : préfixe de set en majuscules + numéro sans zéro de tête ni
 * lettre de variante. `ven-139-166` donne `VEN-139`, comme `Number("039")` donne 39.
 */
function cle(riftboundId: string): string | null {
  const m = /^([a-z]+)-(\d+)/i.exec(riftboundId);
  return m ? `${m[1].toUpperCase()}-${Number(m[2])}` : null;
}

/**
 * Le nom canonique : sans le suffixe de traitement entre parenthèses.
 * « Mel, Soul's Reflection (Overnumbered) » est la même Légende que « Mel,
 * Soul's Reflection » ; le deck qui la joue doit tomber sur un seul nom.
 */
function nomCanonique(nom: string): string {
  return nom.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

async function main() {
  const carte: Record<string, string> = JSON.parse(readFileSync(CHEMIN, "utf-8"));
  const avant = Object.keys(carte).length;

  const legendes = await prisma.card.findMany({
    where: { type: "Legend" },
    select: { riftboundId: true, name: true },
  });

  const ajouts: [string, string][] = [];
  const conflits: string[] = [];
  for (const c of legendes) {
    const k = cle(c.riftboundId);
    if (!k) continue;
    const nom = nomCanonique(c.name);
    if (!carte[k]) ajouts.push([k, nom]);
    else if (carte[k] !== nom) conflits.push(`${k} : carte="${carte[k]}" base="${nom}"`);
  }

  ajouts.sort(([a], [b]) => a.localeCompare(b));
  for (const [k, nom] of ajouts) console.log(`+ ${k.padEnd(9)} ${nom}`);

  // Un conflit n'est pas corrigé d'office : il peut venir d'un nom mal orthographié
  // en base (déjà vu avec « Jax »), et écraser la carte propagerait la faute.
  if (conflits.length > 0) {
    console.log(`\n${conflits.length} désaccord(s) entre la carte et la base, laissés tels quels :`);
    for (const c of conflits) console.log(`  ! ${c}`);
  }

  if (ajouts.length === 0) {
    console.log("Rien à ajouter : toutes les Légendes de la base sont dans la carte.");
  } else if (!ecrire) {
    console.log(`\n${ajouts.length} à ajouter. Relancer avec --apply pour écrire.`);
  } else {
    const fusion = { ...carte, ...Object.fromEntries(ajouts) };
    writeFileSync(CHEMIN, JSON.stringify(fusion, null, 2) + "\n", "utf-8");
    console.log(`\n${avant} -> ${Object.keys(fusion).length} entrées écrites dans ${CHEMIN}.`);
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
