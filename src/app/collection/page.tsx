export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ImportPiltover } from "@/components/collection/import-piltover";
import { CollectionBoard, type SetInfo } from "@/components/collection/collection-board";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Ma collection Riftbound — suivi des cartes possédées" },
  description:
    "Suis ta collection de cartes Riftbound, ta progression par set et le nombre de cartes qu'il te manque pour chaque deck. Import depuis Piltover Archive.",
  alternates: { canonical: "/collection" },
  robots: { index: false, follow: false },
};

// Ordre d'affichage des sets (principaux d'abord, promos ensuite).
const SET_ORDER = ["OGN", "OGS", "SFD", "UNL", "PR", "OPP", "JDG"];

export default async function CollectionPage() {
  const [dbSets, cards] = await Promise.all([
    prisma.cardSet.findMany(),
    prisma.card.findMany({ select: { id: true, set: true } }),
  ]);

  const idsBySet = new Map<string, string[]>();
  for (const c of cards) {
    const arr = idsBySet.get(c.set) ?? [];
    arr.push(c.id);
    idsBySet.set(c.set, arr);
  }

  const sets: SetInfo[] = dbSets
    .map((s) => {
      const cardIds = idsBySet.get(s.setId) ?? [];
      return {
        set: s.setId,
        name: s.name,
        cardCount: s.cardCount ?? cardIds.length,
        cardIds,
      };
    })
    .filter((s) => s.cardIds.length > 0)
    .sort((a, b) => {
      const ia = SET_ORDER.indexOf(a.set);
      const ib = SET_ORDER.indexOf(b.set);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Ma collection</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Suis les cartes que tu possèdes. Sur chaque decklist et dans le deckbuilder, tu verras
        combien de cartes il te manque pour réaliser le deck.
      </p>
      <div className="mb-8">
        <ImportPiltover />
      </div>
      <CollectionBoard sets={sets} />
    </main>
  );
}
