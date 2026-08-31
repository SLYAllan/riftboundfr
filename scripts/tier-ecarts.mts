/**
 * Ce qui ne colle plus entre les tier lists rédigées et les chiffres du jour.
 *
 *   npx tsx --env-file=.env scripts/tier-ecarts.mts
 *
 * Il ne réécrit RIEN : les lettres sont un choix éditorial. Il dit seulement où
 * regarder, parce que la routine se contentait d'un « relire les écarts » sans
 * dire lesquels, et qu'on relançait `tier-stats.mts` à la main pour les trouver.
 * Résultat, une tier list pouvait rester deux relevés de suite sur des chiffres
 * morts sans que rien ne le signale.
 *
 * Deux contrôles, tous les deux vérifiables :
 *
 * 1. CONTRADICTION : une Légende classée S ou A dont l'écart en dessous de la
 *    moyenne est établi (p < 0,05), ou classée C ou D dont l'écart au-dessus
 *    l'est. Le reste du classement est une lecture, pas un test : on se tait.
 * 2. EFFECTIF PÉRIMÉ : le commentaire cite « N joueurs » et N n'est plus le
 *    compte. C'est exactement ce qui traînait sur Vendetta après Wuhan.
 */
import { chargerCorpus, bilanParLegende } from "./corpus-tournois";
import { pBinomial } from "./stats-binomial";
import { globalTier, vendettaTier, originsTier, spiritforgedTier, unleashedTier, type TierEntry } from "./tier-tables";

const SEUIL_P = 0.05;
/** Sous 40 joueurs, aucun test ne tranche : on ne dit rien. */
const MIN_JOUEURS = 40;

const cle = (nom: string) => nom.toLowerCase().replace(/[^a-z0-9]/g, "");

/** « 568 joueurs », « 2 127 joueurs », « 1 204 joueurs » — l'espace peut être insécable. */
function effectifCite(commentaire: string | undefined): number | null {
  const m = commentaire?.match(/([\d][\d\s  ]*)\s*joueurs?/);
  return m ? parseInt(m[1].replace(/[\s  ]/g, ""), 10) : null;
}

async function controler(titre: string, set: string | null, table: TierEntry[]) {
  const corpus = await chargerCorpus(set);
  const bilans = bilanParLegende(corpus.places);
  const total = [...bilans.values()].reduce((s, b) => s + b.joueurs, 0);
  const totalCoupe = [...bilans.values()].reduce((s, b) => s + b.coupe, 0);
  const moyenne = total ? totalCoupe / total : 0;

  const parCle = new Map([...bilans].map(([nom, b]) => [cle(nom), b]));
  const contradictions: string[] = [];
  const aRegarder: string[] = [];
  const perimes: string[] = [];

  for (const e of table) {
    const b = parCle.get(cle(e.legendName));
    if (!b) continue;

    if (b.joueurs >= MIN_JOUEURS) {
      const conv = b.coupe / b.joueurs;
      const p = pBinomial(b.coupe, b.joueurs, moyenne);
      const etabliDessus = p < SEUIL_P && conv > moyenne;
      const etabliDessous = p < SEUIL_P && conv < moyenne;
      const chiffres = `${(conv * 100).toFixed(1)} % contre ${(moyenne * 100).toFixed(1)} % (p = ${p.toFixed(3)})`;

      // Les cinq listes suivent la même règle du S, écrite dans leur en-tête :
      // n'y entre que l'écart qui tient un test binomial. Le reste du classement
      // est une lecture, pas un test, et on se tait dessus.
      // Contradiction franche : le classement dit l'inverse de ce que le test mesure.
      if (!etabliDessus && e.tier === "S") {
        contradictions.push(`${e.legendName} : classée S, mais l'écart au-dessus ne tient plus, ${chiffres}.`);
      }
      if (etabliDessous && "SA".includes(e.tier)) {
        contradictions.push(`${e.legendName} : classée ${e.tier}, écart EN DESSOUS établi, ${chiffres}.`);
      }
      // Question, pas verdict : chaque liste ajoute sa propre condition d'effectif
      // au test. Unleashed garde Annie et Sivir en A, l'écart tient mais sur cinq
      // fois moins de monde que son trio de tête, et c'est écrit dans son en-tête.
      else if (etabliDessus && e.tier !== "S" && !e.assume) {
        aRegarder.push(`${e.legendName} : classée ${e.tier}, écart au-dessus établi sur ${b.joueurs} joueurs, ${chiffres}.`);
      }
    }

    const cite = effectifCite(e.comment);
    if (cite !== null && cite !== b.joueurs) {
      perimes.push(`${e.legendName} : le commentaire dit ${cite} joueurs, le corpus en compte ${b.joueurs}.`);
    }
  }

  const tournois = new Set(corpus.places.map((pl) => pl.contexte)).size;
  console.log(`\n=== ${titre} — ${corpus.places.length} places, ${tournois} tournois, conversion moyenne ${(moyenne * 100).toFixed(1)} % ===`);
  if (!contradictions.length && !aRegarder.length && !perimes.length) {
    console.log("  rien à revoir.");
    return 0;
  }
  for (const c of contradictions) console.log(`  RANG À REVOIR   ${c}`);
  for (const c of aRegarder) console.log(`  À REGARDER      ${c}`);
  for (const c of perimes) console.log(`  CHIFFRE PÉRIMÉ  ${c}`);
  return contradictions.length + aRegarder.length + perimes.length;
}

const listes: [string, string | null, TierEntry[]][] = [
  ["Tier List Vendetta", "Vendetta", vendettaTier],
  ["Tier List Globale", null, globalTier],
  ["Tier List Unleashed", "Unleashed", unleashedTier],
  ["Tier List Spiritforged", "Spiritforged", spiritforgedTier],
  ["Tier List Origins", "Origins", originsTier],
];

let n = 0;
for (const [titre, set, table] of listes) n += await controler(titre, set, table);

console.log(
  n === 0
    ? "\nLes cinq tier lists collent aux chiffres."
    : `\n${n} point(s) à revoir dans scripts/tier-tables.ts, puis relancer npm run maj:stats.`,
);
