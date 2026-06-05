export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { CollectionExplorer, type CollectionCard, type SetMeta } from "@/components/collection/collection-explorer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Ma collection Riftbound — suivi des cartes possédées" },
  description:
    "Suis ta collection de cartes Riftbound, ta progression par set et le nombre de cartes qu'il te manque pour chaque deck. Import depuis Piltover Archive.",
  alternates: { canonical: "/collection" },
  robots: { index: false, follow: false },
};

const SET_ORDER = ["OGN", "OGS", "SFD", "UNL", "PR", "OPP", "JDG"];

export default async function CollectionPage() {
  const [dbSets, dbCards] = await Promise.all([
    prisma.cardSet.findMany(),
    prisma.card.findMany({
      select: {
        id: true,
        riftboundId: true,
        name: true,
        imageUrl: true,
        set: true,
        setName: true,
        type: true,
        rarity: true,
        domains: true,
        collectorNumber: true,
      },
      orderBy: [{ set: "asc" }, { collectorNumber: "asc" }],
    }),
  ]);

  const cards: CollectionCard[] = dbCards;

  const presentSets = new Set(cards.map((c) => c.set));
  const sets: SetMeta[] = dbSets
    .filter((s) => presentSets.has(s.setId))
    .map((s) => ({
      setId: s.setId,
      name: s.name,
      cardCount: s.cardCount ?? cards.filter((c) => c.set === s.setId).length,
    }))
    .sort((a, b) => {
      const ia = SET_ORDER.indexOf(a.setId);
      const ib = SET_ORDER.indexOf(b.setId);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">Ma collection</h1>
      <p className="mb-6 mt-1 text-sm text-ink-muted">
        Coche les cartes que tu possèdes. Sur chaque decklist et dans le deckbuilder, tu verras
        automatiquement combien de cartes il te manque.
      </p>
      <CollectionExplorer cards={cards} sets={sets} />
    </main>
  );
}
