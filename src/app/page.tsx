export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookOpen, Layers, BookText, Shield, ArrowRight, Gamepad2 } from "lucide-react";
import { getBannerUrl, getLegendIconUrl } from "@/lib/banners";
import { displayLegendName } from "@/lib/utils";
import { HomeTierList } from "@/components/home-tier-list";

const getHomeData = unstable_cache(
  async () => {
    const [tierLists, allDecks] = await Promise.all([
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
    const randomDecks = shuffled.slice(0, 9);

    return { tierLists, randomDecks, legendEntries };
  },
  ["home-data"],
  { revalidate: 60, tags: ["home"] },
);

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
  const { tierLists, randomDecks, legendEntries } = await getHomeData();
  const legendMap = new Map(legendEntries);

  return (
    <div>
      {/* Hero — Logo centered */}
      <section className="flex justify-center px-4 pt-10 pb-6">
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
      </section>

      {/* 3-column layout */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr] items-start">
          {/* Left — Random decks 3x3 grid */}
          <div className="rounded-card border border-hairline bg-surface overflow-hidden">
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
            <div className="grid grid-cols-3 gap-1 p-2">
              {randomDecks.map((deck) => {
                const bannerUrl = getBannerUrl(deck.legendName);
                return (
                  <Link
                    key={deck.id}
                    href={`/decks/${deck.slug}`}
                    className="group relative overflow-hidden rounded-lg aspect-[4/3]"
                  >
                    {bannerUrl ? (
                      <img
                        src={bannerUrl}
                        alt={deck.legendName}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
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
    </div>
  );
}
