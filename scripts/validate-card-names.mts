/**
 * Validateur de NOMS DE CARTES cités dans les docs de connaissance / insights.
 *
 * Pourquoi : les VOD passent par Whisper qui massacre les noms propres (« Aurelia »
 * pour Irelia, « Mind Splitter » pour Mindsplitter, « Cold Shot » pour Called Shot…).
 * Ce script confronte chaque nom de carte cité (en **gras** ou en `code`) à la vraie
 * base de cartes et liste les suspects AVEC la correction la plus probable.
 *
 * Usage :
 *   npx tsx scripts/validate-card-names.mts [fichier1.md fichier2.md ...]
 *   (défaut : META-KNOWLEDGE.md, DECKBUILDING-RULES.md, data/video-insights/*.md)
 *
 * Sort en code 1 s'il reste des suspects (peut servir de garde-fou avant commit/seed).
 * À LANCER après toute analyse VOD avant de figer la connaissance (cf. VIDEO-ANALYSIS-PROMPT.md).
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

const norm = (s: string) =>
  s.toLowerCase().replace(/[''`’]/g, "'").replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();

// Mots FR / termes de jeu / sets / villes-tournois qui ne sont PAS des noms de cartes → ignorés.
const STOP = new Set([
  "the","of","and","to","a","an","in","on","for","with","vs","set","tier","aggro","control","hold",
  "midrange","tempo","combo","ramp","wipe","draw","showdown","conquer","gear","spell","unit","battlefield",
  "rune","power","energy","might","ganking","ambush","deflect","backline","assault","hunt","reaction","action",
  // sets / villes / méta / sections (souvent en gras dans META/DECKBUILDING)
  "origins","spiritforged","unleashed","vendetta","changsha","tianjin","vancouver","utrecht","hartford",
  "sydney","suzhou","fuzhou","bologna","lille","atlanta","houston","vegas","xian","shenzhen","nanjing",
  "core","flex","standard","tech","won","finalist","playoffs","regional","open","national","challenge",
  "meta","pattern","observations","placements","sorts","unites","erreurs","faiblesse","identite","forces",
  "deathknell","deck","decks","cards","cartes","factor",
]);
const FR = /[éèêëàâçùûôîïœ]|(^| )(le|la|les|des|du|un|une|pour|avec|tout|toute|sans|dans|qui|que|son|sa|ses|via|plus|moins|très|deck|cartes?|jeu|game|favori|matchup|win|cons|nerf|bo1|aussi|déjà|cette)( |$)/i;

function isCandidate(raw: string): boolean {
  const t = raw.trim();
  if (t.length < 4 || t.length > 48) return false;
  if (/[\d()]/.test(t)) return false;                            // chiffres / parenthèses = pas un nom de carte
  if (FR.test(" " + t.toLowerCase() + " ")) return false;       // contient du français → prose
  if (/[<>≥≤→/×%=~+]|--|»|«|:| vs |sous-/i.test(t)) return false; // ponctuation de prose / flèches / comparaisons
  if (/\b(errata|attendue|performe|untimed|take-back|brush|combat)\b/i.test(t)) return false;
  if (!/^[A-Z]/.test(t)) return false;                            // un nom de carte commence par une majuscule
  const words = t.split(/\s+/);
  if (words.length > 5) return false;
  if (words.every((w) => STOP.has(w.toLowerCase())))  return false;
  // au moins un mot "significatif" hors stopwords
  if (!words.some((w) => !STOP.has(w.toLowerCase()) && w.length >= 4)) return false;
  return true;
}

function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}

const cards = await prisma.card.findMany({ select: { name: true, cleanName: true } });
const realSet = new Set<string>();
const realArr: string[] = [];
const realDisplay = new Map<string, string>(); // norm -> nom d'affichage (vraie casse DB)
const add = (v: string | null, display?: string) => {
  if (!v) return;
  const n = norm(v).replace(/ \(.*\)$/, ""); // retire « (Metal) », « (Alternate Art) »…
  if (n && !realSet.has(n)) { realSet.add(n); realArr.push(n); realDisplay.set(n, display ?? v); }
};
for (const c of cards) { add(c.name, c.name); add(c.cleanName, c.name); }
// Recoupe aussi la liste canonique de cartes BANNIES (savoir déjà établi) : une carte
// bannie reste un nom valide à reconnaître (cf. src/lib/banned-cards.ts).
try {
  const ban = readFileSync("src/lib/banned-cards.ts", "utf8");
  for (const m of ban.matchAll(/"([^"]+)"/g)) add(m[1], m[1]);
} catch { /* optionnel */ }

function matches(cand: string): boolean {
  const c = norm(cand);
  if (!c) return true;
  if (realSet.has(c)) return true;
  for (const r of realArr) {
    if (Math.min(r.length, c.length) < 4) continue;
    if (r.includes(c) || c.includes(r)) return true;
  }
  return false;
}
function suggestDist(cand: string): { display: string; dist: number } | null {
  const c = norm(cand);
  let best: string | null = null, bd = Infinity;
  for (const r of realArr) {
    const d = lev(c, r);
    if (d < bd) { bd = d; best = r; }
  }
  if (!best || bd > Math.max(2, Math.floor(c.length * 0.34))) return null;
  return { display: realDisplay.get(best) ?? best, dist: bd };
}
function suggest(cand: string): string | null {
  return suggestDist(cand)?.display ?? null;
}

// Fichiers à scanner. Défaut = docs dérivés des VOD (matière Whisper = le vrai risque).
// META/DECKBUILDING contiennent beaucoup de gras non-cartes → les passer en argument si besoin.
// --fix : auto-corrige les noms à haute confiance (distance <= 2) dans les fichiers.
let argv = process.argv.slice(2);
const FIX = argv.includes("--fix");
argv = argv.filter((a) => a !== "--fix");
let files = argv;
if (files.length === 0) {
  files = [];
  const dir = "data/video-insights";
  if (existsSync(dir)) for (const f of readdirSync(dir)) if (f.endsWith(".md")) files.push(join(dir, f));
  if (files.length === 0) files = ["META-KNOWLEDGE.md", "DECKBUILDING-RULES.md"];
}

let totalSuspects = 0;
let totalFixed = 0;
for (const f of files) {
  if (!existsSync(f)) { console.log(`(absent) ${f}`); continue; }
  let txt = readFileSync(f, "utf8");
  const cands = new Set<string>();
  for (const m of txt.matchAll(/\*\*(.+?)\*\*/g)) cands.add(m[1]);
  for (const m of txt.matchAll(/`([^`]+)`/g)) cands.add(m[1]);
  const suspects: string[] = [];
  const fixes: string[] = [];
  for (const c of cands) {
    if (!isCandidate(c)) continue;
    if (matches(c)) continue;
    const sd = suggestDist(c);
    // Auto-fix UNIQUEMENT les corrections haute confiance (distance <= 2) en mode --fix.
    if (FIX && sd && sd.dist <= 2 && sd.display.toLowerCase() !== c.toLowerCase()) {
      txt = txt.split(c).join(sd.display);
      fixes.push(`${c} → ${sd.display}`);
      continue;
    }
    suspects.push(sd ? `${c}  →  « ${sd.display} » ?` : `${c}  (aucune carte proche)`);
  }
  if (FIX && fixes.length) { writeFileSync(f, txt, "utf8"); totalFixed += fixes.length; }
  if (fixes.length) {
    console.log(`\n### ${f} — ${fixes.length} corrigé(s) auto`);
    for (const x of [...new Set(fixes)].sort()) console.log("  ✎ " + x);
  }
  if (suspects.length) {
    totalSuspects += suspects.length;
    console.log(`\n### ${f} — ${suspects.length} suspect(s) restant(s)`);
    for (const s of [...new Set(suspects)].sort()) console.log("  - " + s);
  } else if (!fixes.length) {
    console.log(`✅ ${f} — aucun nom suspect`);
  }
}

if (totalFixed) console.log(`\n✎ ${totalFixed} nom(s) auto-corrigé(s) (distance <= 2).`);
console.log(`${totalSuspects === 0 ? "✅ Tout est clean." : `⚠️ ${totalSuspects} suspect(s) à vérifier manuellement (Whisper ? fournir un lien web).`}`);
await prisma.$disconnect();
process.exit(totalSuspects === 0 ? 0 : 1);
