export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { decodeDeck } from "@/lib/deck-codec";
import { DeckCompare } from "./deck-compare";
import type { DecklistCard, DeckSection } from "@/types";
import { buildCardLookup } from "@/lib/card-printing";

export const metadata: Metadata = {
  title: "Comparaison de decks",
  description: "Comparez deux decks Riftbound côte à côte : cartes communes, exclusives, statistiques.",
};

async function resolveCode(code: string): Promise<{ legend: string; cards: DecklistCard[] } | null> {
  const decoded = decodeDeck(code);
  if (!decoded) return null;

  const allIds: string[] = [];
  if (decoded.legend) allIds.push(decoded.legend.cardId);
  if (decoded.champion) allIds.push(decoded.champion.cardId);
  for (const e of [...decoded.main, ...decoded.rune, ...decoded.battlefield, ...decoded.side]) allIds.push(e.cardId);

  const isNameFormat = allIds.some((id) => id.includes(" ") || id.includes(","));
  const cards = await prisma.card.findMany({
    where: isNameFormat
      ? { name: { in: allIds, mode: "insensitive" }, alternateArt: false }
      : { riftboundId: { in: allIds } },
  });
  const cardMap = buildCardLookup(cards);

  const deckCards: DecklistCard[] = [];
  let legendName = "";

  function resolve(id: string) {
    return cardMap.get(id) ?? cardMap.get(id.toLowerCase());
  }

  if (decoded.legend) {
    const c = resolve(decoded.legend.cardId);
    if (c) {
      deckCards.push({ cardId: c.riftboundId, name: c.name, artUrl: c.imageUrl, type: c.type, energy: c.energy, power: c.power, might: c.might, rarity: c.rarity, domains: c.domains, description: c.textPlain, quantity: 1, section: "legend" });
      if (c.type === "Legend") legendName = c.name;
    }
  }
  if (decoded.champion) {
    const c = resolve(decoded.champion.cardId);
    if (c) deckCards.push({ cardId: c.riftboundId, name: c.name, artUrl: c.imageUrl, type: c.type, energy: c.energy, power: c.power, might: c.might, rarity: c.rarity, domains: c.domains, description: c.textPlain, quantity: 1, section: "legend" });
  }

  const sectionMap: [typeof decoded.main, DeckSection][] = [
    [decoded.main, "main"],
    [decoded.rune, "rune"],
    [decoded.battlefield, "battlefield"],
    [decoded.side, "side"],
  ];
  for (const [entries, section] of sectionMap) {
    for (const e of entries) {
      const c = resolve(e.cardId);
      if (c) deckCards.push({ cardId: c.riftboundId, name: c.name, artUrl: c.imageUrl, type: c.type, energy: c.energy, power: c.power, might: c.might, rarity: c.rarity, domains: c.domains, description: c.textPlain, quantity: e.quantity, section });
    }
  }

  return { legend: legendName, cards: deckCards };
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const { a, b } = await searchParams;

  const deckA = a ? await resolveCode(a) : null;
  const deckB = b ? await resolveCode(b) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        Comparaison de decks
      </h1>
      <DeckCompare
        initialA={deckA ? { code: a!, legend: deckA.legend, cards: deckA.cards } : null}
        initialB={deckB ? { code: b!, legend: deckB.legend, cards: deckB.cards } : null}
      />
    </div>
  );
}
