"use client";

import Link from "next/link";
import { cn, formatDate, displayLegendName } from "@/lib/utils";
import { CountryBadge } from "@/components/country-badge";
import {
  Users,
  MapPin,
  Calendar,
  Swords,
  ChevronRight,
} from "lucide-react";
import type { TournamentData } from "@/app/tournois/page";

const MEDAL_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: "bg-gold/15", text: "text-gold", label: "1er" },
  2: { bg: "bg-gray-400/15", text: "text-gray-300", label: "2e" },
  3: { bg: "bg-amber-600/15", text: "text-amber-600", label: "3e" },
};

function TournamentRow({
  tournament,
  featured,
}: {
  tournament: TournamentData;
  featured?: boolean;
}) {
  const top8 = tournament.topDecks.filter((d) => d.placementNum <= 8);

  return (
    <div
      className={cn(
        "group rounded-xl border border-hairline bg-surface/40 transition-all duration-200",
        "hover:border-hairline-accent hover:bg-surface/70",
        featured && "border-hairline-strong bg-surface/60",
      )}
    >
      <Link
        href={`/tournois/${tournament.slug}`}
        className="block px-5 py-4"
      >
        {/* Main row */}
        <div className="flex items-center gap-4">
          {/* Flag */}
          <div className="shrink-0">
            {tournament.countryCode && (
              <CountryBadge code={tournament.countryCode} className="text-xs px-2 py-1" />
            )}
          </div>

          {/* Name + articles */}
          <div className="flex-1 min-w-0">
            <h2
              className={cn(
                "font-bold leading-tight tracking-tight group-hover:text-arcane-light transition-colors",
                featured ? "text-lg" : "text-base",
              )}
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              {tournament.name}
            </h2>

            {/* Meta info */}
            <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-secondary">
              {tournament.date && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-ink-muted" />
                  {formatDate(tournament.date)}
                </span>
              )}
              {tournament.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-ink-muted" />
                  {tournament.location}
                </span>
              )}
              {tournament.playerCount && (
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-ink-muted" />
                  {tournament.playerCount.toLocaleString("fr-FR")} joueurs
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Swords size={13} className="text-ink-muted" />
                {tournament.deckCount} decklists
              </span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight
            size={18}
            className="shrink-0 text-ink-muted group-hover:text-arcane transition-all group-hover:translate-x-0.5"
          />
        </div>
      </Link>

      {/* Top 8 inline */}
      {top8.length > 0 && (
        <div className="px-5 pb-4 -mt-1">
          <div className="flex flex-wrap gap-1.5">
            {top8.map((deck) => {
              const medal = MEDAL_STYLES[deck.placementNum];
              return (
                <Link
                  key={deck.slug}
                  href={`/decks/${deck.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "group/chip inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors",
                    "bg-canvas/60 hover:bg-surface-raised border border-hairline/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold shrink-0",
                      medal?.bg ?? "bg-surface-raised",
                      medal?.text ?? "text-ink-muted",
                    )}
                    style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                  >
                    {medal?.label ?? deck.placementNum}
                  </span>
                  {deck.legendIcon && (
                    <img
                      src={deck.legendIcon}
                      alt=""
                      className="h-8 w-8 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium truncate max-w-[100px] leading-tight">
                      {deck.playerName ?? "Inconnu"}
                    </span>
                    <span className="text-[10px] text-ink-muted truncate max-w-[100px] leading-tight hidden sm:block">
                      {displayLegendName(deck.legendName)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function TournamentList({ tournaments }: { tournaments: TournamentData[] }) {
  const featured = tournaments.slice(0, 3);
  const rest = tournaments.slice(3);

  return (
    <div>
      {featured.length > 0 && (
        <div className="space-y-3">
          {featured.map((t) => (
            <TournamentRow key={t.name} tournament={t} featured />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <>
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-hairline" />
            <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">
              Tournois précédents
            </span>
            <div className="h-px flex-1 bg-hairline" />
          </div>
          <div className="space-y-2">
            {rest.map((t) => (
              <TournamentRow key={t.name} tournament={t} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
