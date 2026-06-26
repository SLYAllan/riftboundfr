// force-dynamic: queries the DB; `revalidate` froze it empty at Docker build.
export const dynamic = "force-dynamic";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getLegendIconUrl } from "@/lib/banners";
import { TierListTabs } from "./tier-list-tabs";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";

// Cache runtime (5 min, tag "tier-list") : tier lists + cartes légende + decks liés
// en une fois, au lieu de 3 requêtes Prisma à chaque crawl. Invalidable via revalidateTag.
const getTierListData = unstable_cache(
  async () => {
    const tierLists = await prisma.tierList.findMany({
      where: { published: true },
      include: { entries: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
    const allLegendIds = [...new Set(tierLists.flatMap((tl) => tl.entries.map((e) => e.legendId)))];
    const allDeckIds = [
      ...new Set(tierLists.flatMap((tl) => tl.entries.map((e) => e.deckId)).filter((id): id is string => id != null)),
    ];
    const [legendCards, linkedDecks] = await Promise.all([
      prisma.card.findMany({ where: { riftboundId: { in: allLegendIds } } }),
      allDeckIds.length > 0
        ? prisma.deck.findMany({ where: { id: { in: allDeckIds } }, select: { id: true, slug: true } })
        : Promise.resolve([] as { id: string; slug: string }[]),
    ]);
    return { tierLists, legendCards, linkedDecks };
  },
  ["tier-list-data-v1"],
  { revalidate: 300, tags: ["tier-list"] },
);

export const metadata: Metadata = {
  title: { absolute: "Tier List Riftbound FR - Meilleures Légendes (Set Unleashed, Juin 2026)" },
  description:
    "Tier list Riftbound française mise à jour pour le Set Unleashed. Classement S/A/B/C/D de toutes les Légendes, avec decklists recommandées et analyses.",
  alternates: { canonical: "/tier-list" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Tier List Riftbound FR - Meilleures Légendes (Set Unleashed, Juin 2026)",
    description:
      "Classement S/A/B/C/D de toutes les Légendes Riftbound (Set Unleashed) avec decklists recommandées.",
    images: ["/img/og-default.png"],
  },
};

export default async function TierListPage() {
  let tierLists: Awaited<ReturnType<typeof getTierListData>>["tierLists"] = [];
  let legendCards: Awaited<ReturnType<typeof getTierListData>>["legendCards"] = [];
  let linkedDecks: Awaited<ReturnType<typeof getTierListData>>["linkedDecks"] = [];
  try {
    ({ tierLists, legendCards, linkedDecks } = await getTierListData());
  } catch { /* DB indispo → page vide gracieuse */ }

  if (tierLists.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Tier List Riftbound - Les meilleures Légendes du méta
        </h1>
        <p className="mt-4 text-ink-secondary">
          Aucune tier list publiée pour le moment.
        </p>
      </div>
    );
  }

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
      <Breadcrumbs items={[{ name: "Tier List", href: "/tier-list" }]} className="mb-6" />
      <div className="text-center">
        <h1
          className="text-4xl font-bold"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Tier List Riftbound - Les meilleures Légendes du méta
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
