// Mesure ce qui reste en français sur la version anglaise.
//
// On lit les pages RENDUES, pas le code : le dictionnaire rend le français quand une
// phrase n'est pas traduite, donc le seul relevé fiable est le HTML servi. Lire les
// sources ne voit ni le contenu venu de la base ni celui des fichiers de données.
//
// Usage (serveur de dev lancé) :
//   node scripts/audit-version-anglaise.mjs / /guides/debuter /legendes/annie-dark-child
// Sous Git Bash, préfixer par MSYS_NO_PATHCONV=1 (sinon « / » devient un chemin).
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const BASE = process.env.BASE ?? "http://localhost:3000";

// Mots qui n'existent qu'en français. Volontairement courts et fréquents : ils
// suffisent à repérer une phrase entière restée en français.
const MOTS_FR = [
  "les", "des", "une", "vous", "votre", "pour", "dans", "avec", "est", "sont",
  "qui", "cette", "aux", "leur", "sans", "chaque", "peut", "avant", "après",
  "toutes", "tous", "elle", "nous", "notre", "ses", "ces", "faire", "être",
  "plutôt", "déjà", "encore", "jamais", "toujours", "beaucoup", "carte", "cartes",
  "jeu", "deck de", "joueur", "joueurs", "règles", "domaine", "domaines",
];

export function texteVisible(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function phrasesFrancaises(texte) {
  const phrases = texte.split(/(?<=[.!?:])\s+/);
  const trouvees = [];
  for (const phrase of phrases) {
    const mots = phrase.toLowerCase().match(/[a-zàâäéèêëîïôöùûüçœ']+/g) ?? [];
    if (mots.length < 4) continue;
    const fr = mots.filter((m) => MOTS_FR.includes(m)).length;
    if (fr >= 2) trouvees.push(phrase.trim().slice(0, 150));
  }
  return trouvees;
}

export async function auditerRoutes(routes, base = BASE) {
  let echec = false;
  for (const route of routes) {
    try {
      const r = await fetch(`${base}/en${route}`, { headers: { "Accept-Language": "en" } });
      if (!r.ok) {
        console.log(`${route}\tHTTP ${r.status}`);
        echec = true;
        continue;
      }
      const phrases = phrasesFrancaises(texteVisible(await r.text()));
      // On dédoublonne : navigation et pied de page reviennent sur chaque page.
      const uniques = [...new Set(phrases)];
      console.log(`\n=== ${route} — ${uniques.length} phrase(s) en français`);
      for (const p of uniques.slice(0, 12)) console.log("   · " + p);
      if (uniques.length > 0) echec = true;
    } catch (e) {
      console.log(`${route}\tERREUR ${e.message}`);
      echec = true;
    }
  }
  return echec;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href
  && await auditerRoutes(process.argv.slice(2))) {
  process.exitCode = 1;
}
