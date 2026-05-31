export const revalidate = 3600;

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify, formatDate } from "@/lib/utils";
import { getTournamentCountryCode, getTournamentInfo } from "@/lib/tournament-flags";
import { getLegendIconUrl, getBannerUrl } from "@/lib/banners";
import { CountryBadge } from "@/components/country-badge";
import { TournamentDeckGrid } from "@/components/tournament-deck-grid";
import { Users, MapPin, Calendar, Swords, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
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
  const bits: string[] = [];
  if (info?.playerCount) bits.push(`${info.playerCount} joueurs`);
  if (info?.date) bits.push(info.date);
  const meta = bits.length ? ` (${bits.join(", ")})` : "";
  const title = `${name} — Tournoi Riftbound`;
  const description = `Résultats, top 8 et decklists du tournoi Riftbound ${name}${meta}.`;
  return {
    title,
    description,
    alternates: { canonical: `/tournois/${slug}` },
    openGraph: {
      type: "article",
      siteName: "Riftbound France",
      locale: "fr_FR",
      title,
      description,
      images: ["/img/og-default.png"],
    },
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
    prisma.deck.groupBy({
      by: ["legendName"],
      where: { published: true, tournamentContext: ctx, placement: { not: null } },
      _count: { legendName: true },
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
    // Si le tournoi a des résultats classés, masquer les decks best-of (placement null, issus
    // d'articles) qui dupliqueraient les légendes. Sinon (tournoi best-of-only, ex. Sydney), les garder.
    const hasRanked = decksRaw.some((d) => d.placement !== null);
    const pool = hasRanked ? decksRaw.filter((d) => d.placement !== null) : decksRaw;

    const groups = new Map<string, typeof decksRaw>();
    for (const d of pool) {
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
  for (const g of allLegendsRaw) {
    legendCounts.set(g.legendName, g._count.legendName);
  }
  const legendNames = [...legendCounts.keys()].sort();
  const legendCountsObj = Object.fromEntries(legendCounts);
  // Vrai nombre de decklists classées (allLegendsRaw est distinct par légende, pas le total de decks)
  const totalDecks = await prisma.deck.count({
    where: { published: true, tournamentContext: ctx, placement: { not: null } },
  });

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back nav + fil d'Ariane */}
      <Breadcrumbs
        items={[
          { name: "Tournois", href: "/tournois" },
          { name, href: `/tournois/${slug}` },
        ]}
      />

      {/* Hero section */}
      <div className="mt-6 rounded-card border border-hairline bg-surface/30 p-6 sm:p-8">
        {/* Title row */}
        <div className="flex flex-wrap items-center gap-3">
          {cc && <CountryBadge code={cc} className="h-7 w-10" />}
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
