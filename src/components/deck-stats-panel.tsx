"use client";

import { DOMAIN_COLORS, DOMAIN_LABELS_FR, TYPE_LABELS_FR } from "@/lib/domains";
import type { DecklistCard } from "@/types";
import { useT } from "@/components/i18n-provider";

interface DeckStatsPanelProps {
  cards: DecklistCard[];
}

function EnergyCurve({ cards }: { cards: DecklistCard[] }) {
  const t = useT();
  const mainCards = cards.filter((c) => c.section === "main");
  const curve = new Map<number, { total: number; byDomain: Map<string, number> }>();

  for (const c of mainCards) {
    if (c.energy == null) continue;
    const cost = Math.min(c.energy, 8);
    if (!curve.has(cost)) curve.set(cost, { total: 0, byDomain: new Map() });
    const bucket = curve.get(cost)!;
    bucket.total += c.quantity;
    const domain = c.domains?.[0] ?? "neutral";
    bucket.byDomain.set(domain, (bucket.byDomain.get(domain) ?? 0) + c.quantity);
  }

  const maxCount = Math.max(1, ...Array.from(curve.values()).map((b) => b.total));
  const BAR_MAX_H = 72;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">{t("Courbe d’énergie")}</p>
      <div className="flex items-end gap-1.5">
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
              <span className="text-[10px] text-ink-muted font-medium">{total || ""}</span>
              <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: barH }}>
                {segments.map((seg) => (
                  <div
                    key={seg.domain}
                    className="w-full"
                    style={{
                      height: `${(seg.count / total) * 100}%`,
                      backgroundColor: DOMAIN_COLORS[seg.domain] ?? "#0ea5e9",
                      opacity: 0.85,
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] text-ink-muted">{cost === 8 ? "8+" : cost}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TypeDistribution({ cards }: { cards: DecklistCard[] }) {
  const t = useT();
  const mainCards = cards.filter((c) => c.section === "main");
  const typeCounts = new Map<string, number>();
  let total = 0;
  for (const c of mainCards) {
    typeCounts.set(c.type, (typeCounts.get(c.type) ?? 0) + c.quantity);
    total += c.quantity;
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
      <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">{t("Répartition par type")}</p>
      <div className="space-y-2">
        {sorted.map(([type, count]) => (
          <div key={type} className="flex items-center gap-2">
            <span className="text-xs text-ink-secondary w-20 shrink-0">{TYPE_LABELS_FR[type] ?? type}</span>
            <div className="flex-1 h-4 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-colors duration-300"
                style={{
                  width: `${(count / total) * 100}%`,
                  backgroundColor: typeColors[type] ?? "#64748b",
                }}
              />
            </div>
            <span className="text-xs text-ink-muted w-8 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DomainDistribution({ cards }: { cards: DecklistCard[] }) {
  const t = useT();
  const mainCards = cards.filter((c) => c.section === "main");
  const domainCounts = new Map<string, number>();
  let total = 0;
  for (const c of mainCards) {
    const domains = c.domains ?? [];
    for (const d of domains) {
      domainCounts.set(d, (domainCounts.get(d) ?? 0) + c.quantity);
    }
    if (domains.length === 0) {
      domainCounts.set("Neutre", (domainCounts.get("Neutre") ?? 0) + c.quantity);
    }
    total += c.quantity;
  }

  const sorted = Array.from(domainCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-3">{t("Répartition par domaine")}</p>
      <div className="space-y-2">
        {sorted.map(([domain, count]) => (
          <div key={domain} className="flex items-center gap-2">
            <span className="text-xs w-16 shrink-0" style={{ color: DOMAIN_COLORS[domain] ?? "#64748b" }}>
              {DOMAIN_LABELS_FR[domain] ?? domain}
            </span>
            <div className="flex-1 h-4 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-colors duration-300"
                style={{
                  width: `${(count / total) * 100}%`,
                  backgroundColor: DOMAIN_COLORS[domain] ?? "#64748b",
                }}
              />
            </div>
            <span className="text-xs text-ink-muted w-8 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DeckStatsPanel({ cards }: DeckStatsPanelProps) {
  const mainCards = cards.filter((c) => c.section === "main");
  if (mainCards.length === 0) return null;

  return (
    <div className="rounded-xl border border-hairline bg-surface p-5 space-y-5">
      <EnergyCurve cards={cards} />
      <TypeDistribution cards={cards} />
      <DomainDistribution cards={cards} />
    </div>
  );
}
