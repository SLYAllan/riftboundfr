"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetaIndicatorProps {
  legendName: string | null;
}

interface LegendMeta {
  tier: string | null;
  tournamentDecks: number;
  guideSlug: string | null;
}

const TIER_COLORS: Record<string, string> = {
  S: "text-amber-400 bg-amber-400/10",
  A: "text-emerald-400 bg-emerald-400/10",
  B: "text-arcane bg-arcane/10",
  C: "text-ink-secondary bg-surface-raised",
  D: "text-ink-muted bg-surface-raised",
};

export function MetaIndicator({ legendName }: MetaIndicatorProps) {
  const [meta, setMeta] = useState<LegendMeta | null>(null);
  const [metaName, setMetaName] = useState<string | null>(null);

  useEffect(() => {
    if (!legendName) return;

    let cancelled = false;

    fetch(`/api/legends/meta?name=${encodeURIComponent(legendName)}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (cancelled) return;
        setMeta(data);
        setMetaName(legendName);
      })
      .catch(() => {
        if (cancelled) return;
        setMeta(null);
        setMetaName(legendName);
      });

    return () => { cancelled = true; };
  }, [legendName]);

  if (!legendName || metaName !== legendName || !meta) return null;
  if (!meta.tier && meta.tournamentDecks === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {meta.tier && (
        <span className={cn(
          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
          TIER_COLORS[meta.tier] ?? TIER_COLORS.C,
        )}>
          <TrendingUp size={10} />
          Tier {meta.tier}
        </span>
      )}
      {meta.tournamentDecks > 0 && (
        <span className="text-ink-muted">
          {meta.tournamentDecks} deck{meta.tournamentDecks > 1 ? "s" : ""} en tournoi
        </span>
      )}
      {meta.guideSlug && (
        <a
          href={`/guides/${meta.guideSlug}`}
          className="text-arcane hover:underline inline-flex items-center gap-0.5"
          target="_blank"
          rel="noopener noreferrer"
        >
          Guide <ExternalLink size={10} />
        </a>
      )}
    </div>
  );
}
