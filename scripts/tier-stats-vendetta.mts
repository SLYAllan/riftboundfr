/**
 * Est-ce que l'écart de conversion d'une Légende tient debout, ou est-ce du bruit ?
 *
 * Une tier list bâtie sur « 7,4 % contre 10,9 % » ne vaut rien si l'échantillon
 * ne permet pas de distinguer les deux. Ce script compare la conversion en Top 8
 * de chaque Légende à la moyenne du format, et dit si l'écart est significatif.
 *
 *   npx tsx --env-file=.env scripts/tier-stats-vendetta.mts [set] [minDecks]
 *   npx tsx scripts/tier-stats-vendetta.mts --autotest
 *
 * Deux mesures :
 *   - l'intervalle de confiance de Wilson à 95 % sur la conversion ;
 *   - un test binomial bilatéral contre la conversion moyenne du format.
 * Sous 5 % on parle d'écart établi ; au-dessus, la place au classement est un
 * choix éditorial et doit être annoncée comme tel.
 */
import { PrismaClient } from "@prisma/client";

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

const set = process.argv[2] ?? "Vendetta";
const minDecks = Number(process.argv[3] ?? 20);
const prisma = new PrismaClient();

const decks = await prisma.deck.findMany({
  where: { published: true, setTag: set, NOT: { tournamentContext: null } },
  select: { legendName: true, placement: true },
});

const parLegende = new Map<string, { n: number; top8: number }>();
for (const d of decks) {
  const e = parLegende.get(d.legendName) ?? { n: 0, top8: 0 };
  e.n++;
  const p = d.placement ? parseInt(d.placement.match(/\d+/)?.[0] ?? "", 10) : NaN;
  if (Number.isFinite(p) && p <= 8) e.top8++;
  parLegende.set(d.legendName, e);
}

const total = decks.length;
const totalTop8 = [...parLegende.values()].reduce((s, e) => s + e.top8, 0);
const moyenne = totalTop8 / total;

console.log(`Set ${set} : ${total} decks, ${totalTop8} Top 8, conversion moyenne ${(moyenne * 100).toFixed(2)} %`);
console.log(`Légendes vues au moins ${minDecks} fois. p = test binomial bilatéral contre la moyenne.\n`);
console.log("| Légende | Decks | Top 8 | Conv. | IC 95 % | p | Écart établi |");
console.log("|---|---:|---:|---:|---|---:|---|");

const lignes = [...parLegende.entries()]
  .filter(([, e]) => e.n >= minDecks)
  .sort((a, b) => b[1].top8 / b[1].n - a[1].top8 / a[1].n);

for (const [nom, e] of lignes) {
  const conv = e.top8 / e.n;
  const [bas, haut] = wilson(e.top8, e.n);
  const p = pBinomial(e.top8, e.n, moyenne);
  const verdict = p >= 0.05 ? "non — bruit" : conv > moyenne ? "OUI, au-dessus" : "OUI, en dessous";
  console.log(
    `| ${nom} | ${e.n} | ${e.top8} | ${(conv * 100).toFixed(1)} % | ${(bas * 100).toFixed(1)}–${(haut * 100).toFixed(1)} % | ${p.toFixed(3)} | ${verdict} |`,
  );
}

await prisma.$disconnect();
