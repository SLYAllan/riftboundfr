// force-dynamic: needs the card list from the DB. With `revalidate` it was
// statically built at Docker build (no DB) -> empty card list -> deckbuilder unusable.
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { prisma, safeQuery } from "@/lib/prisma";
import { DeckbuilderV2 } from "./deckbuilder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Deckbuilder Riftbound — Créez et partagez votre deck" },
  description:
    "Construisez votre deck Riftbound avec notre deckbuilder interactif. Filtres, recherche de cartes et export.",
  alternates: { canonical: "/deckbuilder" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Deckbuilder Riftbound — Créez et partagez votre deck",
    description:
      "Deckbuilder Riftbound interactif : filtres, recherche de cartes et export de votre deck.",
    images: ["/img/og-default.png"],
  },
};

async function getCards() {
  const cards = await prisma.card.findMany({
    where: {
      NOT: [
        { name: { contains: "(Metal)" } },
        { name: { contains: "(Starter)" } },
        { name: { contains: "(Launch Exclusive)" } },
        { name: { contains: "(GG EZ)" } },
        { name: { contains: "(Ultimate)" } },
      ],
      OR: [
        { type: "Legend", set: { notIn: ["OPP"] }, alternateArt: false },
        { type: { not: "Legend" } },
      ],
    },
    select: {
      riftboundId: true,
      name: true,
      type: true,
      supertype: true,
      rarity: true,
      domains: true,
      energy: true,
      might: true,
      power: true,
      imageUrl: true,
      set: true,
      setName: true,
      textPlain: true,
      tags: true,
      signature: true,
    },
    orderBy: [{ set: "asc" }, { collectorNumber: "asc" }],
  });

  const nonTokens = cards.filter((c) => c.supertype !== "Token");

  const seen = new Set<string>();
  const deduped = nonTokens.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });

  const canonicalIdByName = new Map(deduped.map((c) => [c.name, c.riftboundId]));
  const idAliases: Record<string, string> = {};
  for (const c of nonTokens) {
    const canonical = canonicalIdByName.get(c.name);
    if (canonical && c.riftboundId !== canonical) {
      idAliases[c.riftboundId] = canonical;
    }
  }

  return {
    cards: deduped.map((c) => ({
      id: c.riftboundId,
      name: c.name,
      type: c.type,
      supertype: c.supertype,
      rarity: c.rarity,
      domains: c.domains,
      energy: c.energy,
      might: c.might,
      power: c.power,
      imageUrl: c.imageUrl,
      set: c.set,
      setName: c.setName,
      textPlain: c.textPlain,
      tags: c.tags,
      signature: c.signature,
    })),
    idAliases,
  };
}

export default async function DeckbuilderPage() {
  const { cards, idAliases } = await safeQuery(() => getCards(), { cards: [], idAliases: {} as Record<string, string> });

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100dvh-57px)] text-ink-muted">Chargement...</div>}>
      <DeckbuilderV2 initialCards={cards} idAliases={idAliases} />
    </Suspense>
  );
}
