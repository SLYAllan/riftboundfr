export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { getBinders, getCollectionItems, getWishlistIds } from "@/lib/collection-server";
import { CollectionDashboard, type DashCard, type DashSet } from "@/components/collection/collection-dashboard";
import { MAX_BINDERS } from "@/app/api/collection/binders/route";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Ma collection Riftbound - classeurs, progression et valeur" },
  description:
    "Gère ta collection de cartes Riftbound en classeurs, suis ta progression par set, type et rareté, et repère tes cartes manquantes.",
  alternates: { canonical: "/collection" },
  robots: { index: false, follow: false },
};

const SET_ORDER = ["OGN", "OGS", "SFD", "UNL", "PR", "OPP", "JDG"];

export default async function CollectionPage() {
  const user = await getUserFromSession();

  if (!user) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold">Ma collection</h1>
        <div className="mt-6 rounded-xl border border-hairline bg-surface-raised/40 p-8 text-center">
          <p className="mb-4 text-ink-secondary">
            Connecte-toi avec Discord pour gérer ta collection en classeurs et suivre ta progression.
          </p>
          <Link
            href="/api/auth/discord"
            className="inline-block rounded-lg bg-arcane px-5 py-2.5 font-semibold text-white hover:bg-arcane/90"
          >
            Se connecter avec Discord
          </Link>
        </div>
      </main>
    );
  }

  const [dbSets, dbCards, binders, items, wishlist] = await Promise.all([
    prisma.cardSet.findMany(),
    prisma.card.findMany({
      select: { id: true, set: true, setName: true, type: true, rarity: true, domains: true },
    }),
    getBinders(user.id),
    getCollectionItems(user.id),
    getWishlistIds(user.id),
  ]);

  const cards: DashCard[] = dbCards.map((c) => ({
    id: c.id, set: c.set, setName: c.setName, type: c.type, rarity: c.rarity, domains: c.domains,
  }));

  const presentSets = new Set(cards.map((c) => c.set));
  const sets: DashSet[] = dbSets
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
      <CollectionDashboard
        cards={cards}
        sets={sets}
        binders={binders}
        items={items}
        wishlistCount={wishlist.length}
        maxBinders={MAX_BINDERS}
      />
    </main>
  );
}
