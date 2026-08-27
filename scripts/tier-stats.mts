/**
 * Est-ce que l'écart de conversion d'une Légende tient debout, ou est-ce du bruit ?
 *
 * Une tier list bâtie sur « 7,4 % contre 10,9 % » ne vaut rien si l'échantillon
 * ne permet pas de distinguer les deux. Ce script compare la conversion de chaque
 * Légende à la moyenne du format, et dit si l'écart est significatif.
 *
 *   npx tsx --env-file=.env scripts/tier-stats.mts [set] [coupe] [minJoueurs]
 *   npx tsx scripts/tier-stats.mts Vendetta 0.10 40
 *   npx tsx scripts/tier-stats.mts tous 0.10 100   # tous sets confondus
 *   npx tsx scripts/tier-stats.mts --autotest
 *
 * DEUX SOURCES, et le script dit laquelle il emploie :
 *
 * 1. `data/tournaments/classements.json` quand le set y est couvert. C'est le
 *    classement COMPLET des tournois, joueurs sans decklist publiée compris.
 * 2. Sinon la base, donc les seules listes publiées. Ce corpus est biaisé : ce
 *    sont les joueurs qui performent qui publient. Le script écarte alors les
 *    tournois dont on a moins de 90 % des listes, sinon ils faussent tout. Sur
 *    Unleashed, Utrecht n'est publié qu'à 3 %, Hartford à 5 %, Vancouver à 7 % :
 *    les garder revenait à dire que tous leurs joueurs relevés avaient bien fini.
 *
 * La coupe est PROPORTIONNELLE (10 % du tournoi par défaut), jamais un Top 8 fixe :
 * un Top 8 sur 128 joueurs, c'est 6,3 % du champ, sur 2 127 c'est 0,4 %. Les
 * mélanger revenait à noter les City Challenge et les Regional sur deux barèmes.
 *
 * Deux mesures :
 *   - l'intervalle de confiance de Wilson à 95 % sur la conversion ;
 *   - un test binomial bilatéral contre la conversion moyenne du format.
 * Sous 5 % on parle d'écart établi ; au-dessus, la place au classement est un
 * choix éditorial et doit être annoncée comme tel.
 */
import { chargerCorpus, seuilsDeCoupe } from "./corpus-tournois";

/** Intervalle de Wilson : correct sur les petits échantillons, contrairement à Wald. */
export function wilson(succes: number, total: number, z = 1.96): [number, number] {
  if (total === 0) return [0, 0];
  const p = succes / total;
  const d = 1 + (z * z) / total;
  const centre = (p + (z * z) / (2 * total)) / d;
  const demi = (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) / d;
  return [Math.max(0, centre - demi), Math.min(1, centre + demi)];
}

const logFact = (n: number): number => {
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
};

const binom = (k: number, n: number, p: number): number =>
  Math.exp(logFact(n) - logFact(k) - logFact(n - k) + k * Math.log(p) + (n - k) * Math.log(1 - p));

/** Test binomial exact, bilatéral (méthode de la densité : on somme tout ce qui est aussi improbable). */
export function pBinomial(succes: number, total: number, p0: number): number {
  if (total === 0) return 1;
  const seuil = binom(succes, total, p0) * (1 + 1e-9);
  let p = 0;
  for (let k = 0; k <= total; k++) {
    const d = binom(k, total, p0);
    if (d <= seuil) p += d;
  }
  return Math.min(1, p);
}

if (process.argv.includes("--autotest")) {
  // La densité en 0 vaut 0,929^74 ; le p bilatéral l'englobe et lui ajoute la
  // queue haute, il doit donc être plus grand tout en restant sous 5 %.
  const densiteZero = Math.pow(1 - 0.0712, 74);
  const obtenu = pBinomial(0, 74, 0.0712);
  if (!(obtenu >= densiteZero && obtenu < 0.05)) throw new Error(`binomial faux : ${obtenu}`);
  const [bas, haut] = wilson(21, 192);
  if (!(bas > 0.07 && haut < 0.17)) throw new Error(`Wilson hors bornes : ${bas} ${haut}`);
  if (pBinomial(5, 100, 0.05) < 0.9) throw new Error("un écart nul devrait donner p élevé");
  console.log("autotest ok");
  process.exit(0);
}

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const setDemande = args[0] ?? "Vendetta";
/** « tous » : toutes les ères confondues, pour la tier list globale. */
const tousSets = setDemande.toLowerCase() === "tous";
const coupe = Number(args[1] ?? 0.10);
const minJoueurs = Number(args[2] ?? 40);


const { places, source, ecartes } = await chargerCorpus(tousSets ? null : setDemande);


if (!places.length) {
  console.error(`Aucune place pour le set « ${setDemande} ».`);
  process.exit(1);
}

const seuils = seuilsDeCoupe(places, coupe);
const tailles = new Map<string, number>();
for (const p of places) tailles.set(p.contexte, (tailles.get(p.contexte) ?? 0) + 1);

const parLegende = new Map<string, { n: number; top: number }>();
for (const p of places) {
  if (!p.legend) continue;
  const e = parLegende.get(p.legend) ?? { n: 0, top: 0 };
  e.n++;
  if (p.rang <= seuils.get(p.contexte)!) e.top++;
  parLegende.set(p.legend, e);
}

const total = [...parLegende.values()].reduce((s, e) => s + e.n, 0);
const totalTop = [...parLegende.values()].reduce((s, e) => s + e.top, 0);
const moyenne = totalTop / total;

console.log(`${tousSets ? "Toutes ères" : "Set " + setDemande} · source : ${source}.`);
console.log(`${tailles.size} tournois, ${total} joueurs classés, coupe à ${(coupe * 100).toFixed(0)} % du champ.`);
if (ecartes.length) {
  console.log(`\n${ecartes.length} tournoi(s) écarté(s), moins de 90 % des listes publiées :`);
  for (const e of ecartes) console.log(`  ${e}`);
}
console.log(`\nConversion moyenne du format : ${(moyenne * 100).toFixed(2)} %.`);
console.log(`Légendes vues au moins ${minJoueurs} fois. p = test binomial bilatéral contre la moyenne.\n`);
console.log("| Légende | Joueurs | Part | Coupe | Conv. | IC 95 % | p | Écart établi |");
console.log("|---|---:|---:|---:|---:|---|---:|---|");

const lignes = [...parLegende.entries()]
  .filter(([, e]) => e.n >= minJoueurs)
  .sort((a, b) => b[1].top / b[1].n - a[1].top / a[1].n);

for (const [nom, e] of lignes) {
  const conv = e.top / e.n;
  const [bas, haut] = wilson(e.top, e.n);
  const p = pBinomial(e.top, e.n, moyenne);
  const verdict = p >= 0.05 ? "non, bruit" : conv > moyenne ? "OUI, au-dessus" : "OUI, en dessous";
  console.log(
    `| ${nom} | ${e.n} | ${((e.n / total) * 100).toFixed(1)} % | ${e.top} | ${(conv * 100).toFixed(1)} % | ${(bas * 100).toFixed(1)}\u2013${(haut * 100).toFixed(1)} % | ${p.toFixed(3)} | ${verdict} |`,
  );
}

const petites = [...parLegende.entries()].filter(([, e]) => e.n < minJoueurs).sort((a, b) => b[1].n - a[1].n);
if (petites.length) {
  console.log(`\nSous le seuil, non classables : ${petites.map(([n, e]) => `${n.split(",")[0]} (${e.n})`).join(", ")}`);
}
