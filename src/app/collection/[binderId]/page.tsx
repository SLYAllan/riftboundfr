export const dynamic = "force-dynamic";

import Link from "@/components/lien";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { getBinderQuantities } from "@/lib/collection-server";
import { BinderExplorer, type BinderCard, type BinderSetMeta } from "@/components/collection/binder-explorer";
import { metaTraduite, tr } from "@/lib/i18n-server";
import { impressionsAchat } from "@/lib/cardnexus";
import { ORDRE_SETS } from "@/lib/collection";

const metadata: Metadata = {
  title: { absolute: "Classeur - Ma collection Riftbound" },
  robots: { index: false, follow: false },
};


export default async function BinderPage({ params }: { params: Promise<{ binderId: string }> }) {
  const t = await tr();
  const { binderId } = await params;
  const user = await getUserFromSession();
  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link href="/api/auth/discord" className="text-arcane hover:underline">{t("Se connecter avec Discord")}</Link>
      </div>
    );
  }

  const binder = await prisma.binder.findFirst({ where: { id: binderId, userId: user.id } });
  if (!binder) notFound();

  const [dbSets, dbCards, quantities] = await Promise.all([
    prisma.cardSet.findMany(),
    prisma.card.findMany({
      select: {
        id: true, riftboundId: true, name: true, imageUrl: true, set: true, setName: true,
        type: true, supertype: true, rarity: true, domains: true, energy: true, might: true,
        power: true, collectorNumber: true, alternateArt: true, overnumbered: true, signature: true,
      },
      orderBy: [{ set: "asc" }, { collectorNumber: "asc" }],
    }),
    getBinderQuantities(binderId),
  ]);

  const cards: BinderCard[] = dbCards;
  const impressions = impressionsAchat();
  const presentSets = new Set(cards.map((c) => c.set));
  const sets: BinderSetMeta[] = dbSets
    .filter((s) => presentSets.has(s.setId))
    .map((s) => ({ setId: s.setId, name: s.name }))
    .sort((a, b) => {
      const ia = ORDRE_SETS.indexOf(a.setId), ib = ORDRE_SETS.indexOf(b.setId);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/collection" className="inline-flex min-h-11 items-center text-sm text-ink-muted hover:text-ink sm:min-h-0">{t("← Retour à la collection")}</Link>
      <BinderExplorer
        binder={{ id: binder.id, name: binder.name, isPublic: binder.isPublic, shareSlug: binder.shareSlug }}
        cards={cards}
        sets={sets}
        initialQuantities={quantities}
        impressions={impressions}
      />
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
