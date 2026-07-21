"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn, displayLegendName } from "@/lib/utils";

interface TierListData {
  id: string;
  title: string;
  setContext: string | null;
  current: boolean;
  entries: {
    id: string;
    legendId: string;
    legendName: string;
    tier: string;
    comment: string | null;
  }[];
}

interface CardData {
  imageUrl: string | null;
  domains: string[];
}

const SET_SHORT: Record<string, string> = {
  Origins: "OGN",
  Spiritforged: "SFD",
  Unleashed: "UNL",
  Global: "ALL",
};

const TIER_COLORS: Record<string, string> = {
  S: "bg-red-500",
  A: "bg-orange-400",
  B: "bg-yellow-400",
  C: "bg-teal-500",
  D: "bg-gray-500",
};

const TIER_TEXT: Record<string, string> = {
  S: "text-white",
  A: "text-white",
  B: "text-gray-900",
  C: "text-white",
  D: "text-white",
};

const tierOrder = ["S", "A", "B", "C", "D"];

export function HomeTierList({
  tierLists,
  legendMap,
}: {
  tierLists: TierListData[];
  legendMap: Map<string, CardData>;
}) {
  const currentIdx = tierLists.findIndex((tl) => tl.current);
  const [activeIdx, setActiveIdx] = useState(
    currentIdx >= 0 ? currentIdx : 0,
  );
  const active = tierLists[activeIdx];

  if (!tierLists.length) {
    return (
      <div className="rounded-card border border-hairline bg-surface overflow-hidden">
        <div className="px-4 py-12 text-center text-sm text-ink-muted">
          Tier list à venir
        </div>
      </div>
    );
  }

  const grouped = active
    ? active.entries.reduce(
        (acc, entry) => {
          if (!acc[entry.tier]) acc[entry.tier] = [];
          acc[entry.tier].push(entry);
          return acc;
        },
        {} as Record<string, typeof active.entries>,
      )
    : {};

  // Hauteur FIXE, jamais dérivée du contenu. Chaque onglet a un nombre de Légendes
  // différent : si la carte se dimensionnait sur son contenu, elle grandirait au clic
  // et, étant dans une grille, elle pousserait toute la ligne avec elle. self-start
  // l'empêche de s'étirer si une colonne voisine est plus haute.
  return (
    <div className="flex flex-col self-start rounded-card border border-hairline bg-surface overflow-hidden">
      <div className="shrink-0 border-b border-hairline px-4 py-3 flex items-center justify-between">
        {/* Titre volontairement différent de « Tier List » : l'accueil captait les
            requêtes à la place de /tier-list, qui porte le vrai classement commenté. */}
        <h2
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Aperçu du méta
        </h2>
        <Link
          href="/tier-list"
          className="flex items-center gap-1 text-xs text-arcane hover:text-arcane-light"
        >
          Tier list complète <ArrowRight size={14} />
        </Link>
      </div>

      {tierLists.length > 1 && (
        <div className="flex shrink-0 border-b border-hairline">
          {tierLists.map((tl, i) => (
            <button
              key={tl.id}
              onClick={() => setActiveIdx(i)}
              className={cn(
                "flex-1 py-2 text-xs font-semibold transition-colors",
                activeIdx === i
                  ? "text-arcane border-b-2 border-arcane bg-arcane/5"
                  : "text-ink-muted hover:text-ink hover:bg-surface-raised/50",
              )}
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              {SET_SHORT[tl.setContext ?? ""] ?? tl.setContext ?? tl.title}
            </button>
          ))}
        </div>
      )}

      {active && active.entries.length > 0 ? (
        <div className="h-[420px] overflow-y-auto">
          {tierOrder.map((tier, tierIdx) => {
            const entries = grouped[tier];
            if (!entries || entries.length === 0) return null;
            const isFirst = tierOrder.slice(0, tierIdx).every((t) => !grouped[t]?.length);
            const isLast = tierIdx === tierOrder.length - 1 || tierOrder.slice(tierIdx + 1).every((t) => !grouped[t]?.length);
            return (
              <div
                key={tier}
                className="flex border-b border-hairline/50 last:border-b-0"
              >
                <div
                  className={cn(
                    "flex w-14 shrink-0 items-center justify-center",
                    TIER_COLORS[tier],
                    TIER_TEXT[tier],
                    isFirst && "rounded-tl-sm",
                    isLast && "rounded-bl-sm",
                  )}
                >
                  <span
                    className="text-2xl font-black"
                    style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                  >
                    {tier}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 p-2 flex-1 min-h-[52px]">
                  {entries.map((entry) => {
                    const card = legendMap.get(entry.legendId);
                    return card?.imageUrl ? (
                      <Image
                        key={entry.id}
                        src={card.imageUrl}
                        alt={entry.legendName}
                        title={entry.legendName}
                        width={48}
                        height={48}
                        suppressHydrationWarning
                        className="h-12 w-12 rounded-lg object-cover hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div
                        key={entry.id}
                        className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-raised text-[8px] text-ink-muted"
                        title={entry.legendName}
                      >
                        {displayLegendName(entry.legendName).split(",")[0].slice(0, 4)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 px-4 py-12 text-center text-sm text-ink-muted">
          Tier list à venir
        </div>
      )}

      {/* Reste collé en bas de la carte, hors de la zone qui défile. */}
      <Link
        href="/tier-list"
        className="flex shrink-0 items-center justify-center gap-1 border-t border-hairline px-4 py-3 text-sm font-semibold text-arcane hover:bg-surface-raised hover:text-arcane-light"
      >
        Tier list Riftbound complète, avec les decks
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
