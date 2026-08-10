"use client";

import { useMemo, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { cn, displayLegendName } from "@/lib/utils";
import type { DecklistCard } from "@/types";
import { useT } from "@/components/i18n-provider";

export interface BestOfEntry {
  id: string;
  legendName: string;
  deckName: string;
  playerName?: string;
  context?: string;
  description?: string;
  cards: DecklistCard[];
  deckbuilderCode?: string;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

export function BestOfDeckBrowser({ entries }: { entries: BestOfEntry[] }) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return entries;
    return entries.filter(
      (e) =>
        norm(e.legendName).includes(q) ||
        norm(e.deckName).includes(q) ||
        norm(e.playerName ?? "").includes(q),
    );
  }, [entries, query]);

  const allOpen = filtered.length > 0 && filtered.every((e) => open[e.id]);

  function toggleAll() {
    const next = { ...open };
    for (const e of filtered) next[e.id] = !allOpen;
    setOpen(next);
  }

  return (
    <div className="my-6">
      <div className="sticky top-2 z-20 mb-4 flex flex-col gap-2 rounded-card border border-hairline bg-surface/95 p-3 backdrop-blur sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Rechercher une Légende ou un joueur…")}

            aria-label={t("Rechercher une Légende ou un joueur")}
            className="w-full rounded-lg border border-hairline-strong bg-surface-raised py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-arcane"
          />
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <span className="text-xs text-ink-muted">
            {filtered.length} deck{filtered.length > 1 ? "s" : ""}
          </span>
          <button
            onClick={toggleAll}
            className="rounded-lg bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-secondary transition-colors hover:text-ink"
          >
            {allOpen ? "Tout replier" : "Tout déplier"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((e) => {
          const isOpen = !!open[e.id];
          return (
            <div key={e.id} className={cn("rounded-card border border-hairline bg-surface", !isOpen && "overflow-hidden")}>
              <button
                onClick={() => setOpen((o) => ({ ...o, [e.id]: !o[e.id] }))}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-raised/50"
                aria-expanded={isOpen}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                    {displayLegendName(e.legendName)}
                  </div>
                  {(e.playerName || e.context) && (
                    <div className="mt-0.5 truncate text-xs text-ink-muted">
                      {e.playerName}
                      {e.playerName && e.context ? " · " : ""}
                      {e.context}
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={18}
                  className={cn("shrink-0 text-ink-muted transition-transform", isOpen && "rotate-180")}
                />
              </button>
              {isOpen && (
                <div className="border-t border-hairline px-3 pb-3 pt-1 sm:px-4">
                  {e.description && (
                    <div className="text-sm">
                      <MarkdownRenderer content={e.description} />
                    </div>
                  )}
                  <DecklistInteractive
                    cards={e.cards}
                    deckName={e.deckName}
                    legendName={e.legendName}
                    playerName={e.playerName}
                    context={e.context}
                    compact
                    showCopyCode
                    showExportPng={false}
                    deckbuilderCode={e.deckbuilderCode}
                  />
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-muted">Aucune Légende ne correspond à « {query} ».</p>
        )}
      </div>
    </div>
  );
}
