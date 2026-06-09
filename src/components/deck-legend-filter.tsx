"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface DeckLegendFilterProps {
  legends: string[];
}

export function DeckLegendFilter({ legends }: DeckLegendFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("legend") ?? "";

  // Dédup insensible à la casse : évite les doublons type "Rek'sai" / "Rek'Sai".
  const uniqueLegends = (() => {
    const seen = new Map<string, string>();
    for (const name of legends) {
      const key = name.toLowerCase();
      if (!seen.has(key)) seen.set(key, name);
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b, "fr"));
  })();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("legend", value);
    } else {
      params.delete("legend");
    }
    router.push(`/decks?${params.toString()}`);
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={14} />
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="h-9 w-full sm:w-64 rounded-lg border border-hairline-strong bg-surface pl-9 pr-3 text-sm text-ink focus:border-arcane focus:outline-none cursor-pointer appearance-none"
      >
        <option value="">Toutes les legendes</option>
        {uniqueLegends.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
    </div>
  );
}
