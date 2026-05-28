"use client";

import { useState } from "react";
import { ChevronDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR } from "@/lib/domains";
import type { DeckEntry } from "@/types";

interface DeckStatsProps {
  mainDeck: DeckEntry[];
}

function EnergyCurve({ entries }: { entries: DeckEntry[] }) {
  const curve = new Map<number, { total: number; byDomain: Map<string, number> }>();

  for (const e of entries) {
    if (e.energy == null) continue;
    const cost = Math.min(e.energy, 8);
    if (!curve.has(cost)) curve.set(cost, { total: 0, byDomain: new Map() });
    const bucket = curve.get(cost)!;
    bucket.total += e.quantity;
    const domain = e.domains[0] ?? "neutral";
    bucket.byDomain.set(domain, (bucket.byDomain.get(domain) ?? 0) + e.quantity);
  }

  const maxCount = Math.max(1, ...Array.from(curve.values()).map((b) => b.total));

  const BAR_MAX_H = 64;

  return (
    <div>
      <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">Courbe d&apos;énergie</h5>
      <div className="flex items-end gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cost) => {
          const bucket = curve.get(cost);
          const total = bucket?.total ?? 0;
          const barH = total ? Math.max((total / maxCount) * BAR_MAX_H, 4) : 0;

          const segments: { domain: string; count: number }[] = [];
          if (bucket) {
            for (const [domain, count] of bucket.byDomain) segments.push({ domain, count });
          }

          return (
            <div key={cost} className="flex-1 flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-ink-muted">{total || ""}</span>
              <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: barH }}>
                {segments.map((seg) => (
                  <div
                    key={seg.domain}
                    className="w-full"
                    style={{
                      height: `${(seg.count / total) * 100}%`,
                      backgroundColor: DOMAIN_COLORS[seg.domain] ?? "#0ea5e9",
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] text-ink-muted">{cost === 8 ? "8+" : cost}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TypeDistribution({ entries }: { entries: DeckEntry[] }) {
  const typeCounts = new Map<string, number>();
  let total = 0;
  for (const e of entries) {
    typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + e.quantity);
    total += e.quantity;
  }

  const typeColors: Record<string, string> = {
    Unit: "#0ea5e9",
    Spell: "#8b5cf6",
    Gear: "#f59e0b",
    Signature: "#ec4899",
  };

  const sorted = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">Distribution par type</h5>
      <div className="space-y-1.5">
        {sorted.map(([type, count]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="text-[11px] text-ink-secondary w-16 shrink-0">{type}</span>
            <div className="flex-1 h-3 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(count / total) * 100}%`,
                  backgroundColor: typeColors[type] ?? "#64748b",
                }}
              />
            </div>
            <span className="text-[10px] text-ink-muted w-8 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DomainDistribution({ entries }: { entries: DeckEntry[] }) {
  const domainCounts = new Map<string, number>();
  let total = 0;
  for (const e of entries) {
    for (const d of e.domains) {
      domainCounts.set(d, (domainCounts.get(d) ?? 0) + e.quantity);
    }
    if (e.domains.length === 0) {
      domainCounts.set("Neutre", (domainCounts.get("Neutre") ?? 0) + e.quantity);
    }
    total += e.quantity;
  }

  const sorted = Array.from(domainCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">Distribution par domaine</h5>
      <div className="space-y-1.5">
        {sorted.map(([domain, count]) => (
          <div key={domain} className="flex items-center gap-2">
            <span className="text-[11px] w-14 shrink-0" style={{ color: DOMAIN_COLORS[domain] ?? "#64748b" }}>
              {DOMAIN_LABELS_FR[domain] ?? domain}
            </span>
            <div className="flex-1 h-3 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(count / total) * 100}%`,
                  backgroundColor: DOMAIN_COLORS[domain] ?? "#64748b",
                }}
              />
            </div>
            <span className="text-[10px] text-ink-muted w-8 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeckStats({ mainDeck }: DeckStatsProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-hairline/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 hover:bg-surface-raised/30 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <ChevronDown size={13} className={cn("text-ink-muted transition-transform", !open && "-rotate-90")} />
          <BarChart3 size={13} className="text-ink-muted" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Statistiques</h4>
        </div>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-4">
          <EnergyCurve entries={mainDeck} />
          <TypeDistribution entries={mainDeck} />
          <DomainDistribution entries={mainDeck} />
        </div>
      )}
    </div>
  );
}
