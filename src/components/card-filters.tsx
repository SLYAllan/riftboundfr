"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_TYPES, RARITIES } from "@/lib/utils";
import { DOMAIN_ICONS, DOMAIN_LABELS_FR, TYPE_ICONS, TYPE_LABELS_FR, RARITY_LABELS_FR } from "@/lib/domains";

const DOMAIN_ORDER = ["Fury", "Calm", "Order", "Chaos", "Mind", "Body"];

const SET_LABELS: Record<string, string> = {
  origins: "Origins",
  spiritforged: "Spiritforged",
  unleashed: "Unleashed",
  vendetta: "Vendetta",
  promo: "Promo",
};

const SORT_LABELS: Record<string, string> = {
  numero: "Numéro",
  nom: "Nom (A-Z)",
  "energie-asc": "Énergie croissante",
  "energie-desc": "Énergie décroissante",
};

// Pastille neutre : la couleur vient du logo, jamais d'un fond teinté sous un texte
// teinté. Actif = simple surlignage neutre (comme le filtre de sets de /decks).
function pill(active: boolean) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-ink/10 text-ink ring-1 ring-ink/25" : "bg-surface-raised text-ink-muted hover:text-ink",
  );
}

export function CardFilters({ total }: { total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function set(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/cartes?${params.toString()}`);
  }

  const get = (key: string) => searchParams.get(key) ?? "all";
  const domain = get("domain");
  const type = get("type");

  const selectClass =
    "h-9 rounded-lg border border-hairline-strong bg-surface pl-3 pr-8 text-sm text-ink focus:border-arcane focus:outline-none cursor-pointer appearance-none";

  const activeSummary = [
    domain !== "all" && (DOMAIN_LABELS_FR[domain] ?? domain),
    type !== "all" && (TYPE_LABELS_FR[type] ?? type),
    get("set") !== "all" && (SET_LABELS[get("set")] ?? get("set")),
    get("rarity") !== "all" && (RARITY_LABELS_FR[get("rarity")] ?? get("rarity")),
    searchParams.get("q") && `« ${searchParams.get("q")} »`,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-3">
      {/* Domaines — le logo de rune porte la couleur */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => set("domain", "all")} className={pill(domain === "all")}>
          Tous domaines
        </button>
        {DOMAIN_ORDER.map((d) => (
          <button key={d} onClick={() => set("domain", domain === d ? "all" : d)} className={pill(domain === d)}>
            {DOMAIN_ICONS[d] && <Image src={DOMAIN_ICONS[d]} alt="" width={16} height={16} className="h-4 w-4" />}
            {DOMAIN_LABELS_FR[d] ?? d}
          </button>
        ))}
      </div>

      {/* Types */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => set("type", "all")} className={pill(type === "all")}>
          Tous types
        </button>
        {CARD_TYPES.map((t) => (
          <button key={t} onClick={() => set("type", type === t ? "all" : t)} className={pill(type === t)}>
            {TYPE_ICONS[t] && <Image src={TYPE_ICONS[t]} alt="" width={16} height={16} className="h-4 w-4" />}
            {TYPE_LABELS_FR[t] ?? t}
          </button>
        ))}
      </div>

      {/* Set / Rareté / Tri */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" size={14} />
          <select aria-label="Filtrer par set" className={cn(selectClass, "pl-8")} value={get("set")} onChange={(e) => set("set", e.target.value)}>
            <option value="all">Tous les sets</option>
            {Object.entries(SET_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        <select aria-label="Filtrer par rareté" className={selectClass} value={get("rarity")} onChange={(e) => set("rarity", e.target.value)}>
          <option value="all">Toutes raretés</option>
          {RARITIES.map((r) => (
            <option key={r} value={r}>{RARITY_LABELS_FR[r] ?? r}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-ink-muted">Tri :</span>
          <select aria-label="Trier" className={selectClass} value={searchParams.get("sort") ?? "numero"} onChange={(e) => set("sort", e.target.value === "numero" ? "all" : e.target.value)}>
            {Object.entries(SORT_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm text-ink-muted">
        {total} carte{total !== 1 ? "s" : ""}
        {activeSummary.length > 0 && <span> &middot; {activeSummary.join(" · ")}</span>}
      </div>
    </div>
  );
}
