import Link from "next/link";
import Image from "next/image";
import { CardImage } from "@/components/card-image";
import { RarityBadge } from "@/components/rarity-badge";
import type { Card } from "@prisma/client";

interface CardGridProps {
  cards: Card[];
}

export function CardGrid({ cards }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="py-20 text-center text-ink-muted">
        Aucune carte trouvee.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
      {cards.map((card) => {
        const isBattlefield = card.type === "Battlefield";
        return (
          <Link
            key={card.id}
            href={`/cartes/${card.riftboundId}`}
            className="group relative"
          >
            {isBattlefield ? (
              <div className="relative aspect-[5/7] overflow-hidden rounded-game-card bg-surface-raised">
                {card.imageUrl ? (
                  <div className="flex h-full items-center justify-center p-1">
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      width={200}
                      height={140}
                      className="rounded-game-card w-full h-auto game-card-hover"
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-muted">
                    <span className="text-xs">No image</span>
                  </div>
                )}
              </div>
            ) : (
              <CardImage src={card.imageUrl} alt={card.name} size="md" />
            )}
            <div className="mt-2">
              <div className="truncate text-sm font-medium group-hover:text-arcane">
                {card.name}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <RarityBadge rarity={card.rarity} />
                <span className="text-xs text-ink-muted">{card.setName}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
