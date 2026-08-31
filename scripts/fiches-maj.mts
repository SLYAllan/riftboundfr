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
import { role, roleChampion } from "./fiches-roles";

const FICHES = path.join(process.cwd(), "data", "fiches");

/** « 26 août 2026 », le format que relit `dateAnalyseFiche`. */
const MOIS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const maintenant = new Date();
const AUJOURDHUI = `${maintenant.getDate()} ${MOIS_FR[maintenant.getMonth()]} ${maintenant.getFullYear()}`;
const chemin = process.argv[2];
const ecrire = process.argv.includes("--ecrire");
if (!chemin) throw new Error("Donne le chemin du JSON produit par fiches-stats.mts");

// PowerShell écrit ses redirections en UTF-8 avec BOM : JSON.parse s'y casse les dents.
const stats: Record<string, StatsLegende> = JSON.parse((await fs.readFile(chemin, "utf-8")).replace(/^﻿/, ""));

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

  // Une Légende qui n'est plus jouée dans le format en cours n'a pas de cartes
  // calculables : on met à jour ses seuls RÉSULTATS, sur toutes les ères, et on
  // laisse ses cartes telles quelles plutôt que de les vider.
  if (s.toutesEres) {
    fiche.competitiveResults = {
      joueursClasses: s.joueurs,
      coupe10: s.coupe,
      titres: s.titres,
      conversion: `${s.conversion} %`,
      tournois: s.tournois,
      bestPlacements: s.meilleuresPlaces,
    };
    fiche.dataSource =
      `Classement complet des tournois, TOUTES ÈRES : ${s.joueurs} joueurs classés sur ${s.tournois} tournois. ` +
      `Cette Légende n'est plus jouée dans le format en cours, ses cartes clés datent donc du dernier set où elle l'était. ` +
      `Relevé du ${AUJOURDHUI}, calcul par scripts/fiches-stats.mts.`;
    journal.push(`  ${f.padEnd(38)} résultats toutes ères (${s.joueurs} joueurs), cartes inchangées`);
    touchees++;
    if (ecrire) await fs.writeFile(p, JSON.stringify(fiche, null, 2) + "\n", "utf-8");
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
      return [c.nom, { usage: `${c.part} %`, role: roleChampion(c.copies, ancienChamp.get(c.nom)) }];
    }),
  );

  fiche.topBattlefields = s.terrains.slice(0, 5).map((t) => `${t.nom} (${t.part} %)`);

  // Les résultats se comptent sur les joueurs CLASSÉS, les cartes sur les listes
  // publiées. `listesPubliees` reste là pour qu'on voie l'écart entre les deux :
  // à Barcelone il vaut 106 contre 2 127.
  fiche.competitiveResults = {
    joueursClasses: s.joueurs,
    coupe10: s.coupe,
    titres: s.titres,
    conversion: `${s.conversion} %`,
    tournois: s.tournois,
    listesPubliees: s.decks,
    bestPlacements: s.meilleuresPlaces,
  };
  // La date était codée en dur : toutes les fiches annonçaient « 17 août 2026 »
  // quel que soit le jour du relevé, et /legendes affichait cette date.
  fiche.dataSource =
    `Classement complet des tournois : ${s.joueurs} joueurs classés, ${s.tournois} tournois, ` +
    `dont ${s.decks} listes publiées d\u2019où viennent les cartes. ` +
    `Relevé du ${AUJOURDHUI}, calcul par scripts/fiches-stats.mts.`;

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
const CHIFFRE: Record<string, number> = { S: 1, A: 2, B: 3, C: 4, D: 5 };
const ecarts: string[] = [];
for (const f of fichiers) {
  const chemin = path.join(FICHES, f);
  const fiche = JSON.parse(await fs.readFile(chemin, "utf-8"));
  const attendu = tiers.get(cle(fiche.legendName ?? ""));
  const pose = LETTRE[fiche.tier as number];
  if (!attendu || !pose || attendu === pose) continue;
  ecarts.push(`  ${f} : fiche ${pose}, tier list ${attendu}`);
  // Le rang de la tier list fait foi : il se calcule sur le classement complet
  // des tournois, la fiche ne fait que le recopier. Le script se contentait de
  // signaler l'écart, donc les divergences restaient d'un relevé à l'autre.
  if (ecrire) {
    fiche.tier = CHIFFRE[attendu];
    await fs.writeFile(chemin, JSON.stringify(fiche, null, 2) + "\n", "utf-8");
  }
}
if (ecarts.length) {
  const verbe = ecrire ? "recalés sur" : "à recaler sur";
  console.log(`\n${ecarts.length} tiers ${verbe} la tier list Vendetta :\n${ecarts.join("\n")}`);
}
