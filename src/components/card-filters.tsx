"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_TYPES, RARITIES, DOMAINS } from "@/lib/utils";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR } from "@/lib/domains";

interface CardFiltersProps {
  sets: { setId: string; name: string }[];
}

const DOMAIN_ORDER = ["Fury", "Calm", "Order", "Chaos", "Mind", "Body"];

export function CardFilters({ sets }: CardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/cartes?${params.toString()}`);
  }

  function toggleDomain(d: string) {
    const current = searchParams.get("domain");
    updateFilter("domain", current === d ? "all" : d);
  }

  function selectValue(key: string) {
    return searchParams.get(key) ?? "all";
  }

  const activeDomain = searchParams.get("domain") ?? "all";
  const hasFilters = searchParams.toString().length > 0;

  const selectClass =
    "h-9 rounded-lg border border-hairline-strong bg-surface px-3 text-sm text-ink focus:border-arcane focus:outline-none focus:ring-1 focus:ring-arcane-glow cursor-pointer";

  return (
    <div className="space-y-3">
      {/* Domain icons row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {DOMAIN_ORDER.map((d) => {
            const active = activeDomain === d;
            const color = DOMAIN_COLORS[d] ?? "#6b7280";
            return (
              <button
                key={d}
                onClick={() => toggleDomain(d)}
                className={cn(
                  "rounded-md border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all",
                  active
                    ? "border-current shadow-sm"
                    : "border-transparent opacity-40 hover:opacity-70",
                  activeDomain === "all" && !active && "opacity-70 hover:opacity-100",
                )}
                style={{
                  color,
                  backgroundColor: active ? `${color}20` : "transparent",
                }}
              >
                {DOMAIN_LABELS_FR[d] ?? d}
              </button>
            );
          })}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <select className={selectClass} value={selectValue("set")} onChange={(e) => updateFilter("set", e.target.value)}>
            <option value="all">Set</option>
            <option value="origins">Origins</option>
            <option value="spiritforged">Spiritforged</option>
            <option value="unleashed">Unleashed</option>
            <option value="promo">Promo</option>
          </select>

          <select className={selectClass} value={selectValue("type")} onChange={(e) => updateFilter("type", e.target.value)}>
            <option value="all">Type</option>
            {CARD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select className={selectClass} value={selectValue("rarity")} onChange={(e) => updateFilter("rarity", e.target.value)}>
            <option value="all">Rarete</option>
            {RARITIES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => router.push("/cartes")}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-ink-muted hover:text-ink"
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
