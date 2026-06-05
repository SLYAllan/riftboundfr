export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Hammer, Users, Trophy, BookOpen, Star, Eye, Heart } from "lucide-react";
import { cn, formatDate, displayLegendName } from "@/lib/utils";
import { DeckLegendFilter } from "@/components/deck-legend-filter";
import { DeckLikeButton } from "@/components/deck-like-button";
import { getBannerUrl } from "@/lib/banners";
import { getTournamentCountryCode, getTournamentInfo } from "@/lib/tournament-flags";
import { CountryBadge } from "@/components/country-badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Meilleurs Decks Riftbound — Decklists de tournois et guides" },
  description:
    "Toutes les decklists Riftbound : decks de tournois, builds compétitifs et guides pour chaque Légende. Trouvez votre prochain deck.",
  alternates: { canonical: "/decks" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Meilleurs Decks Riftbound — Decklists de tournois et guides",
    description:
      "Decklists de tournois, builds compétitifs et guides pour chaque Légende Riftbound.",
    images: ["/img/og-default.png"],
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

const CATEGORIES = [
  { key: "deckbuilder", label: "Créer son deck", href: "/deckbuilder", icon: Hammer, color: "violet" as const, isLink: true },
  { key: "community", label: "Communautaires", href: "/decks?cat=community", icon: Users, color: "arcane" as const, isLink: false },
  { key: "bestof", label: "Best of", href: "/decks?cat=bestof", icon: Star, color: "gold" as const, isLink: false },
  { key: "tournoi", label: "Tournois", href: "/decks?cat=tournoi", icon: Trophy, color: "gold" as const, isLink: false },
  { key: "guide", label: "Avec guide", href: "/decks?cat=guide", icon: BookOpen, color: "violet" as const, isLink: false },
] as const;

const COLOR_CLASSES = {
  violet: { base: "bg-violet text-white hover:opacity-90", active: "bg-violet text-white ring-2 ring-violet/40 ring-offset-1 ring-offset-canvas" },
  arcane: { base: "bg-arcane text-white hover:opacity-90", active: "bg-arcane text-white ring-2 ring-arcane/40 ring-offset-1 ring-offset-canvas" },
  gold: { base: "bg-gold text-white hover:opacity-90", active: "bg-gold text-white ring-2 ring-gold/40 ring-offset-1 ring-offset-canvas" },
};

const SET_STYLES: Record<string, { badge: string; active: string }> = {
  Unleashed: {
    badge: "bg-arcane/80 text-white",
    active: "bg-arcane/20 text-arcane ring-1 ring-arcane/40",
  },
  Spiritforged: {
    badge: "bg-emerald-600/80 text-white",
    active: "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40",
  },
  Origins: {
    badge: "bg-amber-600/80 text-white",
    active: "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40",
  },
};

export default async function DecksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cat = params.cat;
  const legendFilter = params.legend;
  const setFilter = params.set;
  const tournamentFilter = params.tournament;
  const sortParam = params.sort;
  const isCommunity = cat === "community";

  const TOURNAMENT_FILTERS = [
    { ctx: "Xi'an Regional Open S3", label: "Xi'an RO S3" },
    { ctx: "RQ Sydney 2026", label: "Sydney RQ" },
    { ctx: "RQ Vancouver 2026", label: "Vancouver RQ" },
    { ctx: "RQ Atlanta 2026", label: "Atlanta RQ" },
    { ctx: "RQ Lille 2026", label: "Lille RQ" },
    { ctx: "RQ Las Vegas 2026", label: "Las Vegas RQ" },
    { ctx: "RQ Bologna 2026", label: "Bologna RQ" },
    { ctx: "RQ Houston 2025", label: "Houston RQ" },
  ];

  if (isCommunity) {
    const domainFilter = params.domain;
    const tagFilter = params.tag;
    const comWhere: Record<string, unknown> = { isPublic: true };
    if (legendFilter) comWhere.legendName = { contains: legendFilter, mode: "insensitive" };
    if (domainFilter) comWhere.domains = { has: domainFilter };
    if (tagFilter) comWhere.tags = { has: tagFilter };

    const comOrderBy = sortParam === "popular" ? { likes: "desc" as const }
      : sortParam === "views" ? { views: "desc" as const }
      : { createdAt: "desc" as const };

    const communityDecks = await prisma.communityDeck.findMany({
      where: comWhere,
      orderBy: comOrderBy,
      take: 60,
    });

    const comLegends = await prisma.communityDeck.findMany({
      where: { isPublic: true },
      select: { legendName: true },
      distinct: ["legendName"],
      orderBy: { legendName: "asc" },
    });

    const DOMAIN_OPTIONS = ["Fury", "Calm", "Mind", "Body", "Chaos", "Order"];
    const TAG_OPTIONS = ["aggro", "contrôle", "combo", "midrange", "tempo", "budget", "compétitif"];

    function comLink(overrides: Record<string, string | null>) {
      const base: Record<string, string> = { cat: "community" };
      if (legendFilter) base.legend = legendFilter;
      if (domainFilter) base.domain = domainFilter;
      if (tagFilter) base.tag = tagFilter;
      if (sortParam) base.sort = sortParam;
      for (const [k, v] of Object.entries(overrides)) {
        if (v === null) delete base[k];
        else base[k] = v;
      }
      const qs = Object.entries(base).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
      return `/decks?${qs}`;
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Decks Riftbound — Decklists compétitives</h1>
        <p className="mt-2 text-ink-secondary">Decklists des Regional Qualifiers et tournois officiels Riftbound, builds compétitifs et decks communautaires, classés par Légende — avec guides et explications en français.</p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/decks" className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all", !cat ? "bg-arcane text-white" : "bg-surface-raised text-ink-secondary hover:text-ink")}>
            Tous
          </Link>
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isActive = !c.isLink && cat === c.key;
            const colors = COLOR_CLASSES[c.color];
            return (
              <Link key={c.key} href={c.href} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all", isActive ? colors.active : colors.base)}>
                <Icon size={15} /> {c.label}
              </Link>
            );
          })}
        </div>

        {/* Domain filters */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Link href={comLink({ domain: null })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-all", !domainFilter ? "bg-arcane/20 text-arcane ring-1 ring-arcane/40" : "bg-surface-raised text-ink-muted hover:text-ink")}>
            Tous domaines
          </Link>
          {DOMAIN_OPTIONS.map((d) => (
            <Link key={d} href={comLink({ domain: domainFilter === d ? null : d })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-all", domainFilter === d ? "bg-arcane/20 text-arcane ring-1 ring-arcane/40" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              {d}
            </Link>
          ))}
        </div>

        {/* Tag filters */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Link href={comLink({ tag: null })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-all", !tagFilter ? "bg-violet/20 text-violet ring-1 ring-violet/40" : "bg-surface-raised text-ink-muted hover:text-ink")}>
            Tous styles
          </Link>
          {TAG_OPTIONS.map((t) => (
            <Link key={t} href={comLink({ tag: tagFilter === t ? null : t })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-all capitalize", tagFilter === t ? "bg-violet/20 text-violet ring-1 ring-violet/40" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              {t}
            </Link>
          ))}
        </div>

        {/* Legend filter + sort */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Suspense>
            <DeckLegendFilter legends={comLegends.map((l) => l.legendName)} />
          </Suspense>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-ink-muted">Tri :</span>
            <Link href={comLink({ sort: null })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-all", !sortParam ? "bg-arcane/20 text-arcane ring-1 ring-arcane/40" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              Récent
            </Link>
            <Link href={comLink({ sort: "popular" })} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all", sortParam === "popular" ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              <Heart size={10} /> Populaire
            </Link>
            <Link href={comLink({ sort: "views" })} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all", sortParam === "views" ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              <Eye size={10} /> Vues
            </Link>
          </div>
        </div>

        <div className="mt-4 text-sm text-ink-muted">
          {communityDecks.length} deck{communityDecks.length !== 1 ? "s" : ""} communautaire{communityDecks.length !== 1 ? "s" : ""}
          {legendFilter && <span> pour <strong className="text-arcane">{legendFilter}</strong></span>}
          {domainFilter && <span> &middot; <strong>{domainFilter}</strong></span>}
          {tagFilter && <span> &middot; <strong className="capitalize">{tagFilter}</strong></span>}
        </div>

        {communityDecks.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-ink-muted">Aucun deck communautaire pour ces filtres.</p>
            <Link href="/deckbuilder" className="mt-4 inline-flex items-center gap-2 text-sm text-violet hover:underline">
              <Hammer size={14} /> Soyez le premier à partager un deck !
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communityDecks.map((deck) => {
              const bannerUrl = getBannerUrl(deck.legendName);
              return (
                <Link key={deck.id} href={`/d/${deck.shareCode}`} className="card-hover rounded-card border border-hairline overflow-hidden group relative">
                  <div className="relative h-28">
                    {bannerUrl ? (
                      <Image src={bannerUrl} alt={deck.legendName} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} />
                    ) : (
                      <div className="absolute inset-0 bg-surface-raised" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-canvas/70 via-canvas/30 to-transparent" />
                    <div className="relative z-10 flex h-full flex-col justify-end p-3">
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-lg font-bold leading-tight text-ink drop-shadow-md" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                            {deck.title}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-arcane drop-shadow-sm">{displayLegendName(deck.legendName)}</span>
                            <span className="text-white/80 drop-shadow-sm">par {deck.authorName}</span>
                          </div>
                          {deck.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {deck.tags.map((t) => (
                                <span key={t} className="rounded-full bg-violet/20 px-1.5 py-0.5 text-[9px] font-semibold text-violet capitalize">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 text-[10px] text-white drop-shadow-md">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5"><Heart size={10} /> {deck.likes}</span>
                            <span className="flex items-center gap-0.5"><Eye size={10} /> {deck.views}</span>
                          </div>
                          <span className="text-white/75">{formatDate(deck.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const where: Record<string, unknown> = { published: true };
  if (cat === "tournoi") {
    if (tournamentFilter) {
      where.tournamentContext = tournamentFilter;
    } else {
      where.tournamentContext = { not: null };
    }
  } else if (cat === "guide") {
    where.guide = { not: null };
  } else if (cat === "bestof") {
    where.featured = true;
    if (tournamentFilter) where.tournamentContext = tournamentFilter;
  } else {
    if (tournamentFilter) {
      where.tournamentContext = tournamentFilter;
    } else {
      where.OR = [
        { tournamentContext: null },
        { featured: true },
      ];
    }
  }
  if (legendFilter) where.legendName = { contains: legendFilter, mode: "insensitive" };

  const [allDecks, legends] = await Promise.all([
    prisma.deck.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true, slug: true, title: true, legendName: true, legendId: true,
        playerName: true, authorName: true, placement: true, record: true,
        tournamentContext: true, tournamentTier: true, featured: true,
        sourceUrl: true, guide: true, createdAt: true, description: true, format: true, likes: true,
        sourceArticle: { select: { slug: true, title: true } },
      },
    }),
    prisma.deck.findMany({
      where: { published: true },
      select: { legendName: true },
      distinct: ["legendName"],
      orderBy: { legendName: "asc" },
    }),
  ]);

  const deckIds = allDecks.map((d) => d.id);
  const setTags = deckIds.length > 0
    ? await prisma.$queryRaw<Array<{ id: string; setTag: string }>>`
        SELECT id, "setTag" FROM "Deck" WHERE id = ANY(${deckIds})
      `
    : [];
  const setTagMap = new Map(setTags.map((r) => [r.id, r.setTag]));

  let decks = allDecks.map((d) => ({ ...d, setTag: setTagMap.get(d.id) ?? "Unleashed" }));

  if (setFilter) {
    decks = decks.filter((d) => d.setTag === setFilter);
  }

  if (sortParam === "popular") {
    decks.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0) || (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  } else {
    const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };
    decks.sort((a, b) => {
      const ta = a.tournamentTier ? (TIER_ORDER[a.tournamentTier] ?? 5) : 5;
      const tb = b.tournamentTier ? (TIER_ORDER[b.tournamentTier] ?? 5) : 5;
      if (ta !== tb) return ta - tb;
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    });
  }

  const legendNames = legends.map((l) => l.legendName);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Decks Riftbound — Decklists compétitives</h1>
      <p className="mt-2 text-ink-secondary">Decklists des Regional Qualifiers et tournois officiels Riftbound, builds compétitifs et decks communautaires, classés par Légende — avec guides et explications en français.</p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Link
          href="/decks"
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
            !cat && !setFilter ? "bg-arcane text-white" : "bg-surface-raised text-ink-secondary hover:text-ink",
          )}
        >
          Tous
        </Link>
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = !c.isLink && cat === c.key;
          const colors = COLOR_CLASSES[c.color];
          return (
            <Link
              key={c.key}
              href={c.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                isActive ? colors.active : colors.base,
              )}
            >
              <Icon size={15} /> {c.label}
            </Link>
          );
        })}
      </div>

      {(!cat || cat === "tournoi" || cat === "bestof") && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={cat ? `/decks?cat=${cat}` : "/decks"}
            className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              !tournamentFilter ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-surface-raised text-ink-muted hover:text-ink"
            )}
          >
            <Trophy size={11} /> Tous
          </Link>
          {TOURNAMENT_FILTERS.map((t) => {
            const info = getTournamentInfo(t.ctx);
            const cc = info?.countryCode;
            const isActive = tournamentFilter === t.ctx;
            return (
              <Link
                key={t.ctx}
                href={`/decks?${cat ? `cat=${cat}&` : ""}tournament=${encodeURIComponent(t.ctx)}`}
                className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  isActive ? "bg-gold/20 text-gold ring-1 ring-gold/40" : "bg-surface-raised text-ink-muted hover:text-ink"
                )}
              >
                {cc && <CountryBadge code={cc} />}
                {t.label}
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={cat ? `/decks?cat=${cat}` : "/decks"}
          className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
            !setFilter ? "bg-ink/10 text-ink ring-1 ring-ink/20" : "bg-surface-raised text-ink-muted hover:text-ink"
          )}
        >
          Tous les sets
        </Link>
        {(["Unleashed", "Spiritforged", "Origins"] as const).map((s) => (
          <Link
            key={s}
            href={`/decks?set=${s}${cat ? `&cat=${cat}` : ""}`}
            className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              setFilter === s ? SET_STYLES[s].active : "bg-surface-raised text-ink-muted hover:text-ink"
            )}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Suspense>
          <DeckLegendFilter legends={legendNames} />
        </Suspense>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-ink-muted">Tri :</span>
          <Link
            href={`/decks${(() => { const q = [cat && `cat=${cat}`, setFilter && `set=${setFilter}`, tournamentFilter && `tournament=${encodeURIComponent(tournamentFilter)}`, legendFilter && `legend=${encodeURIComponent(legendFilter)}`].filter(Boolean).join("&"); return q ? `?${q}` : ""; })()}`}
            className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
              sortParam !== "popular" ? "bg-arcane/20 text-arcane ring-1 ring-arcane/40" : "bg-surface-raised text-ink-muted hover:text-ink"
            )}
          >
            Recent
          </Link>
          <Link
            href={`/decks?${["sort=popular", cat && `cat=${cat}`, setFilter && `set=${setFilter}`, tournamentFilter && `tournament=${encodeURIComponent(tournamentFilter)}`, legendFilter && `legend=${encodeURIComponent(legendFilter)}`].filter(Boolean).join("&")}`}
            className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
              sortParam === "popular" ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40" : "bg-surface-raised text-ink-muted hover:text-ink"
            )}
          >
            <Heart size={10} /> Populaire
          </Link>
        </div>
      </div>

      <div className="mt-4 text-sm text-ink-muted">
        {decks.length} deck{decks.length !== 1 ? "s" : ""}
        {legendFilter && <span> pour <strong className="text-arcane">{legendFilter}</strong></span>}
        {cat && <span> &middot; {cat === "tournoi" ? "Tournois" : cat === "guide" ? "Avec guide" : cat === "bestof" ? "Best of" : cat}</span>}
        {setFilter && <span> &middot; <strong>{setFilter}</strong></span>}
        {tournamentFilter && <span> &middot; <strong>{TOURNAMENT_FILTERS.find((t) => t.ctx === tournamentFilter)?.label ?? tournamentFilter}</strong></span>}
      </div>

      {decks.length === 0 ? (
        <p className="mt-12 text-center text-ink-muted">Aucun deck pour ces filtres.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => {
            const bannerUrl = getBannerUrl(deck.legendName);
            const style = SET_STYLES[deck.setTag];
            return (
              <Link key={deck.id} href={`/decks/${deck.slug}`} className="card-hover rounded-card border border-hairline overflow-hidden group relative">
                <div className="relative h-28">
                  {bannerUrl ? (
                    <Image src={bannerUrl} alt={deck.legendName} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} />
                  ) : (
                    <div className="absolute inset-0 bg-surface-raised" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-canvas/70 via-canvas/30 to-transparent" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-3">
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <div className="text-lg font-bold leading-tight text-ink drop-shadow-md" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                          {displayLegendName(deck.legendName)}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                          {deck.tournamentContext && (() => {
                            const cc = getTournamentCountryCode(deck.tournamentContext);
                            return (
                              <span className="flex items-center gap-1 text-gold drop-shadow-sm">
                                {cc && <CountryBadge code={cc} />}
                                {deck.tournamentContext}
                              </span>
                            );
                          })()}
                          {deck.placement && <span className="font-semibold text-ink-secondary drop-shadow-sm">{deck.placement}</span>}
                          {(deck.playerName || deck.authorName) && <span className="text-white/90 drop-shadow-sm">par {deck.playerName || deck.authorName}</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <DeckLikeButton slug={deck.slug} initialLikes={deck.likes} compact />
                        {style && (
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", style.badge)}>
                            {deck.setTag}
                          </span>
                        )}
                        {deck.featured && (
                          <span className="rounded-full bg-gold/80 px-2 py-0.5 text-[10px] font-bold text-canvas">
                            Best of
                          </span>
                        )}
                        {deck.tournamentTier && (
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                            deck.tournamentTier === "S" ? "bg-arcane/90 text-white"
                              : deck.tournamentTier === "A" ? "bg-violet/90 text-white"
                              : "bg-surface/80 text-ink-secondary"
                          )}>
                            {deck.tournamentTier}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
