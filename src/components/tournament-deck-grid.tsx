"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cn, displayLegendName } from "@/lib/utils";
import { Trophy, Eye, ChevronDown, Swords } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Medal styling                                                      */
/* ------------------------------------------------------------------ */

const MEDAL_TEXT: Record<number, string> = {
  1: "text-gold",
  2: "text-gray-300",
  3: "text-amber-600",
};

const MEDAL_BG: Record<number, string> = {
  1: "border-gold/40 shadow-[inset_0_1px_0_rgba(245,158,11,0.15)]",
  2: "border-gray-400/30 shadow-[inset_0_1px_0_rgba(156,163,175,0.12)]",
  3: "border-amber-600/30 shadow-[inset_0_1px_0_rgba(217,119,6,0.12)]",
};

const MEDAL_BADGE: Record<number, string> = {
  1: "bg-gold text-canvas",
  2: "bg-gray-300 text-gray-900",
  3: "bg-amber-600 text-white",
};

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DeckEntry {
  slug: string;
  legendName: string;
  playerName: string | null;
  placement: string | null;
  placementNum: number;
  record: string | null;
  tournamentTier: string | null;
  legendIcon: string | null;
  bannerUrl: string | null;
}

interface Props {
  decks: DeckEntry[];
  legends: string[];
  legendCounts: Record<string, number>;
  tournamentSlug: string;
  currentLegend: string | null;
  filteredCount: number;
  totalCount: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_VISIBLE = 60;
const LOAD_MORE_STEP = 60;

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function TournamentDeckGrid({
  decks,
  legends,
  legendCounts,
  tournamentSlug,
  currentLegend,
  filteredCount,
  totalCount,
}: Props) {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  /* ---- derived data ---- */
  const top8 = useMemo(() => decks.filter((d) => d.placementNum <= 8), [decks]);
  const rest = useMemo(() => decks.filter((d) => d.placementNum > 8), [decks]);

  /* Visible rest decks */
  const visibleRest = rest.slice(0, visibleCount);
  const hasMore = rest.length > visibleCount;

  /* ---- handlers ---- */
  function handleLegendChange(value: string) {
    setVisibleCount(INITIAL_VISIBLE);
    if (value) {
      router.push(`/tournois/${tournamentSlug}?legend=${encodeURIComponent(value)}`);
    } else {
      router.push(`/tournois/${tournamentSlug}`);
    }
  }

  function handleLoadMore() {
    setVisibleCount((prev) => prev + LOAD_MORE_STEP);
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Toolbar : compteur à gauche, filtre à droite */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card bg-surface/60 border border-hairline px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-ink-secondary">
          <Swords size={14} className="text-arcane" />
          <span>
            <span className="font-semibold text-ink">
              {filteredCount === totalCount
                ? totalCount.toLocaleString("fr-FR")
                : `${filteredCount.toLocaleString("fr-FR")} / ${totalCount.toLocaleString("fr-FR")}`}
            </span>{" "}
            decklists
          </span>
        </div>

        <select
          aria-label="Filtrer par légende"
          value={currentLegend ?? ""}
          onChange={(e) => handleLegendChange(e.target.value)}
          className="ml-auto w-full sm:w-auto sm:min-w-[240px] appearance-none rounded-lg bg-surface border border-hairline text-ink text-sm font-medium px-3.5 py-2 pr-9 transition-colors hover:bg-surface-raised hover:border-hairline-strong focus:outline-none focus:border-arcane/40 focus:ring-1 focus:ring-arcane/20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.625rem center",
          }}
        >
          <option value="">Toutes les légendes ({totalCount})</option>
          {legends.map((name) => {
            const short = displayLegendName(name);
            const count = legendCounts[name] ?? 0;
            return (
              <option key={name} value={name}>
                {short} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {/* Top 8 section */}
      {top8.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-gold" />
            <h2
              className="text-sm font-bold uppercase tracking-widest text-ink-secondary"
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              Top 8
            </h2>
          </div>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {top8.map((d) => (
              <TopDeckCard key={d.slug} deck={d} />
            ))}
          </div>
        </section>
      )}

      {/* Rest of decks - grid */}
      {visibleRest.length > 0 && (
        <section>
          <h2
            className="text-sm font-bold uppercase tracking-widest text-ink-muted mb-4"
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          >
            Toutes les decklists ({rest.length})
          </h2>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleRest.map((d) => (
              <DeckMiniCard key={d.slug} deck={d} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 rounded-full bg-surface border border-hairline px-6 py-2.5 text-sm font-semibold text-ink-secondary hover:bg-surface-raised hover:text-ink transition-colors"
              >
                <ChevronDown size={16} />
                Charger plus
                <span className="text-xs text-ink-muted">
                  ({Math.min(rest.length - visibleCount, LOAD_MORE_STEP)} restants sur {rest.length - visibleCount})
                </span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Empty state */}
      {decks.length === 0 && (
        <div className="mt-12 text-center text-ink-muted py-16">
          <Swords size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">Aucune decklist trouvée pour ce filtre.</p>
          <button
            onClick={() => handleLegendChange("")}
            className="mt-3 text-sm text-arcane hover:text-arcane-light transition-colors"
          >
            Afficher toutes les decklists
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Top 8 Card                                                         */
/* ------------------------------------------------------------------ */

function TopDeckCard({ deck }: { deck: DeckEntry }) {
  const medalBg = MEDAL_BG[deck.placementNum];
  const medalBadge = MEDAL_BADGE[deck.placementNum];

  return (
    <Link
      href={`/decks/${deck.slug}`}
      className={cn(
        "group relative rounded-card border overflow-hidden transition-all duration-200",
        "hover:border-hairline-strong hover:shadow-lg hover:shadow-black/20",
        medalBg ?? "border-hairline",
      )}
    >
      {/* Banner image - tall */}
      <div className="relative h-36 sm:h-40">
        {deck.bannerUrl ? (
          <Image
            src={deck.bannerUrl}
            alt={deck.legendName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            quality={75}
          />
        ) : (
          <div className="absolute inset-0 bg-surface-raised" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-transparent" />

        {/* Placement badge - top left */}
        {deck.placement && (
          <div
            className={cn(
              "absolute top-2.5 left-2.5 z-10 flex items-center justify-center",
              "h-8 w-8 rounded-lg text-sm font-black",
              medalBadge ?? "bg-surface-raised text-ink-secondary",
            )}
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          >
            {deck.placementNum}
          </div>
        )}

        {/* Eye icon on hover */}
        <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-arcane/20 backdrop-blur-sm">
            <Eye size={14} className="text-arcane" />
          </div>
        </div>

        {/* Content overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-3">
          <div className="flex items-center gap-2 mb-1">
            {deck.legendIcon && (
              <img
                src={deck.legendIcon}
                alt=""
                className="h-6 w-6 rounded-lg ring-1 ring-white/10"
              />
            )}
            <span className="text-xs text-ink-secondary truncate">
              {displayLegendName(deck.legendName)}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-sm font-bold truncate text-ink drop-shadow-md",
              )}
            >
              {deck.playerName ?? "Inconnu"}
            </span>
            {deck.record && (
              <span className="text-[10px] text-ink-muted font-mono shrink-0 bg-canvas/40 px-1.5 py-0.5 rounded">
                {deck.record}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Deck Mini Card (for the grid)                                      */
/* ------------------------------------------------------------------ */

function DeckMiniCard({ deck }: { deck: DeckEntry }) {
  const hasMedal = deck.placementNum <= 8;
  const medalText = MEDAL_TEXT[deck.placementNum];

  return (
    <Link
      href={`/decks/${deck.slug}`}
      className={cn(
        "group flex items-center gap-3 rounded-card border border-hairline p-3",
        "bg-surface/40 transition-all duration-150",
        "hover:bg-surface-raised/60 hover:border-hairline-strong",
      )}
    >
      {/* Placement : colonne fixe en tête, la grille se lit par classement */}
      <span
        className={cn(
          "w-9 shrink-0 text-center text-xs font-bold tabular-nums",
          hasMedal ? medalText : "text-ink-muted",
        )}
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        {deck.placement ?? "-"}
      </span>

      {/* Legend icon */}
      {deck.legendIcon ? (
        <img
          src={deck.legendIcon}
          alt={deck.legendName}
          className="h-11 w-11 rounded-lg object-cover shrink-0 ring-1 ring-hairline"
        />
      ) : (
        <div className="h-11 w-11 rounded-lg bg-surface-raised shrink-0" />
      )}

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold truncate text-ink group-hover:text-arcane-light transition-colors">
            {deck.playerName ?? "Inconnu"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-ink-secondary truncate">
            {displayLegendName(deck.legendName)}
          </span>
          {deck.record && (
            <span className="text-[10px] text-ink-muted font-mono shrink-0">
              {deck.record}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
