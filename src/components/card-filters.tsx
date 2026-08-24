"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLien, useT } from "@/components/i18n-provider";
import { ChevronDown } from "lucide-react";
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
  const lien = useLien();
  const t = useT();
  const searchParams = useSearchParams();

  function set(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(lien(`/cartes?${params.toString()}`));
  }

  function effacerTout() {
    router.push(lien("/cartes"));
  }

  const get = (key: string) => searchParams.get(key) ?? "all";
  const domain = get("domain");
  const type = get("type");

  const selectClass =
    "h-9 rounded-lg border border-hairline-strong bg-surface pl-3 pr-8 text-sm text-ink focus:border-arcane cursor-pointer appearance-none";

  const activeSummary = [
    domain !== "all" && t(DOMAIN_LABELS_FR[domain] ?? domain),
    type !== "all" && t(TYPE_LABELS_FR[type] ?? type),
    get("set") !== "all" && (SET_LABELS[get("set")] ?? get("set")),
    get("rarity") !== "all" && t(RARITY_LABELS_FR[get("rarity")] ?? get("rarity")),
    searchParams.get("q") && `« ${searchParams.get("q")} »`,
  ].filter(Boolean) as string[];

  const aFiltres = activeSummary.length > 0;

  // Rendu une fois, montré deux fois : repliable sur mobile (<details>), ouvert
  // en permanence sur desktop. Pas de state React : le toggle vient du <details>
  // natif, la bascule mobile/desktop de classes CSS.
  const contenuFiltres = (
    <div className="space-y-3">
      {/* Domaines — le logo de rune porte la couleur */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => set("domain", "all")} aria-pressed={domain === "all"} className={pill(domain === "all")}>{t("Tous domaines")}</button>
        {DOMAIN_ORDER.map((d) => (
          <button key={d} type="button" onClick={() => set("domain", domain === d ? "all" : d)} aria-pressed={domain === d} className={pill(domain === d)}>
            {DOMAIN_ICONS[d] && <Image src={DOMAIN_ICONS[d]} alt="" width={16} height={16} className="h-4 w-4" />}
            {t(DOMAIN_LABELS_FR[d] ?? d)}
          </button>
        ))}
      </div>

      {/* Types */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => set("type", "all")} aria-pressed={type === "all"} className={pill(type === "all")}>{t("Tous types")}</button>
        {CARD_TYPES.map((ty) => (
          <button key={ty} type="button" onClick={() => set("type", type === ty ? "all" : ty)} aria-pressed={type === ty} className={pill(type === ty)}>
            {TYPE_ICONS[ty] && <Image src={TYPE_ICONS[ty]} alt="" width={16} height={16} className="h-4 w-4" />}
            {t(TYPE_LABELS_FR[ty] ?? ty)}
          </button>
        ))}
      </div>

      {/* Set / Rareté / Tri */}
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label={t("Filtrer par set")} className={selectClass} value={get("set")} onChange={(e) => set("set", e.target.value)}>
          <option value="all">{t("Tous les sets")}</option>
          {Object.entries(SET_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{t(l)}</option>
          ))}
        </select>

        <select aria-label={t("Filtrer par rareté")} className={selectClass} value={get("rarity")} onChange={(e) => set("rarity", e.target.value)}>
          <option value="all">{t("Toutes raretés")}</option>
          {RARITIES.map((r) => (
            <option key={r} value={r}>{t(RARITY_LABELS_FR[r] ?? r)}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-ink-muted">{t("Tri :")}</span>
          <select aria-label={t("Trier")} className={selectClass} value={searchParams.get("sort") ?? "numero"} onChange={(e) => set("sort", e.target.value === "numero" ? "all" : e.target.value)}>
            {Object.entries(SORT_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{t(l)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Mobile : panneau repliable. Desktop : toujours ouvert. */}
      <details className="group sm:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
          <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
          {t("Filtres")}
        </summary>
        <div className="mt-3">{contenuFiltres}</div>
      </details>
      <div className="hidden sm:block">{contenuFiltres}</div>

      {/* Résumé des filtres actifs et remise à zéro */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
        <span>{total} {total !== 1 ? t("cartes") : t("carte")}</span>
        {aFiltres && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>{activeSummary.join(" · ")}</span>
            <button type="button" onClick={effacerTout} className="inline-flex min-h-11 items-center text-arcane hover:underline sm:min-h-6">
              {t("Tout effacer")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
