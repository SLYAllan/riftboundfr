"use client";

import { useMemo, useState } from "react";
import Link from "@/components/lien";
import { cn, formatDate, displayLegendName } from "@/lib/utils";
import { getBannerUrl } from "@/lib/banners";
import { CountryBadge } from "@/components/country-badge";
import {
  Users,
  MapPin,
  Calendar,
  Swords,
  Search,
} from "lucide-react";
import type { TournamentData } from "@/app/tournois/page";
import { useT } from "@/components/i18n-provider";

const SET_FILTERS = ["Tous", "Origins", "Spiritforged", "Unleashed"] as const;

const MEDAL_RING: Record<number, string> = {
  1: "ring-2 ring-gold",
  2: "ring-2 ring-gray-300/70",
  3: "ring-2 ring-amber-600/70",
};

const MEDAL_TEXT: Record<number, string> = {
  1: "text-gold",
  2: "text-gray-300",
  3: "text-amber-600",
};

function TournamentRow({
  tournament,
  featured,
}: {
  tournament: TournamentData;
  featured?: boolean;
}) {
  const top8 = tournament.topDecks.filter((d) => d.placementNum <= 8);
  const winner = top8.find((d) => d.placementNum === 1);
  const bannerUrl = winner ? getBannerUrl(winner.legendName) : null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-hairline bg-surface/50 transition-colors duration-200",
        "hover:border-hairline-accent",
        featured && "border-hairline-strong bg-surface/70",
      )}
    >
      {/* Art de la légende du vainqueur, fondu dans la carte */}
      {bannerUrl && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 max-w-[420px] sm:block"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 45%)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 45%)",
          }}
        >
          <img
            src={bannerUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-[center_20%] opacity-60 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/45 to-canvas/10" />
          {winner && (
            <div className="texte-sur-art absolute bottom-2.5 right-4 text-right">
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-gold">
                Vainqueur
              </div>
              <div className="text-sm font-bold leading-tight text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                {winner.playerName ?? "Inconnu"}
              </div>
              <div className="text-[11px] leading-tight text-ink">
                {displayLegendName(winner.legendName)}
              </div>
            </div>
          )}
        </div>
      )}

      <Link
        href={`/tournois/${tournament.slug}`}
        className="relative z-10 block px-5 pt-4 pb-2 sm:pr-[38%]"
      >
        <div className="flex items-center gap-3">
          {tournament.countryCode && (
            <CountryBadge code={tournament.countryCode} className="h-6 w-9 shrink-0" />
          )}
          <h2
            className={cn(
              "min-w-0 truncate font-bold leading-tight tracking-tight group-hover:text-arcane-light transition-colors",
              featured ? "text-lg" : "text-base",
            )}
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          >
            {tournament.name}
          </h2>
        </div>

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
      </Link>

      {/* Top 8 : tuiles d'icônes uniformes, rang en coin, anneau or/argent/bronze */}
      {top8.length > 0 && (
        <div className="relative z-10 flex flex-wrap items-center gap-1.5 px-5 pb-4 pt-1">
          {top8.map((deck) => (
            <Link
              key={deck.slug}
              href={`/decks/${deck.slug}`}
              title={`${deck.placement ?? deck.placementNum} - ${deck.playerName ?? "Inconnu"} (${displayLegendName(deck.legendName)})`}
              className={cn(
                "relative h-9 w-9 shrink-0 overflow-hidden rounded-lg transition-transform hover:z-10 hover:scale-110",
                MEDAL_RING[deck.placementNum] ?? "ring-1 ring-hairline",
              )}
            >
              {deck.legendIcon ? (
                <img
                  src={deck.legendIcon}
                  alt={displayLegendName(deck.legendName)}
                  loading="lazy"
                  decoding="async"
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-surface-raised" />
              )}
              <span
                className={cn(
                  "absolute bottom-0 right-0 rounded-tl bg-canvas/85 px-1 text-[9px] font-bold leading-snug",
                  MEDAL_TEXT[deck.placementNum] ?? "text-ink-secondary",
                )}
                style={{ fontFamily: "var(--font-rubik), sans-serif" }}
              >
                {deck.placementNum}
              </span>
            </Link>
          ))}
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
          "flex h-9 w-9 items-center justify-center rounded-lg text-lg font-black text-canvas",
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
  const t = useT();
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
            placeholder={t("Rechercher un tournoi…")}

            aria-label={t("Rechercher un tournoi")}
            className="w-full rounded-lg border border-hairline bg-transparent py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-hairline-accent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-ink-muted">{t("Aucun tournoi pour ce filtre.")}</p>
      ) : (
        <div className="space-y-10">
          {sTier.length > 0 && (
            <section>
              <TierHeader tier="S" label="Regional Opens & Qualifiers - Europe & Chine" count={sTier.length} />
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
