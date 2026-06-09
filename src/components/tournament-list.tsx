"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn, formatDate, displayLegendName } from "@/lib/utils";
import { CountryBadge } from "@/components/country-badge";
import {
  Users,
  MapPin,
  Calendar,
  Swords,
  ChevronRight,
  Search,
} from "lucide-react";
import type { TournamentData } from "@/app/tournois/page";

const SET_FILTERS = ["Tous", "Origins", "Spiritforged", "Unleashed"] as const;

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
              <CountryBadge code={tournament.countryCode} className="h-6 w-9" />
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {top8.map((deck) => {
              const medal = MEDAL_STYLES[deck.placementNum];
              return (
                <Link
                  key={deck.slug}
                  href={`/decks/${deck.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "group/chip flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
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
                      loading="lazy"
                      decoding="async"
                      width={28}
                      height={28}
                      className="h-7 w-7 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium leading-tight">
                      {deck.playerName ?? "Inconnu"}
                    </span>
                    <span className="hidden truncate text-[10px] leading-tight text-ink-muted sm:block">
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

function TierHeader({ tier, label, count }: { tier: "S" | "A"; label: string; count: number }) {
  const bg = tier === "S" ? "bg-gold" : "bg-arcane";
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg text-lg font-black text-white",
          bg,
        )}
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        {tier}
      </span>
      <h2
        className="text-sm font-bold uppercase tracking-wider text-ink-secondary"
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        {label}
      </h2>
      <span className="text-[11px] font-bold text-ink-muted">{count}</span>
      <div className="h-px flex-1 bg-hairline" />
    </div>
  );
}

export function TournamentList({ tournaments }: { tournaments: TournamentData[] }) {
  const [setFilter, setSetFilter] = useState<string>("Tous");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tournaments.filter((t) => {
      if (setFilter !== "Tous" && t.set !== setFilter) return false;
      if (
        q &&
        !(t.name ?? "").toLowerCase().includes(q) &&
        !(t.location ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [tournaments, setFilter, query]);

  const sTier = filtered.filter((t) => t.tier === "S");
  const aTier = filtered.filter((t) => t.tier === "A");

  return (
    <div>
      {/* Filtres */}
      <div className="mb-10 flex flex-col gap-3 border-b border-hairline pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {SET_FILTERS.map((s) => {
            const active = setFilter === s;
            const count = s === "Tous" ? tournaments.length : tournaments.filter((t) => t.set === s).length;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSetFilter(s)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors",
                  active
                    ? "border-arcane/40 text-arcane-light"
                    : "border-transparent text-ink-secondary hover:text-ink",
                )}
              >
                {s} <span className="text-ink-muted">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative sm:w-64">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un tournoi…"
            className="w-full rounded-lg border border-hairline bg-transparent py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-hairline-accent focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-ink-muted">Aucun tournoi pour ce filtre.</p>
      ) : (
        <div className="space-y-10">
          {sTier.length > 0 && (
            <section>
              <TierHeader tier="S" label="Regional Opens & Qualifiers — Europe & Chine" count={sTier.length} />
              <div className="space-y-3">
                {sTier.map((t) => (
                  <TournamentRow key={t.slug} tournament={t} featured />
                ))}
              </div>
            </section>
          )}

          {aTier.length > 0 && (
            <section>
              <TierHeader tier="A" label="City Challenges & autres tournois" count={aTier.length} />
              <div className="space-y-2">
                {aTier.map((t) => (
                  <TournamentRow key={t.slug} tournament={t} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
