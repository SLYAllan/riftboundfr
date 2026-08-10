export const revalidate = 3600;

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify, formatDate, displayLegendName } from "@/lib/utils";
import { getTournamentCountryCode, getTournamentInfo } from "@/lib/tournament-flags";
import { getLegendIconUrl, getBannerUrl } from "@/lib/banners";
import { CountryBadge } from "@/components/country-badge";
import { TournamentDeckGrid } from "@/components/tournament-deck-grid";
import { Users, MapPin, Calendar, Swords, ArrowLeft, BookOpen } from "lucide-react";
import Link from "@/components/lien";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { Metadata } from "next";
import { tr } from "@/lib/i18n-server";

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
  const title = `${name} - Tournoi Riftbound`;
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
  const t = await tr();
  const { slug } = await params;
  const sp = await searchParams;
  const legendFilter = sp.legend;

  const ctx = await findTournamentContext(slug);
  if (!ctx) notFound();

  const info = getTournamentInfo(ctx);
  const cc = getTournamentCountryCode(ctx);
  const name = info?.name ?? ctx;

  // On récupère TOUS les decks du tournoi (vrais + best-of), puis on construit
  // le pool affiché : vrais decks classés + best-of "fillers" pour les
  // placements absents des vrais decks (ex. Lille : le top 5 n'existe qu'en
  // best-of). Si aucun vrai deck classé (best-of only, ex. Vancouver), on garde tout.
  const [allRaw, articles] = await Promise.all([
    prisma.deck.findMany({
      where: { published: true, tournamentContext: ctx },
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

  // Dédoublonné, cohérent avec l'affichage (sert aussi aux compteurs/total).
  const deduped = (() => {
    const realRanked = allRaw.filter((d) => !d.slug.startsWith("best-of-") && d.placement !== null);
    let pool: typeof allRaw;
    if (realRanked.length > 0) {
      const realPlacements = new Set(realRanked.map((d) => parsePlacement(d.placement)));
      const fillers = allRaw.filter(
        (d) => d.slug.startsWith("best-of-") && d.placement !== null && !realPlacements.has(parsePlacement(d.placement)),
      );
      pool = [...realRanked, ...fillers];
    } else {
      pool = allRaw; // best-of only
    }

    const groups = new Map<string, typeof allRaw>();
    for (const d of pool) {
      const key = `${d.legendName.toLowerCase()}||${d.placement ?? ""}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }
    const kept: typeof allRaw = [];
    for (const group of groups.values()) {
      if (group.length <= 1) { kept.push(group[0]); continue; }
      const bestOf = group.find((d) => d.featured && d.sourceArticleId);
      kept.push(bestOf ?? group[0]);
    }
    return kept;
  })();

  // Filtre par légende appliqué après dédup (la couverture des placements reste complète).
  const decks = legendFilter
    ? deduped.filter((d) => d.legendName.toLowerCase().includes(legendFilter.toLowerCase()))
    : deduped;

  const sorted = decks
    .map((d) => ({
      ...d,
      placementNum: parsePlacement(d.placement),
      legendIcon: getLegendIconUrl(d.legendName),
      bannerUrl: getBannerUrl(d.legendName),
    }))
    .sort((a, b) => a.placementNum - b.placementNum);

  // Vainqueur pris sur le pool complet : le hero ne change pas quand on filtre.
  const winnerRaw = deduped.find((d) => parsePlacement(d.placement) === 1) ?? null;
  const winner = winnerRaw
    ? { ...winnerRaw, bannerUrl: getBannerUrl(winnerRaw.legendName), playerName: winnerRaw.playerName }
    : null;

  const legendCounts = new Map<string, number>();
  for (const d of deduped) {
    legendCounts.set(d.legendName, (legendCounts.get(d.legendName) ?? 0) + 1);
  }
  const legendNames = [...legendCounts.keys()].sort();
  const legendCountsObj = Object.fromEntries(legendCounts);
  const totalDecks = deduped.length;

  // Méta du tournoi : part du champ + conversion en Top 8 par légende,
  // sur le pool complet (indépendant du filtre).
  const legendStats = (() => {
    const m = new Map<string, { name: string; icon: string | null; count: number; top8: number }>();
    for (const d of deduped) {
      const e = m.get(d.legendName) ?? {
        name: d.legendName,
        icon: getLegendIconUrl(d.legendName),
        count: 0,
        top8: 0,
      };
      e.count++;
      if (parsePlacement(d.placement) <= 8) e.top8++;
      m.set(d.legendName, e);
    }
    return [...m.values()].sort((a, b) => b.count - a.count);
  })();
  const fmtShare = (count: number) =>
    ((count / totalDecks) * 100).toFixed(1).replace(".", ",");

  // JSON-LD d'entité (M14) : tournoi = Event citable.
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";
  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    url: `${SITE}/tournois/${slug}`,
    ...(date ? { startDate: date } : {}),
    ...(location ? { location: { "@type": "Place", name: location } } : {}),
    ...(playerCount ? { maximumAttendeeCapacity: playerCount } : {}),
    description: `Tournoi compétitif Riftbound : résultats, Top 8 et decklists${location ? ` (${location})` : ""}.`,
    inLanguage: "fr",
  };

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd).replace(/</g, "\\u003c") }} />
      {/* Back nav + fil d'Ariane */}
      <Breadcrumbs
        items={[
          { name: "Tournois", href: "/tournois" },
          { name, href: `/tournois/${slug}` },
        ]}
      />

      {/* Hero : l'art de la légende du vainqueur en fond, fondu dans la carte */}
      <div className="relative mt-6 overflow-hidden rounded-card border border-hairline bg-surface/50 p-6 sm:p-8">
        {winner?.bannerUrl && (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 max-w-[560px] sm:block"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 45%)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 45%)",
            }}
          >
            <img
              src={winner.bannerUrl}
              alt=""
              className="h-full w-full object-cover object-[center_20%] opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/45 to-canvas/10" />
            <div className="absolute bottom-4 right-6 text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-gold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                Vainqueur
              </div>
              <div className="text-base font-bold leading-tight text-ink drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                {winner.playerName ?? "Inconnu"}
              </div>
              <div className="text-xs leading-tight text-ink-secondary drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {displayLegendName(winner.legendName)}
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 sm:max-w-[60%]">
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
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-secondary">
            {date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-ink-muted" />
                {formatDate(date)}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-ink-muted" />
                {location}
              </span>
            )}
            {playerCount && (
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-ink-muted" />
                {playerCount.toLocaleString("fr-FR")} joueurs
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Swords size={14} className="text-ink-muted" />
              {totalDecks} decklists
            </span>
          </div>

          {/* Article links as pill badges */}
          {matchedArticles.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {matchedArticles.map((a) => (
                <Link
                  key={a.slug}
                  href={`/articles/${a.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-arcane px-4 py-1.5 text-xs font-semibold text-canvas hover:opacity-90 transition-opacity"
                >
                  <BookOpen size={12} />
                  {a.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Méta du tournoi : chaque barre est une bande d'art de la légende,
          sa longueur = sa part du champ. Badge or = conversion en Top 8. */}
      {legendStats.length > 1 && (
        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2
              className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-ink-secondary"
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              <Swords size={16} className="text-arcane" />{t("Méta du tournoi")}</h2>
            <span className="text-sm text-ink-muted">
              {legendStats.length} légendes &middot; {totalDecks.toLocaleString("fr-FR")} decklists
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {legendStats.slice(0, 8).map((l) => {
              const banner = getBannerUrl(l.name);
              return (
                <Link
                  key={l.name}
                  href={`/tournois/${slug}?legend=${encodeURIComponent(l.name)}`}
                  className="group relative h-28 overflow-hidden rounded-card border border-hairline transition duration-200 hover:border-hairline-strong hover:shadow-lg hover:shadow-black/20"
                >
                  {banner ? (
                    <img
                      src={banner}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{ objectPosition: "center 20%" }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-raised" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/55 to-transparent" />

                  {l.top8 > 0 && (
                    <span className="absolute right-2 top-2 rounded bg-canvas/70 px-1.5 py-0.5 text-[10px] font-bold text-gold backdrop-blur-sm">
                      {l.top8}&nbsp;en Top&nbsp;8
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div
                      className="text-xl font-bold leading-none text-ink drop-shadow-md"
                      style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                    >
                      {fmtShare(l.count)}&nbsp;%
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-secondary">
                      {l.icon && <img src={l.icon} alt="" className="h-4 w-4 rounded" />}
                      <span className="truncate">{displayLegendName(l.name)}</span>
                      <span className="shrink-0 text-ink-muted">&middot; {l.count.toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {legendStats.length > 8 && (
            <div className="mt-3 text-xs text-ink-muted">
              + {legendStats.length - 8} autres légendes, à retrouver via le filtre ci-dessous
            </div>
          )}
        </section>
      )}

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
