"use client";

import { useState } from "react";
import Image from "next/image";
import { cn, formatDate, displayLegendName } from "@/lib/utils";

interface TierListData {
  id: string;
  title: string;
  description: string | null;
  setContext: string | null;
  current: boolean;
  updatedAt: Date;
  entries: {
    id: string;
    legendId: string;
    legendName: string;
    tier: string;
    position: number;
    comment: string | null;
    deckId: string | null;
  }[];
}

interface CardData {
  imageUrl: string | null;
  domains: string[];
}

interface Props {
  tierLists: TierListData[];
  legendMap: Record<string, CardData>;
  deckSlugMap: Record<string, string>;
  defaultTab: string;
}

const SET_LABELS: Record<string, string> = {
  Origins: "Origins",
  Spiritforged: "Spiritforged",
  Unleashed: "Unleashed",
  Global: "Globale",
};

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: "bg-red-500/80", text: "text-white", border: "border-red-500/40" },
  A: { bg: "bg-orange-400/80", text: "text-white", border: "border-orange-400/40" },
  B: { bg: "bg-yellow-400/80", text: "text-gray-900", border: "border-yellow-400/40" },
  C: { bg: "bg-teal-500/80", text: "text-white", border: "border-teal-500/40" },
  D: { bg: "bg-gray-500/80", text: "text-white", border: "border-gray-500/40" },
};

const tierOrder = ["S", "A", "B", "C", "D"];

export function TierListTabs({
  tierLists,
  legendMap,
  deckSlugMap,
  defaultTab,
}: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);
  const activeTierList = tierLists.find((tl) => tl.id === activeTab)!;

  const grouped = activeTierList.entries.reduce(
    (acc, entry) => {
      if (!acc[entry.tier]) acc[entry.tier] = [];
      acc[entry.tier].push(entry);
      return acc;
    },
    {} as Record<string, typeof activeTierList.entries>,
  );

  return (
    <>
      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-lg border border-hairline bg-surface p-1 gap-1">
          {tierLists.map((tl) => (
            <button
              key={tl.id}
              onClick={() => setActiveTab(tl.id)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === tl.id
                  ? "bg-arcane text-white shadow-sm"
                  : "text-ink-secondary hover:text-ink hover:bg-surface-raised",
              )}
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              {SET_LABELS[tl.setContext ?? ""] ?? tl.title}
              {tl.current && (
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              )}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-ink-muted">
        Dernière mise à jour : {formatDate(activeTierList.updatedAt)}
        {activeTierList.setContext && ` - Set ${activeTierList.setContext}`}
      </p>

      <div className="mt-8 rounded-xl border border-hairline overflow-visible">
        {tierOrder.map((tier, tierIdx) => {
          const entries = grouped[tier];
          if (!entries || entries.length === 0) return null;
          const colors = TIER_COLORS[tier];
          const isFirst = tierIdx === 0 || tierOrder.slice(0, tierIdx).every((t) => !grouped[t]?.length);
          const isLast = tierIdx === tierOrder.length - 1 || tierOrder.slice(tierIdx + 1).every((t) => !grouped[t]?.length);
          return (
            <div key={tier} className="flex border-b border-hairline last:border-b-0">
              <div
                className={cn(
                  "flex w-16 shrink-0 items-center justify-center sm:w-20",
                  colors.bg,
                  colors.text,
                  isFirst && "rounded-tl-xl",
                  isLast && "rounded-bl-xl",
                )}
              >
                <span
                  className="text-3xl font-black sm:text-4xl"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  {tier}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1 bg-surface p-2 sm:gap-2 sm:p-3 flex-1 min-h-[80px]">
                {entries.map((entry) => {
                  const card = legendMap[entry.legendId];
                  const isHovered = hoveredEntry === entry.id;
                  return (
                    <div
                      key={entry.id}
                      className="group relative"
                      onMouseEnter={() => setHoveredEntry(entry.id)}
                      onMouseLeave={() => setHoveredEntry(null)}
                    >
                      {card?.imageUrl ? (
                        <Image
                          src={card.imageUrl}
                          alt={entry.legendName}
                          width={80}
                          height={80}
                          suppressHydrationWarning
                          className={cn(
                            "h-16 w-16 rounded-lg object-cover transition-transform sm:h-20 sm:w-20",
                            "hover:scale-105 hover:shadow-lg hover:z-10",
                          )}
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface-raised text-[10px] text-ink-muted sm:h-20 sm:w-20">
                          {displayLegendName(entry.legendName)}
                        </div>
                      )}
                      {isHovered && (
                        <div
                          className={cn(
                            "absolute left-1/2 z-30 -translate-x-1/2 pointer-events-none",
                            isFirst ? "top-full mt-1" : "-top-1 -translate-y-full",
                          )}
                        >
                          {!isFirst && (
                            <div className="rounded-lg border border-hairline bg-canvas px-3 py-2 shadow-xl whitespace-nowrap max-w-[240px]">
                              <p
                                className="text-sm font-semibold text-ink"
                                style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                              >
                                {displayLegendName(entry.legendName)}
                              </p>
                              {entry.comment && (
                                <p className="mt-0.5 text-xs text-ink-secondary whitespace-normal">
                                  {entry.comment}
                                </p>
                              )}
                            </div>
                          )}
                          {!isFirst && (
                            <div className="mx-auto h-2 w-2 rotate-45 border-b border-r border-hairline bg-canvas -mt-1" />
                          )}
                          {isFirst && (
                            <div className="mx-auto h-2 w-2 rotate-45 border-t border-l border-hairline bg-canvas mb-[-5px] relative z-10" />
                          )}
                          {isFirst && (
                            <div className="rounded-lg border border-hairline bg-canvas px-3 py-2 shadow-xl whitespace-nowrap max-w-[240px]">
                              <p
                                className="text-sm font-semibold text-ink"
                                style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                              >
                                {displayLegendName(entry.legendName)}
                              </p>
                              {entry.comment && (
                                <p className="mt-0.5 text-xs text-ink-secondary whitespace-normal">
                                  {entry.comment}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-hairline bg-surface p-6 text-center">
        <p className="text-sm text-ink-muted">
          Cette tier list est basée sur notre analyse des résultats de tournois
          publics. Elle ne reflète pas de données statistiques automatisées.
        </p>
      </div>
    </>
  );
}
