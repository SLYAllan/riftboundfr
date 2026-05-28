import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify, formatDate } from "@/lib/utils";
import { getTournamentCountryCode, getTournamentInfo } from "@/lib/tournament-flags";
import { getLegendIconUrl, getBannerUrl } from "@/lib/banners";
import { CountryBadge } from "@/components/country-badge";
import { TournamentDeckGrid } from "@/components/tournament-deck-grid";
import { Users, MapPin, Calendar, Swords, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

function parsePlacement(p: string | null): number {
  if (!p) return 9999;
  const n = parseInt(p.replace(/[^0-9]/g, ""));
  return isNaN(n) ? 9999 : n;
}

async function findTournamentContext(slug: string): Promise<string | null> {
  const contexts: { tournamentContext: string }[] = await prisma.$queryRaw`
    SELECT DISTINCT "tournamentContext" FROM "Deck"
    WHERE published = true AND "tournamentContext" IS NOT NULL
  `;
  return contexts.find((c) => slugify(c.tournamentContext) === slug)?.tournamentContext ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const ctx = await findTournamentContext(slug);
  if (!ctx) return { title: "Tournoi introuvable" };
  const info = getTournamentInfo(ctx);
  const name = info?.name ?? ctx;
  return {
    title: `${name} — Tournoi Riftbound`,
    description: `Decklists et résultats du tournoi ${name}.`,
  };
}

export default async function TournamentDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const legendFilter = sp.legend;

  const ctx = await findTournamentContext(slug);
  if (!ctx) notFound();

  const info = getTournamentInfo(ctx);
  const cc = getTournamentCountryCode(ctx);
  const name = info?.name ?? ctx;

  const where: Record<string, unknown> = {
    published: true,
    tournamentContext: ctx,
  };
  if (legendFilter) {
    where.legendName = { contains: legendFilter, mode: "insensitive" };
  }

  const [decksRaw, allLegendsRaw, articles] = await Promise.all([
    prisma.deck.findMany({
      where,
      select: {
        id: true,
        slug: true,
        legendName: true,
        playerName: true,
        placement: true,
        record: true,
        tournamentTier: true,
        featured: true,
        sourceArticleId: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.deck.findMany({
      where: { published: true, tournamentContext: ctx, placement: { not: null } },
      select: { legendName: true },
      distinct: ["legendName"],
      orderBy: { legendName: "asc" },
    }),
    prisma.article.findMany({
      where: { published: true, NOT: { tournamentName: null } },
      select: {
        slug: true,
        title: true,
        tournamentName: true,
        tournamentLocation: true,
        tournamentDate: true,
        tournamentPlayerCount: true,
      },
    }),
  ]);

  const cityLower = info?.city.toLowerCase() ?? ctx.toLowerCase();
  const matchedArticles = articles.filter((a) => {
    const artCity = a.tournamentLocation?.split(",")[0]?.trim().toLowerCase() ?? "";
    return artCity && cityLower.includes(artCity);
  });

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

  const decks = (() => {
    const groups = new Map<string, typeof decksRaw>();
    for (const d of decksRaw) {
      const key = `${d.legendName.toLowerCase()}||${d.placement ?? ""}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }

    const kept: typeof decksRaw = [];
    for (const group of groups.values()) {
      if (group.length <= 1) {
        kept.push(group[0]);
        continue;
      }
      const bestOf = group.find((d) => d.featured && d.sourceArticleId);
      kept.push(bestOf ?? group[0]);
    }
    return kept;
  })();

  const sorted = decks
    .map((d) => ({
      ...d,
      placementNum: parsePlacement(d.placement),
      legendIcon: getLegendIconUrl(d.legendName),
      bannerUrl: getBannerUrl(d.legendName),
    }))
    .sort((a, b) => a.placementNum - b.placementNum);

  const legendCounts = new Map<string, number>();
  for (const l of allLegendsRaw) {
    legendCounts.set(l.legendName, (legendCounts.get(l.legendName) ?? 0) + 1);
  }
  const legendNames = [...legendCounts.keys()].sort();
  const legendCountsObj = Object.fromEntries(legendCounts);
  const totalDecks = allLegendsRaw.length;

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back nav */}
      <Link
        href="/tournois"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={14} />
        Tous les tournois
      </Link>

      {/* Hero section */}
      <div className="mt-6 rounded-card border border-hairline bg-surface/30 p-6 sm:p-8">
        {/* Title row */}
        <div className="flex flex-wrap items-center gap-3">
          {cc && <CountryBadge code={cc} className="text-xs px-2 py-1" />}
          <h1
            className="text-3xl font-bold sm:text-4xl lg:text-5xl text-ink"
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          >
            {name}
          </h1>
        </div>

        {/* Stats row */}
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {date && (
            <div className="flex items-center gap-2 text-ink-secondary">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-surface-raised">
                <Calendar size={14} className="text-arcane" />
              </div>
              <span>{formatDate(date)}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-ink-secondary">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-surface-raised">
                <MapPin size={14} className="text-arcane" />
              </div>
              <span>{location}</span>
            </div>
          )}
          {playerCount && (
            <div className="flex items-center gap-2 text-ink-secondary">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-surface-raised">
                <Users size={14} className="text-arcane" />
              </div>
              <span>{playerCount.toLocaleString("fr-FR")} joueurs</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-ink-secondary">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-surface-raised">
              <Swords size={14} className="text-arcane" />
            </div>
            <span>{totalDecks} decklists</span>
          </div>
        </div>

        {/* Article links as pill badges */}
        {matchedArticles.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {matchedArticles.map((a) => (
              <Link
                key={a.slug}
                href={`/articles/${a.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-arcane/10 border border-arcane/20 px-4 py-1.5 text-xs font-semibold text-arcane hover:bg-arcane/20 hover:border-arcane/30 transition-colors"
              >
                <BookOpen size={12} />
                {a.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Deck grid */}
      <TournamentDeckGrid
        decks={sorted}
        legends={legendNames}
        legendCounts={legendCountsObj}
        tournamentSlug={slug}
        currentLegend={legendFilter ?? null}
        filteredCount={decks.length}
        totalCount={totalDecks}
      />
    </div>
  );
}
