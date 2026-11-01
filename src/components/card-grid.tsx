import Link from "@/components/lien";
import Image from "next/image";
import { CardImage } from "@/components/card-image";
import { RarityBadge } from "@/components/rarity-badge";
import type { Card } from "@prisma/client";
import { tr } from "@/lib/i18n-server";
import { chargerPrix, lienProduit } from "@/lib/cardnexus";

// Seuls ces champs scalaires sont rendus → permet un select Prisma léger côté /cartes
// (évite de transférer textPlain/textHtml volumineux). Un Card complet reste assignable.
type CardGridCard = Pick<Card, "id" | "imageUrl" | "name" | "rarity" | "riftboundId" | "setName" | "type">;

interface CardGridProps {
  cards: CardGridCard[];
}

export async function CardGrid({ cards }: CardGridProps) {
  const t = await tr();
  const prix = chargerPrix();
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
        const achat = prix?.cards[card.riftboundId];
        return (
          <div key={card.id}>
            <Link href={`/cartes/${card.riftboundId}`} className="group relative block">
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
                <div className="mt-1 flex min-w-0 items-center gap-2">
                  <RarityBadge rarity={card.rarity} className="shrink-0" />
                  <span className="min-w-0 truncate text-xs text-ink-muted" title={card.setName}>{card.setName}</span>
                </div>
              </div>
            </Link>
            {/* Hors du lien de la tuile : un lien dans un lien n'est pas du HTML valide.
                Sans prix : Allan ne veut pas de nouvelle fonction bâtie dessus. */}
            {achat && (
              <a
                href={lienProduit(achat.productId, achat.nom)}
                target="_blank"
                rel="sponsored nofollow noopener"
                aria-label={`${t("Acheter")} ${card.name}`}
                className="mt-1 inline-flex min-h-6 items-center text-xs font-medium text-arcane hover:underline"
              >
                {t("Acheter")}
              </a>
            )}
          </div>
        );
      })}
      {cards.some((c) => prix?.cards[c.riftboundId]) && (
        <p className="col-span-full text-xs text-ink-muted">
          {t("Les liens « Acheter » mènent à CardNexus. Un achat passé par ces liens nous verse une commission, sans changer ton prix.")}
        </p>
      )}
    </div>
  );
}
