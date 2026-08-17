/**
 * Recale les fiches Légendes sur les decklists réelles du format en cours.
 *
 * Les sections chiffrées d'une fiche (cartes clés, champions, terrains,
 * résultats) décrivaient Déchaînement. Ce script les remplace par ce que
 * `scripts/fiches-stats.mts` a compté dans les decks de tournoi en base, et ne
 * touche à rien d'autre : l'archétype, le plan de jeu, les forces et les
 * faiblesses sont écrits à la main et relus à la main.
 *
 *   npx tsx --env-file=.env scripts/fiches-stats.mts Vendetta 10 > data/fiches-stats-vendetta.json
 *   npx tsx scripts/fiches-maj.mts data/fiches-stats-vendetta.json [--ecrire]
 *
 * Sans `--ecrire`, il n'écrit rien et se contente de dire ce qu'il changerait.
 * Une Légende vue moins de dix fois n'est pas touchée : on ne réécrit pas une
 * fiche sur trois listes.
 */
import { promises as fs } from "fs";
import path from "path";
import type { StatsLegende } from "./fiches-stats.mts";

const FICHES = path.join(process.cwd(), "data", "fiches");
const chemin = process.argv[2];
const ecrire = process.argv.includes("--ecrire");
if (!chemin) throw new Error("Donne le chemin du JSON produit par fiches-stats.mts");

// PowerShell écrit ses redirections en UTF-8 avec BOM : JSON.parse s'y casse les dents.
const stats: Record<string, StatsLegende> = JSON.parse((await fs.readFile(chemin, "utf-8")).replace(/^﻿/, ""));

/** Ce que ce script écrit lui-même : à ne jamais reprendre pour descripteur, sinon il s'empile à chaque passage. */
const DEJA_GENERE = /exemplaires? en moyenne|% des listes/i;

/** « Core, protection, 100% à 2.9x. » garde son mot utile : il décrit la carte, pas le méta. */
function descripteurExistant(role: string | undefined): string | null {
  if (!role || DEJA_GENERE.test(role)) return null;
  const m = role.match(/^(?:Core|Standard|Flex|Tech|Cœur du deck|Souple)\s*[—–-]?\s*([^,.0-9]+?)\s*(?:,|$)/i);
  const d = m?.[1]?.trim();
  if (!d || d.length < 3 || /^\d/.test(d)) return null;
  return d;
}

const exemplaires = (n: number) => `${n % 1 === 0 ? n : n.toFixed(1)} exemplaire${n >= 2 ? "s" : ""}`;

function role(part: number, copies: number, ancien?: string): string {
  const rang = part >= 90 ? "Cœur du deck" : part >= 60 ? "Standard" : "Souple";
  const d = descripteurExistant(ancien);
  return [rang, d, `${part} % des listes`, exemplaires(copies)].filter(Boolean).join(", ");
}

type Fiche = {
  legendName?: string;
  keyCards?: { name: string; role?: string }[];
  champions?: Record<string, { usage?: string; role?: string }>;
  topBattlefields?: string[];
  competitiveResults?: Record<string, unknown>;
  dataSource?: string;
  [k: string]: unknown;
};

// « Rek'Sai » dans la fiche, « Rek'sai » en base : sans ça, la fiche la plus jouée passe à la trappe.
const cle = (n: string) => n.toLowerCase().replace(/['’,.\s-]/g, "");
const parCle = new Map(Object.entries(stats).map(([n, s]) => [cle(n), s]));

const fichiers = (await fs.readdir(FICHES)).filter((f) => f.endsWith(".json"));
const journal: string[] = [];
let touchees = 0;

for (const f of fichiers) {
  const p = path.join(FICHES, f);
  const fiche: Fiche = JSON.parse(await fs.readFile(p, "utf-8"));
  const s = fiche.legendName ? parCle.get(cle(fiche.legendName)) : undefined;
  if (!s) {
    journal.push(`  ${f.padEnd(38)} laissée telle quelle (moins de dix listes dans le format)`);
    continue;
  }

  const ancienRole = new Map((fiche.keyCards ?? []).map((k) => [k.name, k.role]));
  const ancienChamp = new Map(Object.entries(fiche.champions ?? {}).map(([n, v]) => [n, v.role]));
  const avant = JSON.stringify([fiche.keyCards, fiche.champions, fiche.topBattlefields]);

  fiche.keyCards = s.cartes
    .slice(0, 12)
    .map((c) => ({ name: c.nom, role: role(c.part, c.copies, ancienRole.get(c.nom)) }));

  fiche.champions = Object.fromEntries(
    s.champions.map((c) => {
      const brut = ancienChamp.get(c.nom);
      const d =
        descripteurExistant(brut) ?? (brut && !DEJA_GENERE.test(brut) ? brut.split(/[—–,]/)[0]?.trim() : undefined);
      return [c.nom, { usage: `${c.part} %`, role: [d, `${exemplaires(c.copies)} en moyenne`].filter(Boolean).join(", ") }];
    }),
  );

  fiche.topBattlefields = s.terrains.slice(0, 5).map((t) => `${t.nom} (${t.part} %)`);

  fiche.competitiveResults = {
    deckCount: s.decks,
    top8: s.top8,
    titres: s.titres,
    conversion: `${s.conversion} %`,
    tournois: s.tournois,
    bestPlacements: s.meilleuresPlaces,
  };
  fiche.dataSource = `Decklists de tournoi en base : ${s.decks} listes, ${s.tournois} tournois. Relevé du 17 août 2026, calcul par scripts/fiches-stats.mts.`;

  const change = JSON.stringify([fiche.keyCards, fiche.champions, fiche.topBattlefields]) !== avant;
  if (change) touchees++;
  journal.push(
    `  ${f.padEnd(38)} ${String(s.decks).padStart(3)} listes, ${s.champions.length} champions, ${s.terrains.length} terrains${change ? "" : " (déjà à jour)"}`,
  );
  if (ecrire) await fs.writeFile(p, JSON.stringify(fiche, null, 2) + "\n", "utf-8");
}

console.log(journal.sort().join("\n"));
console.log(`\n${touchees} fiches modifiées${ecrire ? "" : " (essai à blanc, rien n'est écrit)"}`);

// La page /legendes classe par le `tier` de la fiche, /tier-list par le tableau du seed.
// Les deux ont déjà divergé une fois sans que personne ne le voie : on le dit ici.
const LETTRE: Record<number, string> = { 1: "S", 2: "A", 3: "B", 4: "C", 5: "D" };
const seed = await fs.readFile(path.join(process.cwd(), "scripts", "seed-tier-lists.ts"), "utf-8");
const bloc = seed.slice(seed.indexOf("const vendettaTier"), seed.indexOf("async function seedTierList"));
const tiers = new Map(
  [...bloc.matchAll(/legendName:\s*"([^"]+)",\s*tier:\s*"([SABCD])"/g)].map((m) => [cle(m[1]), m[2]]),
);
const ecarts: string[] = [];
for (const f of fichiers) {
  const fiche = JSON.parse(await fs.readFile(path.join(FICHES, f), "utf-8"));
  const attendu = tiers.get(cle(fiche.legendName ?? ""));
  const pose = LETTRE[fiche.tier as number];
  if (attendu && pose && attendu !== pose) ecarts.push(`  ${f} : fiche ${pose}, tier list ${attendu}`);
}
if (ecarts.length) console.log(`\nTiers à recaler sur la tier list Vendetta :\n${ecarts.join("\n")}`);
