import { prisma } from "@/lib/prisma";
import { getLegendIconUrl } from "@/lib/banners";
import { TierListTabs } from "./tier-list-tabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tier List",
  description:
    "Classement éditorial des légendes Riftbound par tier et par set. Guide français.",
  alternates: { canonical: "/tier-list" },
};

export default async function TierListPage() {
  const tierLists = await prisma.tierList.findMany({
    where: { published: true },
    include: { entries: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  if (tierLists.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Tier List
        </h1>
        <p className="mt-4 text-ink-secondary">
          Aucune tier list publiée pour le moment.
        </p>
      </div>
    );
  }

  const allLegendIds = [
    ...new Set(tierLists.flatMap((tl) => tl.entries.map((e) => e.legendId))),
  ];
  const allDeckIds = [
    ...new Set(
      tierLists
        .flatMap((tl) => tl.entries.map((e) => e.deckId))
        .filter((id): id is string => id != null),
    ),
  ];

  const [legendCards, linkedDecks] = await Promise.all([
    prisma.card.findMany({
      where: { riftboundId: { in: allLegendIds } },
    }),
    allDeckIds.length > 0
      ? prisma.deck.findMany({
          where: { id: { in: allDeckIds } },
          select: { id: true, slug: true },
        })
      : Promise.resolve([]),
  ]);

  const legendMap = Object.fromEntries(
    legendCards.map((c) => [
      c.riftboundId,
      { imageUrl: getLegendIconUrl(c.name) ?? c.imageUrl, domains: c.domains },
    ]),
  );
  const deckSlugMap = Object.fromEntries(
    linkedDecks.map((d) => [d.id, d.slug]),
  );

  const currentIdx = tierLists.findIndex((tl) => tl.current);
  const defaultTab =
    currentIdx >= 0 ? tierLists[currentIdx].id : tierLists[0].id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="text-center">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Tier Lists
        </h1>
        <p className="mt-2 text-ink-secondary">
          Classement éditorial par set et global, basé sur les résultats de
          tournois.
        </p>
      </div>
      <TierListTabs
        tierLists={tierLists}
        legendMap={legendMap}
        deckSlugMap={deckSlugMap}
        defaultTab={defaultTab}
      />
    </div>
  );
}
