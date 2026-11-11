"use client";

import { useState } from "react";
import { ChevronDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DomainDistribution, EnergyCurve, TypeDistribution } from "@/components/deck-stats-panel";
import type { DeckEntry } from "@/types";
import { useT } from "@/components/i18n-provider";

interface DeckStatsProps {
  mainDeck: DeckEntry[];
}

export function DeckStats({ mainDeck }: DeckStatsProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [dist, setDist] = useState<"type" | "domain">("type");

  return (
    <div className="border-b border-hairline/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 hover:bg-surface-raised/30 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <ChevronDown size={13} className={cn("text-ink-muted transition-transform", !open && "-rotate-90")} />
          <BarChart3 size={13} className="text-ink-muted" />
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Statistiques</p>
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-3">
          <EnergyCurve cartes={mainDeck} compact />
          {/* Type / Domaine : un seul à la fois pour alléger le panneau */}
          <div>
            <div className="mb-2 inline-flex rounded-lg bg-surface-raised/60 p-0.5">
              {([
                ["type", "Types"],
                ["domain", "Domaines"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setDist(key)}
                  className={cn(
                    "min-h-11 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors sm:min-h-6",
                    dist === key
                      ? "bg-surface-raised text-arcane"
                      : "text-ink-muted hover:text-ink-secondary",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {dist === "type" ? (
              <TypeDistribution cartes={mainDeck} compact />
            ) : (
              <DomainDistribution cartes={mainDeck} compact />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
