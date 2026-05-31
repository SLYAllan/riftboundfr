// force-dynamic: the page queries the DB, but with `revalidate` it was
// statically generated at Docker build (no DB) and frozen empty in prod.
export const dynamic = "force-dynamic";

import { prisma, safeQuery } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getTournamentCountryCode, getTournamentInfo, getTournamentTier, isTournamentHidden } from "@/lib/tournament-flags";
import { getLegendIconUrl } from "@/lib/banners";
import { TournamentList } from "@/components/tournament-list";
import { Trophy, Swords, Users, Globe } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tournois",
  description: "Tous les tournois compétitifs Riftbound : Regional Qualifiers, résultats et decklists.",
  alternates: { canonical: "/tournois" },
};

function parsePlacement(p: string | null): number {
  if (!p) return 9999;
  const n = parseInt(p.replace(/[^0-9]/g, ""));
  return isNaN(n) ? 9999 : n;
}

async function getTournamentData() {
  const [articles, decks] = await Promise.all([
    prisma.article.findMany({
      where: { published: true, tournamentName: { not: null } },
      select: {
        slug: true,
        title: true,
        tournamentName: true,
        tournamentDate: true,
        tournamentLocation: true,
        tournamentPlayerCount: true,
      },
      orderBy: { tournamentDate: "desc" },
    }),
    prisma.deck.findMany({
      where: { published: true, tournamentContext: { not: null }, placement: { not: null } },
      select: {
        id: true,
        slug: true,
        legendName: true,
        playerName: true,
        placement: true,
        tournamentContext: true,
        tournamentTier: true,
        record: true,
      },
    }),
  ]);

  const decksByContext = new Map<string, typeof decks>();
  for (const d of decks) {
    const ctx = d.tournamentContext!;
    if (!decksByContext.has(ctx)) decksByContext.set(ctx, []);
    decksByContext.get(ctx)!.push(d);
  }

  const articlesByCity = new Map<string, typeof articles>();
  for (const a of articles) {
    const city = a.tournamentLocation?.split(",")[0]?.trim().toLowerCase() ?? "";
    if (!articlesByCity.has(city)) articlesByCity.set(city, []);
    articlesByCity.get(city)!.push(a);
  }

  const tournamentMap = new Map<string, {
    name: string;
    slug: string;
    tier: "S" | "A";
    set: string | null;
    date: string | null;
    location: string | null;
    playerCount: number | null;
    countryCode: string | null;
    deckCount: number;
    articles: { slug: string; title: string; isTop8: boolean; isBestOf: boolean }[];
    topDecks: {
      placement: string | null;
      placementNum: number;
      playerName: string | null;
      legendName: string;
      legendIcon: string | null;
      slug: string;
      record: string | null;
    }[];
  }>();

  for (const [ctx, ctxDecks] of decksByContext) {
    if (isTournamentHidden(ctx)) continue;
    const info = getTournamentInfo(ctx);
    const cc = getTournamentCountryCode(ctx);
    const cityLower = info?.city.toLowerCase() ?? ctx.toLowerCase();

    let matchedArticles: typeof articles = [];
    for (const [artCity, artList] of articlesByCity) {
      if (artCity && cityLower.includes(artCity)) {
        matchedArticles = [...matchedArticles, ...artList];
      }
    }

    let date: string | null = null;
    let location: string | null = null;
    let playerCount: number | null = null;

    if (matchedArticles.length > 0) {
      const first = matchedArticles.find((a) => a.tournamentDate) ?? matchedArticles[0];
      date = first.tournamentDate?.toISOString() ?? null;
      location = first.tournamentLocation;
      playerCount = matchedArticles.reduce((max, a) => Math.max(max, a.tournamentPlayerCount ?? 0), 0) || null;
    }
    if (info) {
      if (!date && info.date) date = new Date(info.date).toISOString();
      if (!location) location = info.location ?? info.city;
      if (!playerCount) playerCount = info.playerCount ?? null;
    }

    const sorted = ctxDecks
      .map((d) => ({
        placement: d.placement,
        placementNum: parsePlacement(d.placement),
        playerName: d.playerName,
        legendName: d.legendName,
        legendIcon: getLegendIconUrl(d.legendName),
        slug: d.slug,
        record: d.record,
      }))
      .sort((a, b) => a.placementNum - b.placementNum)
      .slice(0, 8);

    const displayName = info?.name ?? ctx;

    tournamentMap.set(ctx, {
      name: displayName,
      slug: slugify(ctx),
      tier: getTournamentTier(ctx),
      set: info?.set ?? null,
      date,
      location,
      playerCount,
      countryCode: cc,
      deckCount: ctxDecks.length,
      articles: matchedArticles.map((a) => ({
        slug: a.slug,
        title: a.title,
        isTop8: a.title.toLowerCase().includes("top 8"),
        isBestOf: a.title.toLowerCase().includes("best of"),
      })),
      topDecks: sorted,
    });
  }

  return [...tournamentMap.values()].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier === "S" ? -1 : 1; // S avant A
    if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (a.date) return -1;
    return 1;
  });
}

export type TournamentData = Awaited<ReturnType<typeof getTournamentData>>[number];

export default async function TournoisPage() {
  const allTournaments = await safeQuery(() => getTournamentData(), []);
  const tournaments = allTournaments.filter((t) => t.deckCount > 5);

  const totalDecks = tournaments.reduce((sum, t) => sum + t.deckCount, 0);
  const totalPlayers = tournaments.reduce((sum, t) => sum + (t.playerCount ?? 0), 0);
  const countries = new Set(tournaments.map((t) => t.countryCode).filter(Boolean));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-2xl border border-hairline bg-surface p-6 sm:p-8 lg:p-10">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, var(--color-arcane) 0%, transparent 50%), radial-gradient(circle at 80% 50%, var(--color-gold) 0%, transparent 50%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold">
              <Trophy className="text-white" size={24} />
            </div>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              Tournois
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-sm sm:text-base text-ink-secondary">
            Résultats, decklists et analyses de tous les tournois compétitifs Riftbound.
          </p>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-canvas/60 px-4 py-2.5">
              <Trophy size={16} className="text-gold shrink-0" />
              <div>
                <div className="text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  {tournaments.length}
                </div>
                <div className="text-[11px] text-ink-muted uppercase tracking-wider">Tournois</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-canvas/60 px-4 py-2.5">
              <Swords size={16} className="text-arcane shrink-0" />
              <div>
                <div className="text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  {totalDecks.toLocaleString("fr-FR")}
                </div>
                <div className="text-[11px] text-ink-muted uppercase tracking-wider">Decklists</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-canvas/60 px-4 py-2.5">
              <Users size={16} className="text-violet shrink-0" />
              <div>
                <div className="text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  {totalPlayers.toLocaleString("fr-FR")}
                </div>
                <div className="text-[11px] text-ink-muted uppercase tracking-wider">Joueurs</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-hairline bg-canvas/60 px-4 py-2.5">
              <Globe size={16} className="text-success shrink-0" />
              <div>
                <div className="text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  {countries.size}
                </div>
                <div className="text-[11px] text-ink-muted uppercase tracking-wider">Pays</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <p className="mt-12 text-center text-ink-muted">Aucun tournoi pour le moment.</p>
      ) : (
        <TournamentList tournaments={tournaments} />
      )}
    </div>
  );
}
