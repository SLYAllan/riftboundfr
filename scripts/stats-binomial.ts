/**
 * Les deux mesures qui disent si un écart de conversion tient debout.
 *
 * À part dans leur fichier parce que `tier-stats.mts` est un script : il lit
 * `process.argv` et imprime dès l'import. `tier-ecarts.mts` a besoin du test,
 * pas du tableau.
 */

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
