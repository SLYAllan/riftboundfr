"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseSearchQuery, tokensToQuery, FIELD_SUGGESTIONS, type SearchToken, type ParsedSearch } from "../lib/search-parser";
import { useT } from "@/components/i18n-provider";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  parsed: ParsedSearch;
}

const TOKEN_COLORS: Record<string, string> = {
  type: "bg-violet/20 text-violet-light border-violet/30",
  domain: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  set: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  energy: "bg-arcane/20 text-arcane border-arcane/30",
  power: "bg-gold/20 text-gold border-gold/30",
  might: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  rarity: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  tag: "bg-sky-500/20 text-sky-400 border-sky-500/30",
};

const FIELD_LABELS: Record<string, string> = {
  type: "Type",
  domain: "Domaine",
  set: "Extension",
  energy: "Énergie",
  power: "Pouvoir",
  might: "Puissance",
  rarity: "Rareté",
  tag: "Tag",
};

export function SearchBar({ value, onChange, parsed }: SearchBarProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionField, setSuggestionField] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const match = newValue.match(/(\w+):$/);
    if (match && FIELD_SUGGESTIONS[match[1] as keyof typeof FIELD_SUGGESTIONS]) {
      setSuggestionField(match[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestionField(null);
    }
  }, [onChange]);

  const handleSuggestionClick = useCallback((field: string, suggestion: string) => {
    const newValue = value.replace(new RegExp(`${field}:$`), `${field}:${suggestion} `);
    onChange(newValue);
    setShowSuggestions(false);
    setSuggestionField(null);
    inputRef.current?.focus();
  }, [value, onChange]);

  const removeToken = useCallback((tokenIndex: number) => {
    const newTokens = parsed.tokens.filter((_, i) => i !== tokenIndex);
    onChange(tokensToQuery(newTokens, parsed.freeText));
  }, [parsed, onChange]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".search-bar-container")) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="search-bar-container relative">
      <div className="relative flex min-h-11 items-center gap-1.5 rounded-lg border border-hairline-strong bg-surface px-3 py-0 transition-colors focus-within:border-arcane sm:min-h-0 sm:py-1.5">
        <Search className="text-ink-muted shrink-0" size={15} />

        {parsed.tokens.map((token, i) => (
          <span
            key={`${token.type}-${token.value}-${i}`}
            className={cn(
              "flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold shrink-0",
              TOKEN_COLORS[token.type] ?? "bg-surface-raised text-ink-secondary border-hairline",
            )}
          >
            <span className="opacity-60">{FIELD_LABELS[token.type] ?? token.type}:</span>
            {token.value}
            <button
              type="button"
              onClick={() => removeToken(i)}
              aria-label={`${t("Retirer le filtre")} ${FIELD_LABELS[token.type] ?? token.type} : ${token.value}`}
              className="ml-0.5 flex min-h-11 min-w-11 items-center justify-center opacity-60 hover:opacity-100"
            >
              <X size={10} aria-hidden />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={parsed.tokens.length > 0 ? parsed.freeText : value}
          onChange={handleChange}
          placeholder={parsed.tokens.length > 0 ? t("Ajouter un filtre...") : t("Rechercher... (ex: unit fury energy:3)")}
          aria-label={t("Rechercher une carte")}
          className="h-11 min-w-[120px] flex-1 bg-transparent text-base text-ink placeholder:text-ink-muted sm:h-7 sm:text-sm"
        />

        {(value || parsed.tokens.length > 0) && (
          <button
            type="button"
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            aria-label={t("Effacer la recherche")}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-ink-muted hover:text-ink"
          >
            <X size={15} aria-hidden />
          </button>
        )}
      </div>

      {showSuggestions && suggestionField && FIELD_SUGGESTIONS[suggestionField as keyof typeof FIELD_SUGGESTIONS] && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-lg border border-hairline bg-surface shadow-xl">
          <div className="p-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted px-2 py-1">
              {FIELD_LABELS[suggestionField] ?? suggestionField}
            </div>
            <div className="flex flex-wrap gap-1 px-2 py-1">
              {FIELD_SUGGESTIONS[suggestionField as keyof typeof FIELD_SUGGESTIONS]!.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(suggestionField!, s)}
                  className="rounded-md bg-surface-raised px-2 py-1 text-xs text-ink-secondary hover:text-ink hover:bg-arcane/10 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
