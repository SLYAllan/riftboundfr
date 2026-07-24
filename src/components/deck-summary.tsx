"use client";

import { useState, useMemo } from "react";
import { Shuffle } from "lucide-react";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR, DOMAIN_ICONS, TYPE_LABELS_FR } from "@/lib/domains";
import { CardImage } from "@/components/card-image";
import type { DecklistCard } from "@/types";

interface DeckSummaryProps {
  cards: DecklistCard[];
}

function DonutChart({
  data,
  size = 100,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let accumulated = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {data.map((d, i) => {
        const pct = d.value / total;
        const dashLength = pct * circumference;
        const dashOffset = -accumulated * circumference + circumference * 0.25;
        accumulated += pct;

        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={size * 0.17}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            opacity={0.85}
          />
        );
      })}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink"
        fontSize={size * 0.19}
        fontWeight="bold"
      >
        {total}
      </text>
    </svg>
  );
}

function StackedCurve({
  title,
  cards,
  field,
  maxBucket,
}: {
  title: string;
  cards: DecklistCard[];
  field: "energy" | "might";
  maxBucket: number;
}) {
  const curve = useMemo(() => {
    const map = new Map<number, { total: number; byDomain: Map<string, number> }>();
    for (const c of cards) {
      const val = c[field];
      if (val == null || c.section === "legend") continue;
      const clamped = Math.min(val, maxBucket);
      if (!map.has(clamped)) map.set(clamped, { total: 0, byDomain: new Map() });
      const bucket = map.get(clamped)!;
      bucket.total += c.quantity;
      const domain = c.domains?.[0] ?? "neutral";
      bucket.byDomain.set(domain, (bucket.byDomain.get(domain) ?? 0) + c.quantity);
    }
    return map;
  }, [cards, field, maxBucket]);

  // useState AVANT tout return anticipé (rules-of-hooks : sinon nombre de hooks variable → crash).
  const [hovered, setHovered] = useState<number | null>(null);

  const hasData = Array.from(curve.values()).some((b) => b.total > 0);
  if (!hasData) return null;

  const maxCount = Math.max(1, ...Array.from(curve.values()).map((b) => b.total));
  const BAR_MAX = 72;
  const buckets = Array.from({ length: maxBucket + 1 }, (_, i) => i);

  return (
    <div>
      <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">{title}</h5>
      <div className="flex items-end gap-1">
        {buckets.map((val) => {
          const bucket = curve.get(val);
          const total = bucket?.total ?? 0;
          const barH = total ? Math.max((total / maxCount) * BAR_MAX, 4) : 0;
          const segments: { domain: string; count: number }[] = [];
          if (bucket) {
            for (const [domain, count] of bucket.byDomain)
              segments.push({ domain, count });
          }

          return (
            <div
              key={val}
              className="flex-1 flex flex-col items-center gap-0.5 relative"
              onMouseEnter={() => setHovered(val)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="text-[9px] text-ink-muted">{total || ""}</span>
              <div
                className="w-full flex flex-col-reverse rounded-t overflow-hidden"
                style={{ height: barH }}
              >
                {segments.map((seg) => (
                  <div
                    key={seg.domain}
                    className="w-full"
                    style={{
                      height: `${(seg.count / total) * 100}%`,
                      backgroundColor: DOMAIN_COLORS[seg.domain] ?? "#64748b",
                      opacity: 0.85,
                    }}
                  />
                ))}
              </div>
              <span className="text-[9px] text-ink-muted">
                {val === maxBucket ? `${maxBucket}+` : val}
              </span>
              {hovered === val && segments.length > 0 && (
                <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap rounded bg-surface border border-hairline shadow-lg px-2 py-1.5 text-[10px] pointer-events-none">
                  {segments.map((seg) => (
                    <div key={seg.domain} className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: DOMAIN_COLORS[seg.domain] ?? "#64748b" }}
                      />
                      <span className="text-ink-secondary">
                        {DOMAIN_LABELS_FR[seg.domain] ?? seg.domain}
                      </span>
                      <span className="font-semibold text-ink">{seg.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DomainsChart({ cards }: { cards: DecklistCard[] }) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) {
      if (c.section === "legend") continue;
      for (const d of c.domains ?? []) {
        counts.set(d, (counts.get(d) ?? 0) + c.quantity);
      }
      if (!c.domains?.length) {
        counts.set("Neutre", (counts.get("Neutre") ?? 0) + c.quantity);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([domain, value]) => ({
        label: DOMAIN_LABELS_FR[domain] ?? domain,
        value,
        color: DOMAIN_COLORS[domain] ?? "#64748b",
        icon: DOMAIN_ICONS[domain],
      }));
  }, [cards]);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  return (
    <div>
      <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">
        Domaines
      </h5>
      <div className="flex items-center gap-3">
        <DonutChart data={data} size={90} />
        <div className="space-y-1 min-w-0">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-1.5 text-[11px]">
              {d.icon && (
                <img src={d.icon} alt="" className="h-3 w-3 shrink-0" />
              )}
              {!d.icon && (
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: d.color }}
                />
              )}
              <span className="text-ink-secondary truncate">{d.label}</span>
              <span className="font-semibold text-ink">{d.value}</span>
              <span className="text-ink-muted">
                ({Math.round((d.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TypesChart({ cards }: { cards: DecklistCard[] }) {
  const typeColors: Record<string, string> = {
    Unit: "#0ea5e9",
    Spell: "#8b5cf6",
    Gear: "#f59e0b",
    Rune: "#22c55e",
    Battlefield: "#ec4899",
  };

  const data = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cards) {
      if (c.section === "legend") continue;
      counts.set(c.type, (counts.get(c.type) ?? 0) + c.quantity);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, value]) => ({
        label: TYPE_LABELS_FR[type] ?? type,
        value,
        color: typeColors[type] ?? "#64748b",
      }));
  }, [cards]);

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  return (
    <div>
      <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">
        Types de cartes
      </h5>
      <div className="flex items-center gap-3">
        <DonutChart data={data} size={90} />
        <div className="space-y-1 min-w-0">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-1.5 text-[11px]">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-ink-secondary">{d.label}</span>
              <span className="font-semibold text-ink">{d.value}</span>
              <span className="text-ink-muted">
                ({Math.round((d.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DrawHand({ cards }: { cards: DecklistCard[] }) {
  const [hand, setHand] = useState<DecklistCard[]>([]);

  const drawableCards = useMemo(
    () => cards.filter((c) => c.section === "main"),
    [cards],
  );

  function draw() {
    const pool: DecklistCard[] = [];
    for (const c of drawableCards) {
      for (let i = 0; i < c.quantity; i++) pool.push(c);
    }
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setHand(pool.slice(0, 5));
  }

  if (drawableCards.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
          Tirer une main
        </h5>
        <button
          onClick={draw}
          className="inline-flex items-center gap-1 rounded-lg bg-arcane px-2.5 py-1 text-[10px] font-semibold text-white hover:opacity-90 transition-opacity"
        >
          <Shuffle size={11} />
          {hand.length ? "Retirer" : "Tirer"}
        </button>
      </div>
      {hand.length > 0 && (
        <div className="grid grid-cols-5 gap-1.5">
          {hand.map((c, i) => (
            <div key={`${c.cardId}-${i}`} className="text-center">
              <CardImage src={c.artUrl} alt={c.name} size="sm" />
              <div className="mt-0.5 truncate text-[9px] text-ink-secondary">
                {c.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DeckSummary({ cards }: DeckSummaryProps) {
  return (
    <div className="space-y-5">
      <StackedCurve title="Courbe d'énergie" cards={cards} field="energy" maxBucket={8} />
      <StackedCurve title="Courbe de puissance" cards={cards} field="might" maxBucket={6} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <DomainsChart cards={cards} />
        <TypesChart cards={cards} />
      </div>
      <DrawHand cards={cards} />
    </div>
  );
}
