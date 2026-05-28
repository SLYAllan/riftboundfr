import { CardImage } from "@/components/card-image";
import Link from "next/link";
import type { Card, DeckCard } from "@prisma/client";

type DeckCardWithCard = DeckCard & { card: Card };

interface DeckViewerProps {
  cards: DeckCardWithCard[];
}

const sectionLabels: Record<string, string> = {
  legend: "Légende",
  main: "Deck Principal",
  rune: "Runes",
  battlefield: "Champs de bataille",
  side: "Réserve",
};

const sectionOrder = ["legend", "main", "rune", "battlefield", "side"];

export function DeckViewer({ cards }: DeckViewerProps) {
  const grouped = cards.reduce(
    (acc, dc) => {
      const s = dc.section || "main";
      if (!acc[s]) acc[s] = [];
      acc[s].push(dc);
      return acc;
    },
    {} as Record<string, DeckCardWithCard[]>
  );

  return (
    <div className="space-y-8">
      {sectionOrder.map((section) => {
        const sectionCards = grouped[section];
        if (!sectionCards || sectionCards.length === 0) return null;
        const total = sectionCards.reduce((sum, dc) => sum + dc.quantity, 0);

        return (
          <div key={section}>
            <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              {sectionLabels[section] || section}{" "}
              <span className="text-ink-muted">({total} carte{total !== 1 ? "s" : ""})</span>
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {sectionCards.map((dc) => {
                const isBf = dc.card.type === "Battlefield";
                return (
                <Link
                  key={dc.id}
                  href={`/cartes/${dc.card.riftboundId}`}
                  className="group relative"
                >
                  {isBf ? (
                    <img src={dc.card.imageUrl ?? ""} alt={dc.card.name} className="w-full aspect-[5/7] rounded-game-card object-contain bg-surface-raised" />
                  ) : (
                    <CardImage src={dc.card.imageUrl} alt={dc.card.name} size="sm" />
                  )}
                  {dc.quantity > 1 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-arcane text-xs font-bold text-white">
                      {dc.quantity}
                    </span>
                  )}
                  <div className="mt-1 truncate text-xs text-ink-secondary group-hover:text-arcane">
                    {dc.card.name}
                  </div>
                </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
