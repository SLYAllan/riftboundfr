/**
 * LA routine de mise à jour des stats. Un seul point d'entrée.
 *
 *   npm run maj:stats            # calcule et écrit
 *   npm run maj:stats -- --sec   # dit ce qui changerait, n'écrit rien
 *
 * Pourquoi elle existe. La chaîne se lançait à la main, script par script, et
 * dans le désordre. Résultat : la tier list était refaite mais pas les fiches,
 * les fiches comptaient autrement que la tier list, l'accueil restait sur le méta
 * d'Origines, et il fallait rouvrir chaque page pour trouver ce qui manquait.
 * Tout ce qui dépend des chiffres se refait ici, dans l'ordre, ou ne se refait
 * pas du tout.
 *
 * L'ORDRE COMPTE, chaque étape lit ce que la précédente a écrit :
 *
 *   1. `classements-tournois.mts`  le corpus, depuis les scrapes bruts
 *                                  → data/tournaments/classements.json
 *                                  → data/tournaments/meta-parts.json  (lu par /meta et l'accueil)
 *   2. `seed-tier-lists.ts`        les 5 tier lists en base, écrites à la main
 *                                  d'après `tier-stats.mts`, seedées ici
 *   3. `fiches-stats.mts`          les chiffres par Légende, sur LE corpus partagé
 *   4. `fiches-maj.mts`            les pose dans data/fiches/, et aligne les rangs
 *                                  sur la tier list (sinon /legendes et /tier-list
 *                                  se contredisent)
 *   5. `stats-deckbuilding.mts`    les sections chiffrées de DECKBUILDING-RULES
 *   6. `tier-ecarts.mts`           ce qui ne colle plus entre les tier lists
 *                                  rédigées (`tier-tables.ts`) et le corpus
 *
 * Ce qu'elle ne fait PAS, et pourquoi : elle ne réécrit ni les lettres de tier ni
 * la prose des documents. Un rang est un choix éditorial appuyé sur un test
 * statistique, pas une sortie de calcul, et `AGENTS.md` demande de le dire plutôt
 * que de le maquiller en science. La routine sort donc les chiffres à jour et
 * signale les écarts ; c'est un humain qui tranche les lettres.
 *
 * Après elle : relire le rapport de l'étape 6, ajuster `tier-tables.ts` si un rang
 * ou un chiffre bouge, relancer, puis `npm run verify`.
 */
import { spawnSync } from "node:child_process";

const sec = process.argv.includes("--sec");

interface Etape {
  titre: string;
  cmd: string[];
  /** Redirige la sortie standard vers ce fichier au lieu de l'afficher. */
  vers?: string;
  /** Sautée en marche à sec (elle écrit). */
  ecrit?: boolean;
}

const etapes: Etape[] = [
  {
    titre: "1/6  Corpus des classements (classements.json + meta-parts.json)",
    cmd: ["tsx", "--env-file=.env", "scripts/classements-tournois.mts"],
    ecrit: true,
  },
  {
    titre: "2/6  Tier lists en base",
    cmd: ["tsx", "scripts/seed-tier-lists.ts"],
    ecrit: true,
  },
  {
    titre: "3/6  Chiffres par Légende",
    cmd: ["tsx", "--env-file=.env", "scripts/fiches-stats.mts", "Vendetta", "10"],
    vers: "data/fiches-stats-vendetta.json",
    ecrit: true,
  },
  {
    titre: "4/6  Fiches Légendes (cartes, résultats, rangs)",
    cmd: ["tsx", "scripts/fiches-maj.mts", "data/fiches-stats-vendetta.json", ...(sec ? [] : ["--ecrire"])],
  },
  {
    titre: "5/6  Sections chiffrées de DECKBUILDING-RULES",
    cmd: ["tsx", "--env-file=.env", "scripts/stats-deckbuilding.mts"],
    vers: "data/deckbuilding-stats.md",
    ecrit: true,
  },
  {
    // En dernier, et sans `ecrit` : il n'écrit rien, donc il tourne aussi en marche
    // à sec, et son rapport est la dernière chose qu'on lit. Il existe parce que la
    // routine disait « relire les écarts » sans dire lesquels : la tier list Vendetta
    // est restée deux relevés de suite sur des effectifs morts sans que rien ne le
    // signale.
    titre: "6/6  Écarts entre les tier lists rédigées et les chiffres",
    cmd: ["tsx", "--env-file=.env", "scripts/tier-ecarts.mts"],
  },
];

console.log(sec ? "Marche à sec : rien ne sera écrit.\n" : "Mise à jour des stats.\n");

for (const e of etapes) {
  if (sec && e.ecrit) {
    console.log(`${e.titre}  — sautée (écrit des fichiers)`);
    continue;
  }
  console.log(`\n=== ${e.titre} ===`);
  const r = spawnSync("npx", e.cmd, {
    stdio: e.vers ? ["inherit", "pipe", "inherit"] : "inherit",
    shell: process.platform === "win32",
    encoding: "utf-8",
  });
  if (r.status !== 0) {
    console.error(`\nÉTAPE EN ÉCHEC : ${e.titre}`);
    console.error("Rien de ce qui suit n'est lancé : les étapes suivantes liraient des données à moitié écrites.");
    process.exit(1);
  }
  if (e.vers && typeof r.stdout === "string") {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(e.vers, r.stdout, "utf-8");
    console.log(`  → ${e.vers}`);
  }
}

console.log(`
=== Fini ===

Ce qui reste à faire À LA MAIN, et qui ne peut pas être automatisé :

  - Trancher les écarts de l'étape 6, dans \`scripts/tier-tables.ts\`, puis relancer
    cette routine. « RANG À REVOIR » est une contradiction, « À REGARDER » une
    question (chaque liste pose sa propre condition d'effectif), « CHIFFRE PÉRIMÉ »
    un commentaire à réécrire.
  - Reporter les chiffres dans \`docs/META-KNOWLEDGE.md\` (tableaux par set) et
    \`docs/DECKBUILDING-RULES.md\` (sections chiffrées) depuis :
        npx tsx scripts/tier-stats.mts <set|tous>
        data/deckbuilding-stats.md   (écrit à l'étape 5)
  - Vérifier la couverture :  npx tsx --env-file=.env scripts/couverture-tournois.mts
    Un tournoi sous 90 % de listes publiées fausse les parts : lui scraper son
    classement avec \`scripts/scrape-classement.sh\`.

Puis : npm run verify
`);
