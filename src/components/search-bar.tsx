"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLien, useT } from "@/components/i18n-provider";
import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  basePath?: string;
}

export function SearchBar({ placeholder = "Rechercher une carte...", basePath = "/cartes" }: SearchBarProps) {
  const router = useRouter();
  const lien = useLien();
  const t = useT();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const etiquette = t(placeholder);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(lien(`${basePath}?${params.toString()}`));
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={etiquette}
        aria-label={etiquette}
        className="h-12 w-full rounded-full border border-hairline-strong bg-surface pl-12 pr-4 text-ink placeholder:text-ink-muted focus:border-arcane focus:ring-2 focus:ring-arcane-glow"
      />
    </form>
  );
}
