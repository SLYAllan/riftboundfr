/**
 * Réaligne la Légende des decks Master Yi sur les fichiers source
 * data/decklists/**\/*.json, eux-mêmes issus du scrape riftdecks (le lien
 * /legends/constructed/... de la page du deck).
 *
 * Pourquoi : un ancien fallback « set == Unleashed -> Wuju Master » a étiqueté en
 * Wuju Master des centaines de decks qui sont des Wuju Bladesman (City Challenges
 * d'avril-mai, Xi'an). Les deux Légendes existent vraiment, on ne convertit donc
 * jamais en bloc : chaque deck prend la valeur de sa propre source.
 *
 * Correspondance deck <-> source : tournoi + numéro de classement + joueur.
 * Un deck sans source correspondante n'est PAS touché.
 *
 * Usage : npx tsx scripts/fix-master-yi-from-sources.mts [--apply]
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

type Src = { legend: string; player: string | null; placement: number | null; tournament: string };

// Le champ `tournament` des fichiers source ne porte pas toujours le même libellé que
// `Deck.tournamentContext`. Table de correspondance pour les tournois concernés.
const ALIAS: Record<string, string[]> = {
  "Beijing Regional Open": ["Beijing Regional Open (Day 2)"],
  "Beijing Regional Open Day 1": ["Beijing Regional Open (Day 1)"],
  "Chongqing Regional Open": ["Chongqing Regional Open (Full)"],
  "Guangzhou Regional Open": ["Guangzhou Regional Open (Full)"],
  "Xi'an Regional Open S3": ["S3 Xi'an Regional Open"],
  "Shenzhen National Open S2": ["S2 Shenzhen National Open"],
  "Fuzhou Regional Qualifier": ["Fuzhou Regional"],
  "RQ Houston 2025": ["Houston Regional Qualifier"],
  "RQ Bologna 2026": ["Bologna Regional Qualifier"],
  "RQ Lille 2026": ["Lille Regional Qualifier"],
  "RQ Las Vegas 2026": ["Las Vegas Regional Qualifier"],
  "RQ Atlanta 2026": ["Atlanta Regional Qualifier"],
  "RQ Sydney 2026": ["Sydney Regional Qualifier"],
};

function loadSources(): Map<string, string> {
  const root = join(process.cwd(), "data", "decklists");
  const byKey = new Map<string, string>();
  for (const dir of readdirSync(root)) {
    const full = join(root, dir);
    if (!statSync(full).isDirectory()) continue;
    for (const f of readdirSync(full)) {
      if (!f.endsWith(".json")) continue;
      let d: Src;
      try { d = JSON.parse(readFileSync(join(full, f), "utf-8")); } catch { continue; }
      if (!d.legend || d.placement == null) continue;
      byKey.set(`${d.tournament}|${d.placement}|${(d.player ?? "").trim()}`, d.legend);
    }
  }
  return byKey;
}

async function main() {
  const sources = loadSources();
  console.log(`${sources.size} listes source indexées`);

  const decks = await prisma.deck.findMany({
    where: { legendName: { startsWith: "Master Yi" } },
    select: { id: true, legendName: true, placement: true, playerName: true, tournamentContext: true },
  });
  console.log(`${decks.length} decks Master Yi en base`);

  const fixes: { id: string; from: string; to: string; ctx: string }[] = [];
  let sansSource = 0;
  for (const d of decks) {
    const n = d.placement?.match(/\d+/)?.[0];
    if (!n || !d.tournamentContext) { sansSource++; continue; }
    const noms = [d.tournamentContext, ...(ALIAS[d.tournamentContext] ?? [])];
    let src: string | undefined;
    for (const nom of noms) {
      src = sources.get(`${nom}|${parseInt(n, 10)}|${(d.playerName ?? "").trim()}`);
      if (src) break;
    }
    if (!src) { sansSource++; continue; }
    if (src !== d.legendName) fixes.push({ id: d.id, from: d.legendName, to: src, ctx: d.tournamentContext });
  }

  const parTournoi = new Map<string, number>();
  for (const f of fixes) parTournoi.set(f.ctx, (parTournoi.get(f.ctx) ?? 0) + 1);
  console.log(`\n${fixes.length} corrections, ${sansSource} decks sans source (non touchés)`);
  for (const [ctx, n] of [...parTournoi].sort((a, b) => b[1] - a[1])) console.log(`  ${n} | ${ctx}`);

  if (!APPLY) { console.log("\nSimulation. Relancer avec --apply pour écrire."); return; }

  for (const f of fixes) {
    await prisma.deck.update({ where: { id: f.id }, data: { legendName: f.to } });
  }
  console.log(`\n${fixes.length} decks corrigés.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
