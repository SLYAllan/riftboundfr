// node appliquer-prose.mjs <scratch> [--ecrire] : contrôle les propositions, puis les pose.
import fs from "node:fs";
import path from "node:path";

const [scratch, ...reste] = process.argv.slice(2);
const ecrire = reste.includes("--ecrire");
const dossierProp = path.join(scratch, "propositions");
const fichiers = fs.readdirSync(dossierProp).filter((f) => f.endsWith(".json"));

const prose = JSON.parse(fs.readFileSync("data/fiches-prose.json", "utf8"));
let guides = fs.readFileSync("src/lib/legend-guides.ts", "utf8");
let fautes = 0;
const faute = (slug, m) => { fautes++; console.log(`  FAUTE ${slug} : ${m}`); };

for (const f of fichiers) {
  const p = JSON.parse(fs.readFileSync(path.join(dossierProp, f), "utf8"));
  const pack = JSON.parse(fs.readFileSync(path.join(scratch, "packs", f), "utf8"));
  const slug = p.slug;
  if (slug !== f.replace(".json", "")) faute(f, "slug ne correspond pas au fichier");
  const terrains = (pack.fiche.topBattlefields ?? []).map((t) => t.replace(/\s*\(.*\)$/, ""));
  const jouees = new Set([pack.legende, ...pack.fiche.keyCards.map((k) => k.name), ...Object.keys(pack.fiche.champions), ...terrains]);
  const mortes = pack.cartes.filter((c) => !c.jouee_en_radiance && !jouees.has(c.nom)).map((c) => c.nom);

  const texteProse = JSON.stringify(p.prose);
  const texteGuide = [p.guide.bref, p.guide.gagne, p.guide.plan].join("\n");
  for (const m of texteGuide.matchAll(/\[\[([^\]]+)\]\]/g)) if (!jouees.has(m[1])) faute(slug, `carte du guide hors listes Radiance : ${m[1]}`);
  for (const n of mortes) if ((texteProse + texteGuide).includes(n)) faute(slug, `carte plus jouée encore citée : ${n}`);
  if (/[—–]/.test(texteProse + texteGuide)) faute(slug, "tiret cadratin ou demi-cadratin");
  if (/`|\$\{/.test(texteGuide)) faute(slug, "backtick ou ${ dans le guide");
  if (p.prose.legendAbility !== pack.prose_actuelle.legendAbility) faute(slug, "legendAbility modifié");
  if (/Vendetta|Stacked Deck/.test(texteProse + texteGuide)) faute(slug, "cite encore Vendetta ou Stacked Deck");
  const cr = pack.fiche.competitiveResults;
  console.log(`${slug} : ${cr.joueursClasses} joueurs, ${cr.coupe10} en tête, ${cr.titres} titre(s), ${cr.conversion}`);
  console.log(`  chiffres cités : ${[...new Set((texteProse + texteGuide).match(/\d[\d  ]*(?:,\d+)?\s?%?/g) ?? [])].map((x) => x.trim()).join(" | ")}`);

  if (!ecrire) continue;
  prose[`${slug}.json`] = p.prose;
  const debut = guides.indexOf(`  "${slug}": {`);
  if (debut < 0) { faute(slug, "guide introuvable dans legend-guides.ts"); continue; }
  const fin = guides.indexOf("\n  },", debut);
  let bloc = guides.slice(debut, fin);
  for (const champ of ["bref", "gagne", "plan"]) {
    const tete = `    ${champ}: \``;
    const i = bloc.indexOf(tete);
    if (i < 0) { faute(slug, `champ ${champ} introuvable`); continue; }
    const j = bloc.indexOf("`,", i + tete.length);
    bloc = bloc.slice(0, i + tete.length) + p.guide[champ] + bloc.slice(j);
  }
  guides = guides.slice(0, debut) + bloc + guides.slice(fin);
}

if (fautes) { console.log(`\n${fautes} faute(s) : rien n'est écrit.`); process.exit(1); }
if (ecrire) {
  fs.writeFileSync("data/fiches-prose.json", JSON.stringify(prose, null, 2) + "\n");
  fs.writeFileSync("src/lib/legend-guides.ts", guides);
  console.log(`\n${fichiers.length} Légende(s) posées dans fiches-prose.json et legend-guides.ts.`);
} else console.log("\nContrôle propre (essai à blanc).");
