"use client";

import { useState, useMemo } from "react";
import { cn, displayLegendName } from "@/lib/utils";
import { CardImage } from "@/components/card-image";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR, TYPE_LABELS_FR } from "@/lib/domains";
import { ArrowLeftRight, Plus, Minus, Equal } from "lucide-react";
import type { DecklistCard } from "@/types";
import { useT } from "@/components/i18n-provider";

interface DeckData {
  code: string;
  legend: string;
  cards: DecklistCard[];
}

interface Props {
  initialA: DeckData | null;
  initialB: DeckData | null;
  invalidA: boolean;
  invalidB: boolean;
  codeAInitial: string;
  codeBInitial: string;
}

type ViewMode = "side-by-side" | "diff";

interface CardDiff {
  cardId: string;
  name: string;
  artUrl: string | null;
  type: string;
  energy: number | null | undefined;
  domains: string[] | undefined;
  section: string;
  qtyA: number;
  qtyB: number;
}

function buildDiff(a: DecklistCard[], b: DecklistCard[]): CardDiff[] {
  const map = new Map<string, CardDiff>();

  for (const c of a) {
    if (c.section === "legend") continue;
    const key = `${c.section}:${c.cardId}`;
    if (!map.has(key)) {
      map.set(key, { cardId: c.cardId, name: c.name, artUrl: c.artUrl, type: c.type, energy: c.energy, domains: c.domains, section: c.section, qtyA: 0, qtyB: 0 });
    }
    map.get(key)!.qtyA += c.quantity;
  }

  for (const c of b) {
    if (c.section === "legend") continue;
    const key = `${c.section}:${c.cardId}`;
    if (!map.has(key)) {
      map.set(key, { cardId: c.cardId, name: c.name, artUrl: c.artUrl, type: c.type, energy: c.energy, domains: c.domains, section: c.section, qtyA: 0, qtyB: 0 });
    }
    map.get(key)!.qtyB += c.quantity;
  }

  return [...map.values()].sort((a, b) => {
    const sectionOrder = ["main", "rune", "battlefield", "side"];
    const sa = sectionOrder.indexOf(a.section);
    const sb = sectionOrder.indexOf(b.section);
    if (sa !== sb) return sa - sb;
    return (a.energy ?? 99) - (b.energy ?? 99) || a.name.localeCompare(b.name);
  });
}

function StatBar({ label, valueA, valueB, color }: { label: string; valueA: number; valueB: number; color: string }) {
  const max = Math.max(valueA, valueB, 1);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 text-right font-mono text-arcane">{valueA}</span>
      <div className="flex-1 flex gap-0.5 h-4">
        <div className="flex-1 flex justify-end">
          <div className="h-full rounded-l" style={{ width: `${(valueA / max) * 100}%`, backgroundColor: color, opacity: 0.7 }} />
        </div>
        <div className="flex-1">
          <div className="h-full rounded-r" style={{ width: `${(valueB / max) * 100}%`, backgroundColor: color, opacity: 0.4 }} />
        </div>
      </div>
      <span className="w-10 font-mono text-violet-light">{valueB}</span>
      <span className="w-20 text-ink-muted truncate">{label}</span>
    </div>
  );
}

function DeckStats({ cards, label, color }: { cards: DecklistCard[]; label: string; color: string }) {
  const t = useT();
  const nonLegend = cards.filter((c) => c.section !== "legend");
  const total = nonLegend.reduce((s, c) => s + c.quantity, 0);
  const avgEnergy = nonLegend.filter((c) => c.energy != null && c.section === "main").reduce((s, c) => s + (c.energy ?? 0) * c.quantity, 0) / Math.max(1, nonLegend.filter((c) => c.energy != null && c.section === "main").reduce((s, c) => s + c.quantity, 0));

  const typeCounts: Record<string, number> = {};
  for (const c of nonLegend) {
    typeCounts[c.type] = (typeCounts[c.type] ?? 0) + c.quantity;
  }

  const domainCounts: Record<string, number> = {};
  for (const c of nonLegend) {
    for (const d of c.domains ?? []) {
      domainCounts[d] = (domainCounts[d] ?? 0) + c.quantity;
    }
  }

  return (
    <div className="space-y-2">
      <h4 className={cn("text-sm font-bold", color)}>{label}</h4>
      <div className="text-xs text-ink-secondary space-y-1">
        <div>{total} {t("cartes")} &middot; {t("Coût moyen")} : {avgEnergy.toFixed(1)}</div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
            <span key={type} className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px]">
              {TYPE_LABELS_FR[type] ?? type} {count}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).map(([domain, count]) => (
            <span key={domain} className="inline-flex items-center gap-1 rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: DOMAIN_COLORS[domain] }}>
              {DOMAIN_LABELS_FR[domain] ?? domain} {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const SECTION_LABELS: Record<string, string> = {
  main: "Deck Principal",
  rune: "Runes",
  battlefield: "Champs de bataille",
  side: "Réserve",
};

export function DeckCompare({ initialA, initialB, invalidA, invalidB, codeAInitial, codeBInitial }: Props) {
  const t = useT();
  const [codeA, setCodeA] = useState(codeAInitial);
  const [codeB, setCodeB] = useState(codeBInitial);
  const [deckA] = useState<DeckData | null>(initialA);
  const [deckB] = useState<DeckData | null>(initialB);
  const [view, setView] = useState<ViewMode>("diff");

  const diff = useMemo(() => {
    if (!deckA || !deckB) return [];
    return buildDiff(deckA.cards, deckB.cards);
  }, [deckA, deckB]);

  const stats = useMemo(() => {
    if (!diff.length) return { shared: 0, onlyA: 0, onlyB: 0, changed: 0 };
    let shared = 0, onlyA = 0, onlyB = 0, changed = 0;
    for (const d of diff) {
      if (d.qtyA === d.qtyB) shared++;
      else if (d.qtyA === 0) onlyB++;
      else if (d.qtyB === 0) onlyA++;
      else changed++;
    }
    return { shared, onlyA, onlyB, changed };
  }, [diff]);

  const energyCurveA = useMemo(() => {
    if (!deckA) return new Map<number, number>();
    const m = new Map<number, number>();
    for (const c of deckA.cards.filter((c) => c.section === "main" && c.energy != null)) {
      const e = Math.min(c.energy!, 8);
      m.set(e, (m.get(e) ?? 0) + c.quantity);
    }
    return m;
  }, [deckA]);

  const energyCurveB = useMemo(() => {
    if (!deckB) return new Map<number, number>();
    const m = new Map<number, number>();
    for (const c of deckB.cards.filter((c) => c.section === "main" && c.energy != null)) {
      const e = Math.min(c.energy!, 8);
      m.set(e, (m.get(e) ?? 0) + c.quantity);
    }
    return m;
  }, [deckB]);

  function handleCompare() {
    const url = new URL(window.location.href);
    url.searchParams.set("a", codeA.trim());
    url.searchParams.set("b", codeB.trim());
    window.location.href = url.toString();
  }

  const hasBoth = deckA && deckB;

  return (
    <div className="mt-6 space-y-6">
      {/* Input */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <div>
          <label htmlFor="deck-code-a" className="block text-xs text-ink-muted mb-1">Deck A</label>
          <input
            id="deck-code-a"
            value={codeA}
            onChange={(e) => setCodeA(e.target.value)}
            placeholder={t("Collez le code du premier deck")}
            className="w-full rounded-lg bg-surface border border-hairline px-3 py-2 text-sm text-ink placeholder:text-ink-muted"
          />
          {deckA && <div className="mt-1 text-xs text-arcane">{displayLegendName(deckA.legend)}</div>}
          {invalidA && <p role="alert" className="mt-1 text-xs text-red-400">{t("Code du deck A invalide")}</p>}
        </div>
        {/* order-last : en une colonne le bouton tombait entre les deux champs */}
        <button disabled={!codeA.trim() || !codeB.trim()} onClick={handleCompare} className="order-last sm:order-none rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas transition-colors hover:bg-arcane-light disabled:cursor-not-allowed disabled:opacity-50">
          <ArrowLeftRight size={16} className="inline mr-1" />
          {t("Comparer")}
        </button>
        <div>
          <label htmlFor="deck-code-b" className="block text-xs text-ink-muted mb-1">Deck B</label>
          <input
            id="deck-code-b"
            value={codeB}
            onChange={(e) => setCodeB(e.target.value)}
            placeholder={t("Collez le code du second deck")}
            className="w-full rounded-lg bg-surface border border-hairline px-3 py-2 text-sm text-ink placeholder:text-ink-muted"
          />
          {deckB && <div className="mt-1 text-xs text-violet-light">{displayLegendName(deckB.legend)}</div>}
          {invalidB && <p role="alert" className="mt-1 text-xs text-red-400">{t("Code du deck B invalide")}</p>}
        </div>
      </div>

      {!hasBoth && (
        <div className="rounded-xl border border-hairline bg-surface p-12 text-center text-ink-muted">{t("Collez deux codes de decks et cliquez sur Comparer pour voir les différences.")}</div>
      )}

      {hasBoth && (
        <>
          {/* Summary badges */}
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <Equal size={12} /> {stats.shared} {t("communes")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-arcane/10 px-3 py-1 text-xs font-semibold text-arcane">
              <Plus size={12} /> {stats.onlyA} {t("uniques A")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet/10 px-3 py-1 text-xs font-semibold text-violet-light">
              <Plus size={12} /> {stats.onlyB} {t("uniques B")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              <ArrowLeftRight size={12} /> {stats.changed} {t("quantités diff.")}
            </span>
          </div>

          {/* View toggle */}
          <div className="flex gap-2">
            <button onClick={() => setView("diff")} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors", view === "diff" ? "bg-arcane text-canvas" : "bg-surface text-ink-muted hover:text-ink")}>
              {t("Vue diff")}
            </button>
            <button onClick={() => setView("side-by-side")} className={cn("rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors", view === "side-by-side" ? "bg-arcane text-canvas" : "bg-surface text-ink-muted hover:text-ink")}>{t("Côte à côte")}</button>
          </div>

          {/* Energy curve comparison */}
          <div className="rounded-xl border border-hairline bg-surface p-4">
            <h3 className="text-sm font-bold text-ink mb-3">{t("Courbe d’énergie")}</h3>
            <div className="space-y-1">
              {Array.from({ length: 9 }, (_, i) => i).map((cost) => (
                <StatBar
                  key={cost}
                  label={cost === 8 ? "8+" : `${cost}`}
                  valueA={energyCurveA.get(cost) ?? 0}
                  valueB={energyCurveB.get(cost) ?? 0}
                  color="#8b5cf6"
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-ink-muted">
              <span className="text-arcane font-semibold">Deck A</span>
              <span className="text-violet-light font-semibold">Deck B</span>
            </div>
          </div>

          {/* Stats comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-hairline bg-surface p-4">
              <DeckStats cards={deckA.cards} label={`A - ${displayLegendName(deckA.legend)}`} color="text-arcane" />
            </div>
            <div className="rounded-xl border border-hairline bg-surface p-4">
              <DeckStats cards={deckB.cards} label={`B - ${displayLegendName(deckB.legend)}`} color="text-violet-light" />
            </div>
          </div>

          {/* Diff view */}
          {view === "diff" && (
            <div className="rounded-xl border border-hairline overflow-hidden">
              {["main", "rune", "battlefield", "side"].map((section) => {
                const sectionDiff = diff.filter((d) => d.section === section);
                if (sectionDiff.length === 0) return null;
                return (
                  <div key={section}>
                    <div className="bg-surface-raised px-4 py-2 text-xs font-bold text-ink-secondary border-b border-hairline">
                      {t(SECTION_LABELS[section])}
                    </div>
                    <div className="divide-y divide-hairline/50">
                      {sectionDiff.map((d) => {
                        const isOnlyA = d.qtyB === 0;
                        const isOnlyB = d.qtyA === 0;
                        const isSame = d.qtyA === d.qtyB;
                        const isDiff = !isOnlyA && !isOnlyB && !isSame;
                        return (
                          <div
                            key={d.cardId + d.section}
                            className={cn(
                              "flex items-center gap-3 px-4 py-1.5 text-sm",
                              isOnlyA && "bg-arcane/5",
                              isOnlyB && "bg-violet/5",
                              isDiff && "bg-amber-500/5",
                            )}
                          >
                            <div className="w-8 h-8 shrink-0 rounded overflow-hidden">
                              {d.artUrl ? (
                                <img src={d.artUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-surface-raised" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 truncate text-ink">{d.name}</div>
                            <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                              <span className={cn("w-6 text-center rounded py-0.5", d.qtyA > 0 ? "bg-arcane/10 text-arcane font-bold" : "text-ink-muted")}>
                                {d.qtyA || "-"}
                              </span>
                              {isSame ? (
                                <Equal size={10} className="text-emerald-400" />
                              ) : d.qtyA > d.qtyB ? (
                                <Minus size={10} className="text-red-400" />
                              ) : (
                                <Plus size={10} className="text-emerald-400" />
                              )}
                              <span className={cn("w-6 text-center rounded py-0.5", d.qtyB > 0 ? "bg-violet/10 text-violet-light font-bold" : "text-ink-muted")}>
                                {d.qtyB || "-"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Side by side view */}
          {view === "side-by-side" && (
            <div className="grid grid-cols-2 gap-4">
              {[deckA, deckB].map((deck, idx) => (
                <div key={idx} className="rounded-xl border border-hairline bg-surface overflow-hidden">
                  <div className={cn("px-4 py-2 text-sm font-bold border-b border-hairline", idx === 0 ? "text-arcane" : "text-violet-light")}>
                    {displayLegendName(deck.legend)}
                  </div>
                  <div className="p-3 space-y-4">
                    {["legend", "main", "rune", "battlefield", "side"].map((section) => {
                      const sectionCards = deck.cards.filter((c) => c.section === section);
                      if (!sectionCards.length) return null;
                      const otherCards = (idx === 0 ? deckB : deckA).cards;
                      return (
                        <div key={section}>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">
                            {t(SECTION_LABELS[section] ?? "Légende")}
                          </h4>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                            {sectionCards.map((c) => {
                              const inOther = otherCards.some((o) => o.cardId === c.cardId && o.section === c.section);
                              return (
                                <div key={c.cardId} className="relative">
                                  <div className={cn("rounded-lg overflow-hidden", !inOther && section !== "legend" && "ring-2", !inOther && idx === 0 && section !== "legend" && "ring-arcane", !inOther && idx === 1 && section !== "legend" && "ring-violet")}>
                                    <CardImage src={c.artUrl} alt={c.name} size="sm" />
                                  </div>
                                  {c.quantity > 1 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-arcane text-[9px] font-bold text-canvas">
                                      {c.quantity}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
