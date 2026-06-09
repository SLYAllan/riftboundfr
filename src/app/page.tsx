export const revalidate = 60;

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookOpen, Layers, BookText, Shield, ArrowRight, Gamepad2, Newspaper, Trophy, Library, Upload } from "lucide-react";
import { getBannerUrl, getLegendIconUrl } from "@/lib/banners";
import { displayLegendName, formatDate } from "@/lib/utils";
import { getTournamentCountryCode } from "@/lib/tournament-flags";
import { CountryBadge } from "@/components/country-badge";
import { HomeTierList } from "@/components/home-tier-list";

const getHomeData = unstable_cache(
  async () => {
    const [tierLists, allDecks, latestArticles, tournamentArticles, cardCount] = await Promise.all([
      prisma.tierList.findMany({
        where: { published: true },
        include: { entries: { orderBy: { position: "asc" } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.deck.findMany({
        where: {
          published: true,
          OR: [
            { tournamentContext: null },
            { featured: true },
          ],
        },
        select: {
          id: true,
          slug: true,
          legendName: true,
          playerName: true,
          placement: true,
          tournamentTier: true,
          tournamentContext: true,
          featured: true,
        },
      }),
      prisma.article.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: { slug: true, title: true, coverImage: true, category: true, publishedAt: true },
      }),
      prisma.article.findMany({
        where: { published: true, tournamentName: { not: null } },
        orderBy: { tournamentDate: "desc" },
        take: 5,
        select: { slug: true, title: true, tournamentName: true, tournamentDate: true, tournamentLocation: true },
      }),
      prisma.card.count(),
    ]);

    const legendIds = [
      ...new Set(tierLists.flatMap((tl) => tl.entries.map((e) => e.legendId))),
    ];
    const legendCards = legendIds.length
      ? await prisma.card.findMany({
          where: { riftboundId: { in: legendIds } },
        })
      : [];
    const legendEntries: [string, { imageUrl: string | null; domains: string[] }][] =
      legendCards.map((c) => [
        c.riftboundId,
        { imageUrl: getLegendIconUrl(c.name) ?? c.imageUrl, domains: c.domains },
      ]);

    const shuffled = allDecks.sort(() => Math.random() - 0.5);
    const randomDecks = shuffled.slice(0, 6);

    return { tierLists, randomDecks, legendEntries, latestArticles, tournamentArticles, cardCount };
  },
  ["home-data"],
  { revalidate: 60, tags: ["home"] },
);

const categoryLabels: Record<string, string> = {
  actualite: "Actualité",
  guide: "Guide",
  tournoi: "Tournoi",
  meta: "Méta",
  "patch-notes": "Patch Notes",
};

const guides = [
  {
    href: "/guides/debuter",
    icon: BookOpen,
    title: "Guide du débutant",
    description: "Règles, phases de tour, ressources et conditions de victoire.",
  },
  {
    href: "/guides/deckbuilding",
    icon: Layers,
    title: "Guide de deckbuilding",
    description: "Courbe d'énergie, ratios et synergies de domaines.",
  },
  {
    href: "/guides/domaines",
    icon: Shield,
    title: "Les 6 Domaines",
    description: "Fury, Calm, Mind, Body, Chaos, Order : forces et légendes.",
  },
  {
    href: "/guides/glossaire",
    icon: BookText,
    title: "Glossaire",
    description: "Tous les mots-clés et termes du jeu en français.",
  },
  {
    href: "/guides/jouer-en-ligne",
    icon: Gamepad2,
    title: "Jouer en ligne",
    description: "TCG Arena et RiftAtlas : comment jouer depuis chez vous.",
  },
];

export default async function HomePage() {
  let tierLists: Awaited<ReturnType<typeof getHomeData>>["tierLists"] = [];
  let randomDecks: Awaited<ReturnType<typeof getHomeData>>["randomDecks"] = [];
  let latestArticles: Awaited<ReturnType<typeof getHomeData>>["latestArticles"] = [];
  let tournamentArticles: Awaited<ReturnType<typeof getHomeData>>["tournamentArticles"] = [];
  let cardCount = 0;
  let legendMap = new Map<string, { imageUrl: string | null; domains: string[] }>();
  try {
    const data = await getHomeData();
    tierLists = data.tierLists;
    randomDecks = data.randomDecks;
    latestArticles = data.latestArticles;
    tournamentArticles = data.tournamentArticles;
    cardCount = data.cardCount;
    legendMap = new Map(data.legendEntries);
  } catch {}

  return (
    <div>
      {/* Hero — Logo centered */}
      <section className="flex flex-col items-center gap-3 px-4 pt-10 pb-6">
        <Link href="/">
          <Image
            src="/logorbfr.png"
            alt="Riftbound France"
            width={224}
            height={112}
            priority
            className="h-20 sm:h-28 w-auto drop-shadow-lg"
          />
        </Link>
        <h1
          className="text-center text-xl font-bold sm:text-2xl"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          La référence Riftbound en français
        </h1>
      </section>

      {/* 3-column layout */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr] items-stretch">
          {/* Left — Random decks grid */}
          <div className="flex flex-col rounded-card border border-hairline bg-surface overflow-hidden">
            <div className="border-b border-hairline px-4 py-3 flex items-center justify-between">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-rubik), sans-serif" }}
              >
                Decks à la une
              </h2>
              <Link
                href="/decks"
                className="flex items-center gap-1 text-xs text-arcane hover:text-arcane-light"
              >
                Tous les decks <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-1 p-2 content-center">
              {randomDecks.map((deck) => {
                // Icône de légende = image source carrée (800×800), nette en vignette
                // carrée ; fallback bannière large si pas d'icône.
                const imgUrl = getLegendIconUrl(deck.legendName) ?? getBannerUrl(deck.legendName);
                return (
                  <Link
                    key={deck.id}
                    href={`/decks/${deck.slug}`}
                    className="group relative overflow-hidden rounded-lg aspect-square"
                  >
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={deck.legendName}
                        fill
                        sizes="(max-width: 640px) 30vw, (max-width: 1024px) 15vw, 160px"
                        loading="lazy"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-surface-raised" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-1.5">
                      <div className="flex items-end justify-between gap-1">
                        <span
                          className="text-[11px] font-bold leading-tight text-ink drop-shadow-md truncate"
                          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                        >
                          {displayLegendName(deck.legendName)}
                        </span>
                        {deck.tournamentTier && (
                          <span className="shrink-0 rounded bg-canvas/60 px-1 py-0.5 text-[9px] font-bold text-arcane">
                            {deck.tournamentTier}
                          </span>
                        )}
                      </div>
                      {deck.tournamentContext && (
                        <div className="text-[9px] text-gold/80 truncate leading-tight mt-0.5">
                          {deck.tournamentContext}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center — Guides list */}
          <div className="rounded-card border border-hairline bg-surface overflow-hidden flex flex-col">
            <div className="border-b border-hairline px-5 py-3">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-rubik), sans-serif" }}
              >
                Guides
              </h2>
            </div>
            <div className="divide-y divide-hairline flex-1">
              {guides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="flex items-start gap-4 px-5 py-5 transition-colors hover:bg-surface-raised/50"
                >
                  <guide.icon className="mt-0.5 shrink-0 text-arcane" size={22} />
                  <div>
                    <div
                      className="font-bold text-base"
                      style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                    >
                      {guide.title}
                    </div>
                    <p className="mt-1 text-sm text-ink-secondary leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right — Tier list */}
          <HomeTierList tierLists={tierLists} legendMap={legendMap} />
        </div>
      </section>

      {/* Encarts — Articles · Collection · Tournois */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {/* Articles */}
          <div className="rounded-card border border-hairline bg-surface overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                <Newspaper size={18} className="text-violet" /> Derniers articles
              </h2>
              <Link href="/articles" className="flex items-center gap-1 text-xs text-arcane hover:text-arcane-light">
                Tous <ArrowRight size={14} />
              </Link>
            </div>
            {latestArticles.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-muted">Aucun article pour le moment.</p>
            ) : (
              <div className="divide-y divide-hairline flex-1">
                {latestArticles.map((a) => (
                  <Link key={a.slug} href={`/articles/${a.slug}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-raised/50">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface-raised">
                      {a.coverImage ? (
                        <Image src={a.coverImage} alt="" fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ink-muted"><Newspaper size={16} /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-violet">
                        {categoryLabels[a.category] ?? a.category}
                        {a.publishedAt && <span className="font-normal normal-case text-ink-muted">{formatDate(a.publishedAt)}</span>}
                      </div>
                      <div className="mt-0.5 truncate text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{a.title}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Collection */}
          <div className="rounded-card border border-hairline bg-surface overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                <Library size={18} className="text-arcane" /> Ma collection
              </h2>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <p className="text-sm text-ink-secondary leading-relaxed">
                Suis ta collection Riftbound en classeurs, repère tes cartes manquantes et vois quels decks méta tu peux déjà jouer.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-hairline bg-canvas/60 px-3 py-2.5">
                  <div className="text-xl font-bold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{cardCount.toLocaleString("fr-FR")}</div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-muted">cartes à collectionner</div>
                </div>
                <div className="rounded-lg border border-hairline bg-canvas/60 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-sm font-semibold"><Upload size={14} className="text-arcane" /> Import CSV</div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-ink-muted">Piltover Archive</div>
                </div>
              </div>
              <Link href="/collection" className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-arcane px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-arcane/90">
                Gérer ma collection <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Tournois */}
          <div className="rounded-card border border-hairline bg-surface overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                <Trophy size={18} className="text-gold" /> Tournois
              </h2>
              <Link href="/tournois" className="flex items-center gap-1 text-xs text-arcane hover:text-arcane-light">
                Tous <ArrowRight size={14} />
              </Link>
            </div>
            {tournamentArticles.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-muted">Aucun tournoi pour le moment.</p>
            ) : (
              <div className="divide-y divide-hairline flex-1">
                {tournamentArticles.map((t) => {
                  const cc = t.tournamentName ? getTournamentCountryCode(t.tournamentName) : null;
                  return (
                    <Link key={t.slug} href={`/articles/${t.slug}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-raised/50">
                      {cc ? <CountryBadge code={cc} /> : <Trophy size={16} className="shrink-0 text-gold" />}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t.tournamentName ?? t.title}</div>
                        <div className="text-[11px] text-ink-muted">
                          {t.tournamentLocation ? t.tournamentLocation.split(",")[0] : ""}
                          {t.tournamentDate ? `${t.tournamentLocation ? " · " : ""}${formatDate(t.tournamentDate)}` : ""}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
