// Passage navigateur : chaque modèle de page (statiques + 3 exemples par route dynamique),
// en français, anglais, et chinois pour l'overlay. Mesure ce qu'un changement
// d'hébergement casse : erreurs JS, refus CSP, ressources en échec, images mortes,
// liens vers un autre hôte. Google Analytics est coupé pour ne pas fausser les visites.
// node audit-bascule-pages.mjs --base https://essai.riftboundfrance.fr --out pages.json [--extra /d/<code>]
// Demande playwright-core, installé HORS du dépôt (comme audit-responsive.mjs) : copier
// ce fichier dans un dossier de travail, `npm i playwright-core`, lancer depuis là. Le
// Chromium vient de %LOCALAPPDATA%/ms-playwright (`--exe` pour un autre). Sous Git Bash,
// préfixer MSYS_NO_PATHCONV=1, sinon « /d/… » devient « D:/… ».
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, t) => (a.startsWith("--") ? [a.slice(2), t[i + 1]] : [])).filter(Boolean),
);
const BASE = (args.base ?? "https://riftboundfrance.fr").replace(/\/$/, "");
const HOTE = new URL(BASE).host;
const PAR = Number(args.par ?? 2);
const EXE = args.exe ?? join(process.env.LOCALAPPDATA, "ms-playwright", "chromium_headless_shell-1248", "chrome-headless-shell-win64", "chrome-headless-shell.exe");

const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
// Les versions /en et /zh se reconstruisent plus bas depuis le français : les garder ici
// donnait des /en/en/… en 404.
const chemins = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))]
  .filter((c) => !/^\/(en|zh)(\/|$)/.test(c));
// Un modèle = le premier segment, plus « [x] » s'il y a un second segment.
const parModele = new Map();
for (const c of chemins) {
  const s = c.split("/").filter(Boolean);
  const modele = s.length <= 1 || ["guides", "outils"].includes(s[0]) ? c : `/${s[0]}/[x]`;
  if (!parModele.has(modele)) parModele.set(modele, []);
  parModele.get(modele).push(c);
}
const fr = [];
for (const [modele, liste] of parModele) {
  if (modele.includes("[x]")) {
    // Le premier, celui du milieu, le dernier : les plus anciens et les plus récents.
    fr.push(...new Set([liste[0], liste[Math.floor(liste.length / 2)], liste[liste.length - 1]]));
  } else fr.push(...liste);
}
// Pages hors sitemap, mais servies.
fr.push("/a-propos", "/deckbuilder", "/decks/compare", "/outils/tier-list", "/community-decks", "/offline", "/admin/login",
  "/decks?cat=bestof", "/decks?legales=1", "/profil/overlay", ...(args.extra ? args.extra.split(",") : []));
const urls = [...new Set([
  ...fr,
  ...fr.filter((c) => !c.startsWith("/admin")).map((c) => (c === "/" ? "/en" : `/en${c}`)),
  "/zh", "/zh/profil/overlay", "/zh/tier-list",
])];

const navigateur = await chromium.launch({ executablePath: EXE });
const ctx = await navigateur.newContext({ viewport: { width: 1440, height: 900 }, userAgent: undefined });
await ctx.route(/google-analytics\.com|googletagmanager\.com|doubleclick\.net/, (r) => r.abort());
await ctx.addInitScript(() => {
  window.__csp = [];
  document.addEventListener("securitypolicyviolation", (e) => {
    window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`);
  });
});

const resultats = [];
let i = 0;
async function un(chemin) {
  const page = await ctx.newPage();
  const r = { chemin, console: [], js: [], echecs: [], http4xx5xx: [] };
  page.on("console", (m) => { if (m.type() === "error") r.console.push(m.text().slice(0, 300)); });
  page.on("pageerror", (e) => r.js.push(String(e.message).slice(0, 300)));
  page.on("requestfailed", (q) => {
    const u = q.url();
    if (/google-analytics|googletagmanager|doubleclick/.test(u)) return;
    const err = q.failure()?.errorText ?? "";
    // Next annule les préchargements de liens quand la page change : pas une panne.
    if (err === "net::ERR_ABORTED" && /_rsc=|\?_rsc/.test(u)) return;
    r.echecs.push(`${err} ${u.slice(0, 200)}`);
  });
  page.on("response", (s) => {
    if (s.status() >= 400 && !/google-analytics|googletagmanager/.test(s.url())) r.http4xx5xx.push(`${s.status()} ${s.url().slice(0, 200)}`);
  });
  const t0 = Date.now();
  try {
    const rep = await page.goto(BASE + chemin, { waitUntil: "load", timeout: 45000 });
    r.statut = rep?.status() ?? 0;
    r.urlFinale = page.url();
    await page.waitForTimeout(1500);
    Object.assign(r, await page.evaluate((hote) => {
      const imgs = [...document.images].filter((im) => im.complete && im.naturalWidth === 0 && im.currentSrc);
      const autres = [...document.querySelectorAll("a[href]")]
        .map((a) => a.href)
        .filter((h) => /^https?:/.test(h))
        .map((h) => new URL(h))
        // Un lien absolu vers riftboundfrance.fr est normal, même depuis essai.* : il vient
        // de NEXT_PUBLIC_SITE_URL. Seuls un hôte interne ou du http:// trahissent l'hébergeur.
        .filter((u) => (/localhost|127\.0\.0\.1|0\.0\.0\.0|178\.104\.237\.33/.test(u.host) && !hote.includes("localhost")) || (/riftboundfrance/.test(u.host) && u.protocol !== "https:"))
        .map((u) => u.href);
      const og = document.querySelector('meta[property="og:url"]')?.content ?? null;
      const ogImg = document.querySelector('meta[property="og:image"]')?.content ?? null;
      return {
        csp: window.__csp,
        imagesMortes: [...new Set(imgs.map((im) => im.currentSrc.slice(0, 200)))],
        liensHote: [...new Set(autres)].slice(0, 10),
        og, ogImg,
        titre: document.title.slice(0, 80),
      };
    }, HOTE));
  } catch (e) {
    r.statut = 0;
    r.erreur = String(e?.message ?? e).slice(0, 300);
  }
  r.ms = Date.now() - t0;
  await page.close();
  resultats.push(r);
}
async function ouvrier() {
  while (i < urls.length) await un(urls[i++]);
}
await Promise.all(Array.from({ length: PAR }, ouvrier));
await navigateur.close();

const aProbleme = resultats.filter((r) => r.statut === 0 || r.statut >= 400 || r.console.length || r.js.length || r.echecs.length || r.http4xx5xx.length || r.csp?.length || r.imagesMortes?.length || r.liensHote?.length);
writeFileSync(args.out ?? "pages.json", JSON.stringify({ base: BASE, total: resultats.length, modeles: [...parModele.keys()], aProbleme, resultats }, null, 1));
console.log(`pages ${resultats.length}, avec un problème ${aProbleme.length}`);
for (const r of aProbleme) {
  console.log(`\n${r.statut} ${r.chemin} (${r.ms} ms)`);
  for (const k of ["erreur", "js", "console", "csp", "echecs", "http4xx5xx", "imagesMortes", "liensHote"]) {
    const v = r[k];
    if (v && (!Array.isArray(v) || v.length)) console.log(`  ${k}: ${JSON.stringify(Array.isArray(v) ? v.slice(0, 4) : v)}`);
  }
}
