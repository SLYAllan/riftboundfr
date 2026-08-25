"use client";

import { useState, useMemo, useCallback } from "react";
import { RotateCcw, Plus, SlidersHorizontal, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR } from "@/lib/domains";
import { CardDetailModal } from "./card-detail-modal";
import { SearchBar } from "./search-bar";
import { parseSearchQuery, getSetCodesFromAlias, type ParsedSearch } from "../lib/search-parser";
import type { CardData, BuilderTab } from "@/types";
import { useT } from "@/components/i18n-provider";

interface CardBrowserProps {
  cards: CardData[];
  onAddCard: (card: CardData, toSide?: boolean) => void;
  deckCardCounts: Map<string, number>;
  legendDomains: string[];
  hasLegend: boolean;
  activeTab: BuilderTab;
  legendFirstName: string | null;
}

const DOMAIN_ORDER = ["Fury", "Calm", "Order", "Chaos", "Mind", "Body"];

const SORT_OPTIONS = [
  { value: "energy", label: "Énergie" },
  { value: "power", label: "Pouvoir" },
  { value: "name", label: "Nom" },
  { value: "rarity", label: "Rareté" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const RARITY_ORDER: Record<string, number> = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legendary: 4 };

function RangeSlider({
  label, min, max, valueLow, valueHigh, onChange,
}: {
  label: string; min: number; max: number; valueLow: number; valueHigh: number;
  onChange: (low: number, high: number) => void;
}) {
  const pctLow = ((valueLow - min) / (max - min)) * 100;
  const pctHigh = ((valueHigh - min) / (max - min)) * 100;
  const isDefault = valueLow === min && valueHigh === max;

  return (
    <div className="flex-1 min-w-[100px]">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{label}</span>
        <span className="text-[10px] text-ink-muted">{isDefault ? "Tous" : `${valueLow}-${valueHigh}${valueHigh === max ? "+" : ""}`}</span>
      </div>
      <div className="relative h-4 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-surface-raised" />
        <div className="absolute h-1 rounded-full bg-gold" style={{ left: `${pctLow}%`, right: `${100 - pctHigh}%` }} />
        <input type="range" min={min} max={max} value={valueLow}
          onChange={(e) => onChange(Math.min(Number(e.target.value), valueHigh), valueHigh)}
          aria-label={`${label} minimum`}
          className="absolute inset-x-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-canvas [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6"
        />
        <input type="range" min={min} max={max} value={valueHigh}
          onChange={(e) => onChange(valueLow, Math.max(Number(e.target.value), valueLow))}
          aria-label={`${label} maximum`}
          className="absolute inset-x-0 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-canvas [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6"
        />
      </div>
    </div>
  );
}

function CardTile({
  card, inDeck, maxQty, onAddMain, onAddSide, onDetail, activeTab,
}: {
  card: CardData; inDeck: number; maxQty: number;
  onAddMain: () => void; onAddSide: () => void; onDetail: () => void;
  activeTab: BuilderTab;
}) {
  const t = useT();
  const atMax = inDeck >= maxQty;
  const isSingleSlot = card.type === "Legend" || card.type === "Battlefield";
  const addLabel = card.type === "Legend" ? "Légende"
    : card.type === "Rune" ? "Ajouter"
    : card.type === "Battlefield" ? "Ajouter"
    : "Deck";
  const isBattlefield = card.type === "Battlefield";
  const showSideButton = activeTab === "main" && !isSingleSlot && !atMax;

  return (
    <div className="group relative">
      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt={card.name}
          onClick={onAddMain}
          className={cn(
            "w-full rounded-lg cursor-pointer transition-colors duration-150",
            isBattlefield ? "aspect-[5/7] object-contain bg-surface-raised" : "aspect-[5/7] object-cover",
            atMax ? "brightness-50 saturate-50" : inDeck > 0 ? "ring-2 ring-arcane brightness-95" : "group-hover:brightness-110",
          )}
          loading="lazy"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("card-id", card.id);
            e.dataTransfer.setData("source", "browser");
          }}
        />
      ) : (
        <div
          onClick={onAddMain}
          className="w-full aspect-[5/7] rounded-lg bg-surface-raised flex items-center justify-center text-xs text-ink-muted p-2 text-center cursor-pointer"
        >
          {card.name}
        </div>
      )}

      {inDeck > 0 && (
        <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-arcane text-[10px] font-bold text-canvas shadow-md">
          {inDeck}
        </span>
      )}

      <div className={cn(
        "absolute bottom-1 inset-x-1 z-20 flex gap-1 transition-colors duration-150",
        "opacity-0 translate-y-1 pointer-events-none",
        "group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto",
        "group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto",
        "[@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:pointer-events-auto",
      )}>
        {!atMax && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddMain(); }}
            className="flex-1 rounded-md bg-arcane/90 py-1.5 text-xs font-semibold text-canvas hover:bg-arcane transition-colors flex items-center justify-center gap-1 shadow-lg"
          >
            <Plus size={12} /> {addLabel}
          </button>
        )}
        {showSideButton && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddSide(); }}
            className="rounded-md bg-gold/90 px-2 py-1.5 text-xs font-semibold text-canvas hover:bg-gold transition-colors shadow-lg"
          >
            Side
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDetail(); }}
          aria-label={t("Voir le détail de la carte")}
          className="rounded-md bg-surface/90 backdrop-blur-sm px-2 py-1.5 text-xs text-ink hover:bg-surface transition-colors shadow-lg border border-hairline"
        >
          <Eye size={13} />
        </button>
      </div>

      <div className="mt-1 truncate text-xs text-ink-secondary leading-tight px-0.5">
        {card.name}
      </div>
    </div>
  );
}

export function CardBrowserV2({ cards, onAddCard, deckCardCounts, legendDomains, hasLegend, activeTab, legendFirstName }: CardBrowserProps) {
  const t = useT();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [energyLow, setEnergyLow] = useState(0);
  // Plafonds tirés des cartes, jamais écrits en dur : le curseur Puissance
  // s'arrêtait à 10 alors que la base monte à 12, donc Baron Nashor et Master
  // Yi, Unstoppable étaient introuvables dans le deckbuilder.
  const capE = useMemo(() => Math.max(1, ...cards.map((c) => c.energy ?? 0)), [cards]);
  const capP = useMemo(() => Math.max(1, ...cards.map((c) => c.power ?? 0)), [cards]);
  const capM = useMemo(() => Math.max(1, ...cards.map((c) => c.might ?? 0)), [cards]);
  const [energyHigh, setEnergyHigh] = useState(capE);
  const [powerLow, setPowerLow] = useState(0);
  const [powerHigh, setPowerHigh] = useState(capP);
  const [mightLow, setMightLow] = useState(0);
  const [mightHigh, setMightHigh] = useState(capM);
  const [showSliders, setShowSliders] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("energy");
  const [detailCard, setDetailCard] = useState<CardData | null>(null);

  const parsed = useMemo(() => parseSearchQuery(searchQuery), [searchQuery]);

  const tabCards = useMemo(() => {
    return cards.filter((c) => {
      if (activeTab === "legend") return c.type === "Legend";
      if (activeTab === "main") return c.type === "Unit" || c.type === "Spell" || c.type === "Gear";
      if (activeTab === "rune") return c.type === "Rune";
      if (activeTab === "battlefield") return c.type === "Battlefield";
      return true;
    });
  }, [cards, activeTab]);

  const toggleDomain = useCallback((d: string) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    const freeText = parsed.freeText.toLowerCase();
    const seenRuneNames = new Set<string>();

    const result = tabCards.filter((c) => {
      if (freeText && !c.name.toLowerCase().includes(freeText) && !c.textPlain?.toLowerCase().includes(freeText)) return false;

      for (const token of parsed.tokens) {
        switch (token.type) {
          case "type":
            if (c.type.toLowerCase() !== token.value) return false;
            break;
          case "domain":
            if (!c.domains.some((d) => d.toLowerCase() === token.value) && c.domains.length > 0) return false;
            break;
          case "set": {
            const setCodes = getSetCodesFromAlias(token.value);
            if (!setCodes.includes(c.set)) return false;
            break;
          }
          case "energy":
            if (c.energy == null) break;
            if (token.rangeMin != null && c.energy < token.rangeMin) return false;
            if (token.rangeMax != null && c.energy > token.rangeMax) return false;
            break;
          case "power":
            if (c.power == null) break;
            if (token.rangeMin != null && c.power < token.rangeMin) return false;
            if (token.rangeMax != null && c.power > token.rangeMax) return false;
            break;
          case "might":
            if (c.might == null) break;
            if (token.rangeMin != null && c.might < token.rangeMin) return false;
            if (token.rangeMax != null && c.might > token.rangeMax) return false;
            break;
          case "rarity":
            if (c.rarity.toLowerCase() !== token.value) return false;
            break;
          case "tag":
            if (!c.tags.some((t) => t.toLowerCase().includes(token.value))) return false;
            break;
        }
      }

      if (selectedDomains.size > 0 && !c.domains.some((d) => selectedDomains.has(d)) && c.domains.length > 0) return false;

      if (activeTab !== "legend") {
        if (c.energy != null && (c.energy < energyLow || c.energy > energyHigh)) return false;
        if (c.power != null && (c.power < powerLow || c.power > powerHigh)) return false;
        if (c.might != null && (c.might < mightLow || c.might > mightHigh)) return false;
      }

      if (c.supertype === "Signature") {
        if (!legendFirstName || !c.tags.some((t) => t.toLowerCase() === legendFirstName.toLowerCase())) return false;
      }

      if (hasLegend && legendDomains.length > 0 && (activeTab === "main" || activeTab === "rune")) {
        const hasDomainMatch = c.domains.length === 0 || c.domains.some((d) => legendDomains.includes(d));
        if (!hasDomainMatch) return false;
      }

      if (c.type === "Rune") {
        const key = c.name.toLowerCase();
        if (seenRuneNames.has(key)) return false;
        seenRuneNames.add(key);
      }

      return true;
    });

    result.sort((a, b) => {
      if (activeTab === "legend") {
        const aL = a.type === "Legend" ? 0 : 1;
        const bL = b.type === "Legend" ? 0 : 1;
        if (aL !== bL) return aL - bL;
      }
      if (sortBy === "energy") return (a.energy ?? 0) - (b.energy ?? 0) || a.name.localeCompare(b.name);
      if (sortBy === "power") return (b.power ?? 0) - (a.power ?? 0) || a.name.localeCompare(b.name);
      if (sortBy === "rarity") return (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [tabCards, parsed, selectedDomains, activeTab, sortBy, energyLow, energyHigh, powerLow, powerHigh, mightLow, mightHigh, hasLegend, legendDomains, legendFirstName]);

  const hasFilters =
    selectedDomains.size > 0 || searchQuery.trim() !== "" ||
    energyLow > 0 || energyHigh < capE || powerLow > 0 || powerHigh < capP || mightLow > 0 || mightHigh < capM;

  function resetFilters() {
    setSearchQuery(""); setSelectedDomains(new Set());
    setEnergyLow(0); setEnergyHigh(capE);
    setPowerLow(0); setPowerHigh(capP); setMightLow(0); setMightHigh(capM);
  }

  const selectClass = "h-8 rounded-lg border border-hairline-strong bg-surface px-2.5 text-xs text-ink focus:border-arcane cursor-pointer";
  const showSliderToggle = activeTab === "main" || activeTab === "rune";

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 space-y-2.5 p-3 border-b border-hairline">
        <SearchBar value={searchQuery} onChange={setSearchQuery} parsed={parsed} />

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex flex-wrap items-center gap-1.5">
            {DOMAIN_ORDER.map((d) => {
              const active = selectedDomains.has(d);
              const color = DOMAIN_COLORS[d] ?? "#6b7280";
              const isLegendDomain = legendDomains.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDomain(d)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wide transition-colors",
                    active
                      ? "border-current shadow-sm"
                      : isLegendDomain
                        ? "border-transparent opacity-70 hover:opacity-100 ring-1 ring-gold/30"
                        : "border-transparent opacity-35 hover:opacity-70",
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

          <div className="h-5 w-px bg-hairline" />

          <select aria-label={t("Trier les cartes")} className={selectClass} value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {showSliderToggle && (
            <button
              onClick={() => setShowSliders(!showSliders)}
              aria-label={t("Filtres")}
              aria-expanded={showSliders}
              className={cn("rounded-lg p-1.5 border transition-colors", showSliders ? "border-gold text-gold" : "border-hairline text-ink-muted hover:text-ink")}
            >
              <SlidersHorizontal size={14} />
            </button>
          )}

          {hasFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink">
              <RotateCcw size={12} /> {t("Réinit.")}
            </button>
          )}
        </div>

        {showSliders && showSliderToggle && (
          <div className="flex gap-4">
            <RangeSlider label={t("Énergie")} min={0} max={capE} valueLow={energyLow} valueHigh={energyHigh} onChange={(l, h) => { setEnergyLow(l); setEnergyHigh(h); }} />
            <RangeSlider label="Pouvoir" min={0} max={capP} valueLow={powerLow} valueHigh={powerHigh} onChange={(l, h) => { setPowerLow(l); setPowerHigh(h); }} />
            <RangeSlider label="Puissance" min={0} max={capM} valueLow={mightLow} valueHigh={mightHigh} onChange={(l, h) => { setMightLow(l); setMightHigh(h); }} />
          </div>
        )}

        <div className="text-xs text-ink-muted">
          <span className="text-arcane font-semibold">{filtered.length}</span> carte{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scrollbar p-3">
        {activeTab === "legend" && !hasLegend && !searchQuery && selectedDomains.size === 0 && (
          <div className="mb-3 rounded-lg bg-gold/5 border border-gold/20 p-2.5 text-center text-sm text-gold">
            {t("Choisissez une Légende pour commencer votre deck")}
          </div>
        )}

        {activeTab !== "legend" && !hasLegend && (
          <div className="mb-3 rounded-lg bg-gold/5 border border-gold/20 p-2.5 text-center text-sm text-gold">
            {t("Sélectionnez d’abord une Légende dans l’onglet Légende")}
          </div>
        )}

        <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
          {filtered.slice(0, 120).map((card) => (
            <CardTile
              key={card.id}
              card={card}
              inDeck={deckCardCounts.get(card.id) ?? 0}
              maxQty={card.type === "Legend" || card.type === "Battlefield" ? 1 : card.type === "Rune" ? 12 : 3}
              onAddMain={() => onAddCard(card, false)}
              onAddSide={() => onAddCard(card, true)}
              onDetail={() => setDetailCard(card)}
              activeTab={activeTab}
            />
          ))}
        </div>
        {filtered.length > 120 && (
          <p className="mt-3 text-center text-xs text-ink-muted">
            120 {t("cartes")} · {t("Affiner les résultats")}
          </p>
        )}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-ink-muted">{t("Aucune carte ne correspond à votre recherche. Modifiez vos filtres.")}</div>
        )}
      </div>

      {detailCard && <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} />}
    </div>
  );
}
