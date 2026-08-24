// Balayage responsive : chaque URL x chaque taille d'écran, mesures dans la page.
//
// À lancer contre un BUILD DE PRODUCTION, pas contre `next dev` : quatre onglets en
// parallèle sur le serveur de développement le mettent à genoux (chaque route se
// recompile, puis plus rien ne répond). Marche à suivre :
//
//   npx next build && npx next start -p 3001
//   npm i playwright  (hors dépôt : dans un dossier de travail)  puis
//   node scripts/audit-responsive.mjs --base http://localhost:3001 --urls urls.txt --out ./audit
//
// `urls.txt` = une URL par ligne, tirée de /sitemap.xml (5 124 adresses : on garde
// toutes les pages uniques + 2-3 exemples par route dynamique). Les pages connectées
// demandent `--cookie <valeur riftbound_session>`, signée par
// `npx tsx --env-file=.env scripts/cookie-session-local.ts`.
//
// Le rapport sort dans <out>/rapport.json, les captures dans <out>/captures/.
// Rien n'est deviné : tout est mesuré dans la page (getBoundingClientRect,
// getComputedStyle), y compris le menu mobile, qu'on ouvre pour de vrai.
import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { extraireCheminsSitemap, interactionAutorisee } from "./audit-responsive-lib.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, t) => (a.startsWith("--") ? [a.slice(2), t[i + 1]] : [])).filter(Boolean),
);
const BASE = args.base ?? "http://localhost:3000";
const URLS = args.urls
  ? [...new Set(readFileSync(args.urls, "utf8").split("\n").map((l) => l.trim()).filter(Boolean))]
  : extraireCheminsSitemap(await (await fetch(`${BASE}/sitemap.xml`)).text(), BASE);
const TAG = args.tag ?? "avant";
const OUT = args.out ?? `./audit-${TAG}`;
const COOKIE = args.cookie ?? process.env.SESSION_COOKIE ?? "";
const TESTER_INTERACTIONS = args.interactions !== "false";
mkdirSync(join(OUT, "captures"), { recursive: true });

const ECRANS = [
  { nom: "desktop-1440x900", width: 1440, height: 900, mobile: false },
  { nom: "tablette-768x1024", width: 768, height: 1024, mobile: false },
  { nom: "mobile-430x932", width: 430, height: 932, mobile: true },
  { nom: "mobile-375x812", width: 375, height: 812, mobile: true },
];

// Tout se mesure dans la page : une supposition sur une classe Tailwind ne prouve rien.
const MESURES = () => {
  const W = window.innerWidth;
  const visible = (el, r) => {
    const s = getComputedStyle(el);
    return (
      r.width > 0 && r.height > 0 &&
      s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0" &&
      el.getAttribute("aria-hidden") !== "true"
    );
  };
  // `sr-only` est un carré de 1 px volontairement rogné, réservé aux lecteurs
  // d'écran. Sans cette exception, le lien « Aller au contenu » sortait 172 fois
  // en « cible trop petite » et en « texte coupé ».
  const pourLecteurEcran = (el) =>
    el.closest('.sr-only, [class*="sr-only"]') !== null;

  const decrire = (el) => {
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase(),
      classe: (el.getAttribute("class") ?? "").slice(0, 110),
      id: el.id || undefined,
      texte: (el.textContent ?? "").trim().slice(0, 60),
      x: Math.round(r.x), y: Math.round(r.y),
      w: Math.round(r.width), h: Math.round(r.height),
      droite: Math.round(r.right),
    };
  };
  // Un conteneur qui défile à l'horizontale est voulu (tableau large, rail d'onglets) :
  // ce qui déborde à l'intérieur n'est pas un défaut de mise en page.
  const dansDefilementH = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === "auto" || ox === "scroll") return true;
    }
    return false;
  };

  const tous = [...document.querySelectorAll("body *")];
  const debordants = [];
  for (const el of tous) {
    const r = el.getBoundingClientRect();
    if (!visible(el, r)) continue;
    if (r.right <= W + 1 && r.left >= -1) continue;
    if (dansDefilementH(el)) continue;
    const s = getComputedStyle(el);
    if (s.position === "fixed" && r.right <= 0) continue; // tiroir rangé hors écran
    // Seul le plus haut de la chaîne compte : sinon un seul défaut sort cinquante fois.
    if (debordants.some((d) => d.el.contains(el))) continue;
    debordants.push({ el, info: decrire(el) });
  }

  const petitesCibles = [];
  for (const el of document.querySelectorAll('a, button, input, select, [role="button"], [role="tab"]')) {
    const r = el.getBoundingClientRect();
    if (!visible(el, r)) continue;
    if (el.closest('[aria-hidden="true"]') || pourLecteurEcran(el)) continue;
    const type = el.getAttribute("type");
    if (type === "hidden") continue;
    // Un lien au fil du texte est exclu de la règle des 24 px (WCAG 2.2, exception
    // « inline ») : on ne peut pas agrandir un mot au milieu d'une phrase.
    const dansUnePhrase =
      el.tagName === "A" &&
      getComputedStyle(el).display.startsWith("inline") &&
      el.closest("p, li, td, dd, dt, h1, h2, h3, h4, h5, h6, blockquote");
    if (dansUnePhrase) continue;
    // Une case à cocher de 16 px enveloppée dans son `<label>` se clique sur tout
    // le libellé : c'est le label qu'il faut mesurer. Sans ça, les six cases du
    // tableau de bord d'overlay sortaient comme trop petites alors que leur cible
    // fait 44 px.
    const etiquette = el.closest("label");
    if (etiquette && etiquette !== el) {
      const re = etiquette.getBoundingClientRect();
      if (re.width >= 24 && re.height >= 24) continue;
    }
    if (r.width < 24 || r.height < 24) petitesCibles.push(decrire(el));
  }

  const texteCoupe = [];
  for (const el of tous) {
    const r = el.getBoundingClientRect();
    if (!visible(el, r)) continue;
    if (pourLecteurEcran(el)) continue;
    const s = getComputedStyle(el);
    if (s.overflowX !== "hidden" && s.overflow !== "hidden") continue;
    if (s.textOverflow === "ellipsis") continue;
    if (s.webkitLineClamp && s.webkitLineClamp !== "none") continue;
    if (el.scrollWidth <= el.clientWidth + 2) continue;
    const propre = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 2);
    if (!propre) continue;
    texteCoupe.push({ ...decrire(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });
  }

  const medias = [];
  for (const el of document.querySelectorAll("img, video, iframe, canvas, svg")) {
    const r = el.getBoundingClientRect();
    if (!visible(el, r)) continue;
    if (r.width > W + 1 || r.right > W + 1) medias.push(decrire(el));
  }

  // Un bandeau collé en haut qui mange le tiers de l'écran d'un téléphone rend la page
  // inutilisable : on mesure sa hauteur plutôt que de la deviner.
  const colles = [];
  for (const el of tous) {
    if (el.matches('[role="dialog"], [aria-modal="true"]') || el.querySelector('[role="dialog"], [aria-modal="true"]')) continue;
    const s = getComputedStyle(el);
    if (s.position !== "fixed" && s.position !== "sticky") continue;
    const r = el.getBoundingClientRect();
    if (!visible(el, r)) continue;
    // Un bandeau qui a grandi parce qu'on vient d'ouvrir SON menu n'est pas un
    // bandeau qui mange l'écran : le balayage clique le bouton, puis mesurait la
    // barre déployée. Trente-quatre faux constats venaient de là.
    if (el.querySelector('[aria-expanded="true"]')) continue;
    // Une colonne de sommaire collée est voulue sur grand écran ; elle ne gêne
    // que sur un téléphone, où elle mange l'écran.
    if (W < 700 && r.height >= window.innerHeight * 0.3) {
      colles.push({ ...decrire(el), position: s.position });
    }
  }

  return {
    largeurDoc: document.documentElement.scrollWidth,
    largeurVue: W,
    debordementH: document.documentElement.scrollWidth - W,
    debordants: debordants.map((d) => d.info).slice(0, 12),
    petitesCibles: petitesCibles.slice(0, 12),
    texteCoupe: texteCoupe.slice(0, 12),
    medias: medias.slice(0, 8),
    colles: colles.slice(0, 5),
  };
};

const nomFichier = (url, ecran) =>
  `${url.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "accueil"}--${ecran}.png`;

const LIBELLE_CLIC_SUR = /menu|outils|filtre|affichage|vue |statistiques|comparer|différences|côte à côte|tout ouvrir|tout fermer|importer|mon deck|modifier le profil|nouveau classeur|gérer le classeur|annuler|fermer|réinitialiser|réessayer|précédent|suivant/i;
const ROUTE_SANS_INTERACTION = /^\/(?:overlay|compagnon|profil\/overlay)(?:\/|$)/;
const ROUTE_SELECT_SURE = /^\/(?:cartes|decks|meta|tournois|guides\/glossaire|deckbuilder)(?:\/|$)/;

const problemesMesures = (mesures) => {
  const soucis = [];
  if (mesures.debordementH > 1) soucis.push(`débordement horizontal de ${mesures.debordementH}px`);
  if (mesures.debordants.length) soucis.push(`${mesures.debordants.length} élément(s) hors cadre`);
  if (mesures.petitesCibles.length) soucis.push(`${mesures.petitesCibles.length} cible(s) < 24px`);
  if (mesures.texteCoupe.length) soucis.push(`${mesures.texteCoupe.length} texte(s) coupé(s)`);
  if (mesures.medias.length) soucis.push(`${mesures.medias.length} média(s) trop large(s)`);
  if (mesures.colles.length) soucis.push(`${mesures.colles.length} élément(s) collé(s) haut(s)`);
  return soucis;
};

async function auditerInteractions(page, url, ecran) {
  if (!TESTER_INTERACTIONS || ROUTE_SANS_INTERACTION.test(url)) return [];
  const resultats = [];
  const controles = page.locator('button:not([disabled]), [role="tab"], summary');
  const vus = new Set();
  for (let i = 0, n = await controles.count(); i < n; i++) {
    const controle = controles.nth(i);
    if (!(await controle.isVisible().catch(() => false))) continue;
    if ((await controle.getAttribute("type")) === "submit") continue;
    const libelle = ((await controle.getAttribute("aria-label")) ?? (await controle.innerText().catch(() => ""))).trim();
    const estOnglet = (await controle.getAttribute("role")) === "tab";
    if (!libelle || vus.has(libelle) || !interactionAutorisee(libelle)) continue;
    if (!estOnglet && !LIBELLE_CLIC_SUR.test(libelle)) continue;
    vus.add(libelle);
    await controle.click().catch(() => {});
    await page.waitForTimeout(180);
    const mesures = await page.evaluate(MESURES);
    const soucis = problemesMesures(mesures);
    const capture = soucis.length
      ? `interaction-${nomFichier(`${url}-${libelle}`, ecran.nom)}`
      : null;
    if (capture) await page.screenshot({ path: join(OUT, "captures", capture), fullPage: true }).catch(() => {});
    resultats.push({ type: estOnglet ? "onglet" : "bouton", libelle, soucis, mesures, capture });
    await page.keyboard.press("Escape").catch(() => {});
  }

  if (ROUTE_SELECT_SURE.test(url)) {
    const selects = page.locator("select:not([disabled])");
    for (let i = 0, n = await selects.count(); i < n; i++) {
      const select = selects.nth(i);
      if (!(await select.isVisible().catch(() => false))) continue;
      const options = await select.locator("option:not([disabled])").evaluateAll((els) => els.map((el) => el.value));
      const valeur = options.find((v) => v !== "" && v !== "all");
      if (valeur === undefined) continue;
      const libelle = (await select.getAttribute("aria-label")) ?? (await select.getAttribute("name")) ?? `select-${i + 1}`;
      await select.selectOption(valeur).catch(() => {});
      await page.waitForTimeout(220);
      const mesures = await page.evaluate(MESURES);
      const soucis = problemesMesures(mesures);
      const capture = soucis.length
        ? `interaction-${nomFichier(`${url}-${libelle}`, ecran.nom)}`
        : null;
      if (capture) await page.screenshot({ path: join(OUT, "captures", capture), fullPage: true }).catch(() => {});
      resultats.push({ type: "select", libelle, soucis, mesures, capture });
    }
  }
  return resultats;
}

const rapport = [];
const navigateur = await chromium.launch();

for (const ecran of ECRANS) {
  const contexte = await navigateur.newContext({
    viewport: { width: ecran.width, height: ecran.height },
    isMobile: ecran.mobile,
    hasTouch: ecran.mobile,
    deviceScaleFactor: 1,
  });
  if (COOKIE) {
    await contexte.addCookies([
      { name: "riftbound_session", value: COOKIE, domain: "localhost", path: "/" },
    ]);
  }
  for (const url of URLS) {
    const page = await contexte.newPage();
    const erreursConsole = [];
    const requetesRatees = [];
    page.on("console", (m) => { if (m.type() === "error") erreursConsole.push(m.text().slice(0, 200)); });
    page.on("pageerror", (e) => erreursConsole.push(`pageerror: ${String(e).slice(0, 200)}`));
    // Next précharge les liens ; fermer la page annule ces requêtes. Un
    // `ERR_ABORTED` sur un préchargement n'est pas une panne, c'était 166 faux
    // constats sur 172 passages.
    page.on("requestfailed", (r) => {
      const abandon = r.failure()?.errorText === "net::ERR_ABORTED";
      if (abandon) return;
      requetesRatees.push(`${r.method()} ${r.url().slice(0, 120)} — ${r.failure()?.errorText}`);
    });
    page.on("response", (r) => { if (r.status() >= 400) requetesRatees.push(`${r.status()} ${r.url().slice(0, 120)}`); });

    let statut = null;
    try {
      const rep = await page.goto(BASE + url, { waitUntil: "domcontentloaded", timeout: 45000 });
      statut = rep?.status() ?? null;
      await page.waitForLoadState("networkidle", { timeout: 1500 }).catch(() => {});
      await page.waitForTimeout(400);
    } catch (e) {
      rapport.push({ url, ecran: ecran.nom, erreurChargement: String(e).slice(0, 200) });
      await page.close();
      continue;
    }

    const mesures = await page.evaluate(MESURES);

    // Menu mobile : on l'ouvre pour de vrai, sinon on ne mesure qu'une page à moitié.
    let menu = null;
    if (ecran.mobile) {
      const bouton = page.locator('button[aria-label]').filter({ hasText: "" });
      const cibles = await page.$$('button[aria-label]');
      for (const b of cibles) {
        const label = ((await b.getAttribute("aria-label")) ?? "").toLowerCase();
        if (!/menu/.test(label)) continue;
        await b.click().catch(() => {});
        await page.waitForTimeout(350);
        menu = await page.evaluate(MESURES);
        menu.ouvert = true;
        break;
      }
      void bouton;
    }

    const interactions = await auditerInteractions(page, url, ecran);
    const soucis = problemesMesures(mesures);
    if (menu && menu.debordementH > 1) soucis.push(`menu ouvert : débordement de ${menu.debordementH}px`);
    const soucisInteractions = interactions.flatMap((interaction) =>
      interaction.soucis.map((souci) => `${interaction.type} « ${interaction.libelle} » : ${souci}`),
    );
    soucis.push(...soucisInteractions);
    if (erreursConsole.length) soucis.push(`${erreursConsole.length} erreur(s) console`);
    if (requetesRatees.length) soucis.push(`${requetesRatees.length} requête(s) en échec`);

    let capture = null;
    if (soucis.length) {
      capture = nomFichier(url, ecran.nom);
      await page.screenshot({ path: join(OUT, "captures", capture), fullPage: true }).catch(() => {});
    }

    rapport.push({ url, ecran: ecran.nom, statut, soucis, mesures, menu, interactions, erreursConsole, requetesRatees, capture });
    await page.close();
  }
  await contexte.close();
}

await navigateur.close();
writeFileSync(join(OUT, "rapport.json"), JSON.stringify(rapport, null, 1));

const avecSoucis = rapport.filter((r) => (r.soucis?.length ?? 0) > 0 || r.erreurChargement);
console.log(`${rapport.length} passages (${URLS.length} URL x ${ECRANS.length} écrans), ${avecSoucis.length} avec constat`);
for (const r of avecSoucis) console.log(`  ${r.ecran}  ${r.url}  ${r.erreurChargement ?? r.soucis.join(" · ")}`);
