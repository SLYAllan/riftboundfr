// Passage HTTP sur toutes les adresses du sitemap : statut, durée, poids, et ce qui
// trahirait l'hébergeur dans le HTML (hôte interne, http://, localhost).
// node scripts/audit-bascule-http.mjs --base https://essai.riftboundfrance.fr --out http.json [--par 2]
// Aucune dépendance. Référence du 31 octobre 2026 : docs/AUDIT-BASCULE-MAISON-2026-10-31.md.
import { writeFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, t) => (a.startsWith("--") ? [a.slice(2), t[i + 1]] : [])).filter(Boolean),
);
const BASE = (args.base ?? "https://riftboundfrance.fr").replace(/\/$/, "");
const PAR = Number(args.par ?? 2);
const UA = "RiftboundFr-audit-bascule/1.0";

const sitemap = await (await fetch(`${BASE}/sitemap.xml`, { headers: { "User-Agent": UA } })).text();
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const hotesSitemap = [...new Set(locs.map((u) => new URL(u).origin))];
// Le sitemap écrit l'adresse publique ; on la remplace par la base visée, pour pouvoir
// rejouer le même passage sur essai.riftboundfrance.fr.
const chemins = [...new Set(locs.map((u) => { const x = new URL(u); return x.pathname + x.search; }))];
const EXTRA = [
  "/robots.txt", "/sitemap.xml", "/llms.txt", "/manifest.webmanifest", "/sw.js", "/favicon.ico",
  "/offline", "/admin/login", "/api/health", "/api/health?base=1", "/api/cards?limit=5", "/api/legends",
  "/api/v1/cards?limit=5", "/api/v1/decks?limit=5", "/api/v1/tier-list", "/api/battlefields",
  "/en", "/zh", "/zh/profil/overlay", "/en/tier-list", "/en/decks", "/collection", "/profil", "/profil/overlay",
  "/deckbuilder", "/decks/compare", "/outils/tier-list", "/community-decks",
];
for (const e of EXTRA) if (!chemins.includes(e)) chemins.push(e);

const SUSPECTS = [
  [/https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/gi, "hôte local"],
  [/http:\/\/(www\.)?riftboundfrance\.fr/gi, "http:// au lieu de https://"],
  [/https?:\/\/[a-z0-9]{24}(:\d+)?\//gi, "nom de conteneur Coolify"],
  [/178\.104\.237\.33/g, "IP du Hetzner"],
  [/sonde-ci\.invalid|undefined\/api/gi, "adresse de build manquante"],
];

const resultats = [];
let i = 0;
async function un(chemin) {
  const t0 = Date.now();
  try {
    const r = await fetch(BASE + chemin, { redirect: "manual", headers: { "User-Agent": UA, "Accept-Encoding": "gzip, br" }, signal: AbortSignal.timeout(30000) });
    const type = r.headers.get("content-type") ?? "";
    const corps = /html|xml|text|json|javascript/.test(type) ? await r.text() : (await r.arrayBuffer(), "");
    const fuites = [];
    for (const [re, nom] of SUSPECTS) {
      const m = corps.match(re);
      if (m) fuites.push(`${nom}: ${[...new Set(m)].slice(0, 3).join(" ")}`);
    }
    const canon = corps.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? null;
    resultats.push({ chemin, statut: r.status, ms: Date.now() - t0, octets: corps.length, location: r.headers.get("location"), canon, fuites });
  } catch (e) {
    resultats.push({ chemin, statut: 0, ms: Date.now() - t0, erreur: String(e?.message ?? e) });
  }
}
async function ouvrier() {
  while (i < chemins.length) {
    const c = chemins[i++];
    await un(c);
    if (resultats.length % 250 === 0) console.log(`${resultats.length}/${chemins.length}`);
  }
}
await Promise.all(Array.from({ length: PAR }, ouvrier));

const parStatut = {};
for (const r of resultats) parStatut[r.statut] = (parStatut[r.statut] ?? 0) + 1;
const lents = [...resultats].sort((a, b) => b.ms - a.ms).slice(0, 15);
const synthese = {
  base: BASE, hotesSitemap, total: resultats.length, parStatut,
  enEchec: resultats.filter((r) => r.statut === 0 || r.statut >= 400),
  fuites: resultats.filter((r) => r.fuites?.length),
  canonAutreHote: resultats.filter((r) => r.canon && !r.canon.startsWith("https://riftboundfrance.fr")),
  lents,
  msMedian: [...resultats].map((r) => r.ms).sort((a, b) => a - b)[Math.floor(resultats.length / 2)],
};
writeFileSync(args.out ?? "http.json", JSON.stringify({ synthese, resultats }, null, 1));
console.log(JSON.stringify({ ...synthese, enEchec: synthese.enEchec.slice(0, 40), fuites: synthese.fuites.slice(0, 20), canonAutreHote: synthese.canonAutreHote.slice(0, 10) }, null, 1));
