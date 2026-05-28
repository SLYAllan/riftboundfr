"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

interface DeckFiltersProps {
  tab: string;
  legends: string[];
  tournaments?: string[];
}

export function DeckFilters({ tab, legends, tournaments }: DeckFiltersProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const navigate = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(sp.toString());
      params.set("tab", tab);
      params.delete("page");
      for (const [k, v] of Object.entries(updates)) {
        if (v) params.set(k, v);
        else params.delete(k);
      }
      router.push(`/admin/decks?${params.toString()}`);
    },
    [router, sp, tab],
  );

  function handleSearch(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => navigate({ q: value }), 300);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Rechercher…"
        defaultValue={sp.get("q") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:border-arcane focus:outline-none w-56"
      />
      {legends.length > 0 && (
        <select
          defaultValue={sp.get("legend") ?? ""}
          onChange={(e) => navigate({ legend: e.target.value })}
          className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm text-ink focus:border-arcane focus:outline-none"
        >
          <option value="">Toutes les légendes</option>
          {legends.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      )}
      {tournaments && tournaments.length > 0 && (
        <select
          defaultValue={sp.get("tournament") ?? ""}
          onChange={(e) => navigate({ tournament: e.target.value })}
          className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm text-ink focus:border-arcane focus:outline-none"
        >
          <option value="">Tous les tournois</option>
          {tournaments.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
