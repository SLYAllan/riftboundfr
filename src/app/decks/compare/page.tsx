export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { decodeDeck } from "@/lib/deck-codec";
import { DeckCompare } from "./deck-compare";
import type { DecklistCard, DeckSection } from "@/types";
import { resolveDeckCards, deckIdentifiers } from "@/lib/deck-cards";
import { findCard } from "@/lib/card-printing";
import { metaTraduite, tr } from "@/lib/i18n-server";

const metadata: Metadata = {
  title: "Comparaison de decks",
  description: "Comparez deux decks Riftbound côte à côte : cartes communes, exclusives, statistiques.",
};

async function resolveCode(code: string): Promise<{ legend: string; cards: DecklistCard[]; manquantes: string[] } | null> {
  const decoded = decodeDeck(code);
  if (!decoded) return null;

  // Une carte absente de la base ne rend pas le code faux. Le rejeter en bloc
  // affichait « Code invalide » sur une liste parfaitement lisible : on montre le
  // deck et on nomme ce qui manque.
  const { map: cardMap, missing } = await resolveDeckCards(deckIdentifiers(decoded));

  const deckCards: DecklistCard[] = [];
  let legendName = "";

  function resolve(id: string) {
    // findCard et pas cardMap.get : c'est lui qui gère apostrophes, virgules et
    // suffixes de variante. Un accès direct raterait « KaiSa Survivor ».
    return findCard(cardMap, id);
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

  return { legend: legendName, cards: deckCards, manquantes: missing };
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const t = await tr();
  const { a, b } = await searchParams;

  const deckA = a ? await resolveCode(a) : null;
  const deckB = b ? await resolveCode(b) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        {t("Comparaison de decks")}
      </h1>
      <DeckCompare
        initialA={deckA ? { code: a!, legend: deckA.legend, cards: deckA.cards } : null}
        initialB={deckB ? { code: b!, legend: deckB.legend, cards: deckB.cards } : null}
        invalidA={Boolean(a && !deckA)}
        invalidB={Boolean(b && !deckB)}
        manquantesA={deckA?.manquantes ?? []}
        manquantesB={deckB?.manquantes ?? []}
        codeAInitial={a ?? ""}
        codeBInitial={b ?? ""}
      />
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
