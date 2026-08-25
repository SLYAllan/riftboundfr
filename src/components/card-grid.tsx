import Link from "@/components/lien";
import Image from "next/image";
import { CardImage } from "@/components/card-image";
import { RarityBadge } from "@/components/rarity-badge";
import type { Card } from "@prisma/client";
import { tr } from "@/lib/i18n-server";

// Seuls ces champs scalaires sont rendus → permet un select Prisma léger côté /cartes
// (évite de transférer textPlain/textHtml volumineux). Un Card complet reste assignable.
type CardGridCard = Pick<Card, "id" | "imageUrl" | "name" | "rarity" | "riftboundId" | "setName" | "type">;

interface CardGridProps {
  cards: CardGridCard[];
}

export async function CardGrid({ cards }: CardGridProps) {
  const t = await tr();
  if (cards.length === 0) {
    return (
      <div className="py-20 text-center text-ink-muted">
        {t("Aucune carte ne correspond à votre recherche. Modifiez vos filtres.")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {cards.map((card) => {
        const isBattlefield = card.type === "Battlefield";
        return (
          <Link
            key={card.id}
            href={`/cartes/${card.riftboundId}`}
            className="group relative block"
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
                    <span className="text-xs">{t("Pas d’image")}</span>
                  </div>
                )}
              </div>
            ) : (
              <CardImage src={card.imageUrl} alt={card.name} size="md" />
            )}
            <div className="mt-2">
              <div
                className="line-clamp-2 min-h-10 text-sm font-medium group-hover:text-arcane"
                title={card.name}
              >
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
