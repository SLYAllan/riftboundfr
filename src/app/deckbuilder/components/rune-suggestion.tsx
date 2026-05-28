"use client";

import { Sparkles } from "lucide-react";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR } from "@/lib/domains";
import { calculateRuneSuggestion, type RuneSuggestion } from "../lib/rune-calculator";
import type { DeckEntry } from "@/types";

interface RuneSuggestionProps {
  mainDeck: DeckEntry[];
  legendDomains: string[];
  currentRunes: DeckEntry[];
  onApply: (suggestions: RuneSuggestion[]) => void;
}

export function RuneSuggestionPanel({ mainDeck, legendDomains, currentRunes, onApply }: RuneSuggestionProps) {
  if (mainDeck.length === 0 || legendDomains.length === 0) return null;

  const suggestions = calculateRuneSuggestion(mainDeck, legendDomains);
  const runeTotal = currentRunes.reduce((s, e) => s + e.quantity, 0);

  const isSameAsCurrent = suggestions.every((s) => {
    const current = currentRunes.find((r) => r.domains.includes(s.domain));
    return current && current.quantity === s.count;
  }) && runeTotal === 12;

  return (
    <div className="px-3 py-2 border-b border-hairline/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-gold" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Runes suggérées</span>
        </div>
        {!isSameAsCurrent && (
          <button
            onClick={() => onApply(suggestions)}
            className="rounded-md bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold hover:bg-gold/20 transition-colors"
          >
            Appliquer
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {suggestions.map((s) => (
          <div key={s.domain} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: DOMAIN_COLORS[s.domain] }}
            />
            <span className="text-xs text-ink-secondary">
              {s.count} {DOMAIN_LABELS_FR[s.domain] ?? s.domain}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
