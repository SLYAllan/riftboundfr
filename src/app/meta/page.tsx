// force-dynamic: queries the DB; `revalidate` froze it empty at Docker build.
export const dynamic = "force-dynamic";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getLegendIconUrl } from "@/lib/banners";
import { formatDate, displayLegendName } from "@/lib/utils";
import { MetaFilters } from "./meta-filters";
import type { Metadata } from "next";

// Cache RUNTIME (pas build) : les decks publiés ne changent qu'aux seeds → 5 min suffit.
// Invalidable via revalidateTag("meta").
//
// On agrège DANS la fonction cachée. La version précédente mettait en cache les
// ~21 000 lignes brutes, soit 3,9 Mo : au-delà de 2 Mo Next refuse d'écrire et lève
// un unhandledRejection, donc le cache ne servait jamais et la page rejouait toute
// la requête à chaque visite. L'agrégat fait quelques kilo-octets.
const getMetaData = unstable_cache(
  async () => {
    const [decks, tierList] = await Promise.all([
      prisma.deck.findMany({
        where: { published: true },
        select: { legendName: true, tournamentContext: true, format: true },
      }),
      prisma.tierList.findFirst({ where: { current: true, published: true }, include: { entries: true } }),
    ]);

    const groupes = new Map<string, { count: number; tournaments: Set<string>; formats: Set<string> }>();
    for (const d of decks) {
      let g = groupes.get(d.legendName);
      if (!g) groupes.set(d.legendName, (g = { count: 0, tournaments: new Set(), formats: new Set() }));
      g.count++;
      if (d.tournamentContext) g.tournaments.add(d.tournamentContext);
      if (d.format) g.formats.add(d.format);
    }

    return {
      totalDecks: decks.length,
      legendes: [...groupes].map(([legendName, g]) => ({
        legendName,
        count: g.count,
        tournaments: [...g.tournaments],
        formats: [...g.formats],
      })),
      allTournaments: [...new Set(decks.map((d) => d.tournamentContext).filter((t): t is string => !!t))].sort(),
      allFormats: [...new Set(decks.map((d) => d.format).filter(Boolean))].sort(),
      tierList,
    };
  },
  ["meta-snapshot-v2"],
  { revalidate: 300, tags: ["meta"] },
);

export const metadata: Metadata = {
  title: "Meta Snapshot",
  description:
    "Aperçu du métagame Riftbound : légendes les plus jouées en tournoi. Données basées sur les decks publiés.",
  alternates: { canonical: "/meta" },
};

interface LegendStats {
  legendName: string;
  shortName: string;
  iconUrl: string | null;
  deckCount: number;
  popularity: number;
  tier: string | null;
  tierComment: string | null;
  tournaments: string[];
  formats: string[];
}

export default async function MetaSnapshotPage() {
  type MetaData = Awaited<ReturnType<typeof getMetaData>>;
  let data: MetaData;
  try {
    data = await getMetaData();
  } catch {
    data = { totalDecks: 0, legendes: [], allTournaments: [], allFormats: [], tierList: null };
  }
  const { totalDecks, legendes, allTournaments, allFormats, tierList: currentTierList } = data;

  if (totalDecks === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Meta Snapshot
        </h1>
        <p className="mt-4 text-ink-secondary">
          Aucune donnée disponible pour le moment.
        </p>
      </div>
    );
  }

  // Build tier lookup from current tier list
  const tierMap = new Map<
    string,
    { tier: string; comment: string | null }
  >();
  if (currentTierList) {
    for (const entry of currentTierList.entries) {
      tierMap.set(entry.legendName, {
        tier: entry.tier,
        comment: entry.comment,
      });
    }
  }

  // Tournois, formats et regroupement par légende viennent déjà agrégés du cache.

  // Build stats sorted by popularity
  const legendStats: LegendStats[] = legendes
    .map((l) => {
      const tierInfo = tierMap.get(l.legendName);
      return {
        legendName: l.legendName,
        shortName: displayLegendName(l.legendName),
        iconUrl: getLegendIconUrl(l.legendName),
        deckCount: l.count,
        popularity: Math.round((l.count / totalDecks) * 1000) / 10,
        tier: tierInfo?.tier ?? null,
        tierComment: tierInfo?.comment ?? null,
        tournaments: l.tournaments,
        formats: l.formats,
      };
    })
    .sort((a, b) => b.deckCount - a.deckCount);

  // Date affichée : celle de la tier list courante. On ne charge plus createdAt sur
  // les 21 000 decks juste pour prendre le maximum.
  const latestDate = currentTierList?.updatedAt ?? new Date();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="text-center">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Meta Snapshot
        </h1>
        <p className="mt-2 text-ink-secondary">
          Popularité des légendes basée sur les decks de tournois publiés.
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Dernière mise à jour : {formatDate(latestDate)} - {totalDecks} decks
          analysés
        </p>
      </div>

      <MetaFilters
        legendStats={legendStats}
        allTournaments={allTournaments}
        allFormats={allFormats}
      />

      <div className="mt-8 rounded-lg border border-hairline bg-surface p-6 text-center">
        <p className="text-sm text-ink-muted">
          Ces données reflètent uniquement le nombre de decks publiés par
          légende. Elles ne constituent pas des statistiques de winrate ou de
          performance.
        </p>
      </div>
    </div>
  );
}
