export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getLegendIconUrl } from "@/lib/banners";
import { formatDate, displayLegendName } from "@/lib/utils";
import { MetaFilters } from "./meta-filters";
import type { Metadata } from "next";

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
  // Fetch all published decks
  const decks = await prisma.deck.findMany({
    where: { published: true },
    select: {
      legendName: true,
      tournamentContext: true,
      format: true,
      createdAt: true,
    },
  });

  // Fetch current tier list for tier context
  const currentTierList = await prisma.tierList.findFirst({
    where: { current: true, published: true },
    include: { entries: true },
  });

  if (decks.length === 0) {
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

  // Collect all unique tournaments and formats
  const allTournaments = [
    ...new Set(
      decks
        .map((d) => d.tournamentContext)
        .filter((t): t is string => t != null && t.length > 0),
    ),
  ].sort();

  const allFormats = [
    ...new Set(decks.map((d) => d.format).filter((f) => f.length > 0)),
  ].sort();

  // Group decks by legendName
  const legendGroups = new Map<
    string,
    {
      count: number;
      tournaments: Set<string>;
      formats: Set<string>;
    }
  >();

  for (const deck of decks) {
    const existing = legendGroups.get(deck.legendName);
    if (existing) {
      existing.count++;
      if (deck.tournamentContext) existing.tournaments.add(deck.tournamentContext);
      existing.formats.add(deck.format);
    } else {
      legendGroups.set(deck.legendName, {
        count: 1,
        tournaments: new Set(
          deck.tournamentContext ? [deck.tournamentContext] : [],
        ),
        formats: new Set([deck.format]),
      });
    }
  }

  const totalDecks = decks.length;

  // Build stats sorted by popularity
  const legendStats: LegendStats[] = [...legendGroups.entries()]
    .map(([legendName, data]) => {
      const tierInfo = tierMap.get(legendName);
      return {
        legendName,
        shortName: displayLegendName(legendName),
        iconUrl: getLegendIconUrl(legendName),
        deckCount: data.count,
        popularity: Math.round((data.count / totalDecks) * 1000) / 10,
        tier: tierInfo?.tier ?? null,
        tierComment: tierInfo?.comment ?? null,
        tournaments: [...data.tournaments],
        formats: [...data.formats],
      };
    })
    .sort((a, b) => b.deckCount - a.deckCount);

  // Find most recent deck date for "last updated"
  const latestDate = decks.reduce((latest, d) => {
    return d.createdAt > latest ? d.createdAt : latest;
  }, decks[0].createdAt);

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
          Dernière mise à jour : {formatDate(latestDate)} — {totalDecks} decks
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
