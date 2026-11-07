/**
 * Prépare un dossier par Légende pour réécrire sa prose sur les chiffres du set en cours.
 *
 *   npx tsx --env-file=.env scripts/prose-radiance-dossiers.mts <dossier>
 *
 * Écrit `<dossier>/packs/<slug>.json` pour chaque fiche dont `setDesChiffres` vaut
 * Radiance : la fiche, sa prose et son guide actuels, et le texte réel de chaque
 * carte nommée, avec `jouee_en_radiance`. Les consignes du rédacteur sont dans
 * `docs/prose-radiance-consignes.md` ; `scripts/prose-radiance-appliquer.mjs
 * <dossier> [--ecrire]` contrôle puis pose ses propositions. Le 7 novembre 2026, la
 * prose citait encore les cartes Vendetta alors que la page affichait les cartes
 * Radiance.
 */
import fs from "node:fs";
import path from "node:path";
import { LEGEND_GUIDES } from "../src/lib/legend-guides";
import { prisma } from "../src/lib/prisma";

const SORTIE = process.argv[2];
if (!SORTIE) throw new Error("Usage : npx tsx --env-file=.env scripts/prose-radiance-dossiers.mts <dossier>");
const PACKS = path.join(SORTIE, "packs");
fs.mkdirSync(PACKS, { recursive: true });

const prose = JSON.parse(fs.readFileSync("data/fiches-prose.json", "utf8"));
// Les fiches rangent tantôt du JSON en chaîne, tantôt du texte simple.
const lire = (v: unknown) => {
  if (typeof v !== "string") return v;
  try { return JSON.parse(v); } catch { return v; }
};
const CHAMPS_PROSE = ["archetype", "legendAbility", "gameplan", "strengths", "weaknesses"];

const cartes = await prisma.card.findMany({
  where: { alternateArt: false },
  select: { name: true, type: true, supertype: true, domains: true, energy: true, might: true, power: true, textPlain: true },
});
const parNom = new Map<string, (typeof cartes)[number]>();
for (const c of cartes) if (!parNom.has(c.name.toLowerCase())) parNom.set(c.name.toLowerCase(), c);

for (const f of fs.readdirSync("data/fiches")) {
  const fiche = JSON.parse(fs.readFileSync(path.join("data/fiches", f), "utf8"));
  if (fiche.setDesChiffres !== "Radiance") continue;
  const slug = f.replace(".json", "");
  const proseActuelle = prose[f] ?? Object.fromEntries(CHAMPS_PROSE.map((k) => [k, lire(fiche[k])]));
  const guide = LEGEND_GUIDES[slug];
  const keyCards = lire(fiche.keyCards) as { name: string; role: string }[];
  const champions = lire(fiche.champions) as Record<string, unknown>;

  // Toutes les cartes nommées : jouées aujourd'hui, et citées dans l'ancien texte.
  const noms = new Set<string>([...keyCards.map((k) => k.name), ...Object.keys(champions), fiche.legendName]);
  const texteAncien = JSON.stringify(proseActuelle) + JSON.stringify(guide ?? {});
  for (const m of texteAncien.matchAll(/\[\[([^\]]+)\]\]/g)) noms.add(m[1]);
  for (const c of cartes) if (c.name.length > 5 && texteAncien.includes(c.name)) noms.add(c.name);

  const jouees = new Set([...keyCards.map((k) => k.name), ...Object.keys(champions)]);
  const textes = [...noms].map((n) => {
    const c = parNom.get(n.toLowerCase());
    return c
      ? { nom: c.name, jouee_en_radiance: jouees.has(c.name) || c.name === fiche.legendName, type: c.type, supertype: c.supertype, domaines: c.domains, energie: c.energy, puissance: c.might ?? c.power, texte: c.textPlain }
      : { nom: n, jouee_en_radiance: jouees.has(n), introuvable_en_base: true };
  });
  const manquantes = textes.filter((t) => "introuvable_en_base" in t).map((t) => t.nom);

  fs.writeFileSync(path.join(PACKS, `${slug}.json`), JSON.stringify({
    slug,
    legende: fiche.legendName,
    contexte: {
      set: "Radiance",
      definition_conversion: "part des joueurs classés de la Légende qui finissent dans les 10 % de tête de leur tournoi",
      ban: "cartes comptées sur les listes jouées depuis la ban list du 15 septembre 2026 (annoncée le 18) ; Stacked Deck est interdit",
      a_completer: "moyenne du format et effectif du set : lire `scripts/tier-tables.ts`, en-tête de radianceTier",
    },
    fiche: {
      domains: lire(fiche.domains),
      difficulty: fiche.difficulty,
      beginnerFriendly: fiche.beginnerFriendly,
      keyCards,
      champions,
      topBattlefields: lire(fiche.topBattlefields),
      competitiveResults: lire(fiche.competitiveResults),
      dataSource: fiche.dataSource,
    },
    prose_actuelle: proseActuelle,
    guide_actuel: guide ?? null,
    cartes: textes,
  }, null, 2));
  console.log(`${slug} : ${keyCards.length} cartes${manquantes.length ? `, INTROUVABLES : ${manquantes.join(", ")}` : ""}`);
}
await prisma.$disconnect();
