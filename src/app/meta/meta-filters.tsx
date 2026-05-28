"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface LegendStats {
  legendName: string;
  shortName: string;
  iconUrl: string | null;
  deckCount: number;
  popularity: number;
  tier: string | null;
  tierComment: string | null;
  tournaments: string[];
  formats: string[];
}

const TIER_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: "bg-tier-s/20", text: "text-tier-s", border: "border-tier-s/40" },
  A: { bg: "bg-tier-a/20", text: "text-tier-a", border: "border-tier-a/40" },
  B: { bg: "bg-tier-b/20", text: "text-tier-b", border: "border-tier-b/40" },
  C: { bg: "bg-tier-c/20", text: "text-tier-c", border: "border-tier-c/40" },
  D: { bg: "bg-tier-d/20", text: "text-tier-d", border: "border-tier-d/40" },
};

interface Props {
  legendStats: LegendStats[];
  allTournaments: string[];
  allFormats: string[];
}

export function MetaFilters({
  legendStats,
  allTournaments,
  allFormats,
}: Props) {
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");

  const filtered = useMemo(() => {
    return legendStats.filter((s) => {
      if (
        selectedTournament !== "all" &&
        !s.tournaments.includes(selectedTournament)
      )
        return false;
      if (selectedFormat !== "all" && !s.formats.includes(selectedFormat))
        return false;
      return true;
    });
  }, [legendStats, selectedTournament, selectedFormat]);

  const hasFilters = allTournaments.length > 1 || allFormats.length > 1;

  return (
    <>
      {hasFilters && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {allTournaments.length > 1 && (
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink focus:border-arcane focus:outline-none"
            >
              <option value="all">Tous les tournois</option>
              {allTournaments.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
          {allFormats.length > 1 && (
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink focus:border-arcane focus:outline-none"
            >
              <option value="all">Tous les formats</option>
              {allFormats.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-ink-secondary">
          Aucune légende trouvée avec ces filtres.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((legend, idx) => {
            const tierStyle = legend.tier
              ? TIER_STYLES[legend.tier]
              : null;

            return (
              <div
                key={legend.legendName}
                className={cn(
                  "group relative flex flex-col items-center rounded-xl border border-hairline bg-surface p-4 transition-colors",
                  "hover:border-hairline-strong hover:bg-surface-raised",
                )}
              >
                {/* Rank badge */}
                <div className="absolute -top-2.5 left-3 rounded-md bg-surface-raised px-2 py-0.5 text-xs font-bold text-ink-muted border border-hairline">
                  #{idx + 1}
                </div>

                {/* Legend icon */}
                {legend.iconUrl ? (
                  <img
                    src={legend.iconUrl}
                    alt={legend.shortName}
                    className="h-16 w-16 rounded-lg object-cover sm:h-20 sm:w-20"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-surface-raised text-xs text-ink-muted sm:h-20 sm:w-20">
                    {legend.shortName.split(",")[0]}
                  </div>
                )}

                {/* Legend name */}
                <p
                  className="mt-3 text-center text-sm font-semibold text-ink leading-tight"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  {legend.shortName}
                </p>

                {/* Tier badge */}
                {tierStyle && legend.tier && (
                  <span
                    className={cn(
                      "mt-1.5 inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold",
                      tierStyle.bg,
                      tierStyle.text,
                      tierStyle.border,
                    )}
                  >
                    Tier {legend.tier}
                  </span>
                )}

                {/* Stats */}
                <div className="mt-2 flex flex-col items-center gap-0.5">
                  <span className="text-lg font-bold text-arcane">
                    {legend.deckCount}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {legend.deckCount === 1 ? "deck" : "decks"}
                  </span>
                </div>

                {/* Popularity bar */}
                <div className="mt-2 w-full">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-muted">Popularité</span>
                    <span className="font-semibold text-ink-secondary">
                      {legend.popularity}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className="h-full rounded-full bg-arcane transition-all"
                      style={{ width: `${Math.min(legend.popularity, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
