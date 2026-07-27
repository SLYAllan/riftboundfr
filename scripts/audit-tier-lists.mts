/**
 * Confronte les tier lists publiées aux decks de tournoi réellement en base :
 * part de méta, présence en top 8, Légendes classées sans données, Légendes
 * jouées mais absentes du classement.
 *
 * Usage : npx tsx scripts/audit-tier-lists.mts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TIER_RANK: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };

// Un deck compte comme "top 8" si son placement tient dans les 8 premiers.
function isTop8(placement: string | null): boolean {
  if (!placement) return false;
  const n = parseInt(placement.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n <= 8;
}

// Normalise pour rapprocher tier list et decks : "Diana, Scorn of the Moon" -> "diana, scorn of the moon".
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

async function auditSet(set: string) {
  const tl = await prisma.tierList.findFirst({
    where: { setContext: set, published: true },
    include: { entries: true },
  });
  if (!tl) { console.log(`\n### ${set} : aucune tier list publiée\n`); return; }

  // La tier list "Global" couvre tous les sets : on la compare à tous les decks.
  const decks = await prisma.deck.findMany({
    where: {
      ...(set === "Global" ? {} : { setTag: set }),
      tournamentContext: { not: null },
    },
    select: { legendName: true, placement: true, tournamentTier: true },
  });

  const total = decks.length;
  const stats = new Map<string, { n: number; top8: number }>();
  for (const d of decks) {
    const k = norm(d.legendName);
    const s = stats.get(k) ?? { n: 0, top8: 0 };
    s.n++;
    if (isTop8(d.placement)) s.top8++;
    stats.set(k, s);
  }

  // Classement observé : d'abord la part de méta, départagée par le taux de top 8.
  const ranked = [...stats.entries()]
    .map(([k, s]) => ({ k, ...s, share: s.n / total, t8rate: s.n ? s.top8 / s.n : 0 }))
    .sort((a, b) => b.share - a.share || b.t8rate - a.t8rate);
  const observedRank = new Map(ranked.map((r, i) => [r.k, i]));

  // Taux de conversion en top 8 : le signal qui compte vraiment. On ne le retient
  // qu'au-dessus d'un seuil d'échantillon, sinon 3 decks suffisent à tout fausser.
  const MIN_N = 50;
  const solid = ranked.filter((r) => r.n >= MIN_N);
  const rates = solid.map((r) => r.t8rate).sort((a, b) => a - b);
  const median = rates.length ? rates[Math.floor(rates.length / 2)] : 0;

  console.log(`\n## ${set} — ${total} decks de tournoi, ${tl.entries.length} Légendes classées`);
  console.log(`Conversion top 8 médiane (≥ ${MIN_N} decks) : ${(median * 100).toFixed(1)} %\n`);
  console.log("| Tier | Légende | decks | part | top 8 | conv. | rang part | rang conv. |");
  console.log("|---|---|---|---|---|---|---|---|");

  const byRate = [...solid].sort((a, b) => b.t8rate - a.t8rate);
  const rateRank = new Map(byRate.map((r, i) => [r.k, i]));

  const classed = new Set<string>();
  const rows = [...tl.entries].sort(
    (a, b) => (TIER_RANK[a.tier] ?? 9) - (TIER_RANK[b.tier] ?? 9) || a.position - b.position,
  );
  const flags: string[] = [];
  for (const e of rows) {
    const k = norm(e.legendName);
    classed.add(k);
    const s = stats.get(k);
    const rank = observedRank.get(k);
    const rr = rateRank.get(k);
    const share = s ? ((s.n / total) * 100).toFixed(1) + " %" : "—";
    const conv = s && s.n >= MIN_N ? ((s.top8 / s.n) * 100).toFixed(1) + " %" : "—";
    console.log(
      `| ${e.tier} | ${e.legendName} | ${s?.n ?? 0} | ${share} | ${s?.top8 ?? 0} | ${conv} | ${rank === undefined ? "—" : rank + 1} | ${rr === undefined ? "—" : rr + 1} |`,
    );

    if (!s || s.n < MIN_N) continue;
    const rate = s.top8 / s.n;
    const top = (TIER_RANK[e.tier] ?? 9) <= 1; // S ou A
    const low = (TIER_RANK[e.tier] ?? 9) >= 3; // C ou D
    if (top && rate < median) {
      flags.push(`- **${e.legendName}** en ${e.tier} : convertit ${(rate * 100).toFixed(1)} % (sous la médiane ${(median * 100).toFixed(1)} %) sur ${s.n} decks`);
    }
    if (low && rate > median * 1.5) {
      flags.push(`- **${e.legendName}** en ${e.tier} : convertit ${(rate * 100).toFixed(1)} % (1,5x la médiane) sur ${s.n} decks`);
    }
  }
  if (flags.length) {
    console.log(`\n**Tiers en tension avec les résultats :**`);
    for (const f of flags) console.log(f);
  }

  const missing = ranked.filter((r) => !classed.has(r.k) && r.n >= 3);
  if (missing.length) {
    console.log(`\n**Jouées mais absentes de la tier list** (≥ 3 decks) :`);
    for (const m of missing) {
      console.log(`- ${m.k} — ${m.n} decks (${(m.share * 100).toFixed(1)} %), ${m.top8} en top 8`);
    }
  }
  const noData = rows.filter((e) => !stats.has(norm(e.legendName)));
  if (noData.length) {
    console.log(`\n**Classées sans aucun deck en base** :`);
    for (const e of noData) console.log(`- ${e.tier} : ${e.legendName}`);
  }
}

async function main() {
  const sets = await prisma.tierList.findMany({
    where: { published: true }, select: { setContext: true }, distinct: ["setContext"],
  });
  for (const s of sets) if (s.setContext) await auditSet(s.setContext);
}

main().catch(console.error).finally(() => prisma.$disconnect());
