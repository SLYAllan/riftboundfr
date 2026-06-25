"use client";

import { useState, useCallback } from "react";
import { CardImage } from "@/components/card-image";
import { cn, displayLegendName } from "@/lib/utils";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR, DOMAIN_ICONS, TYPE_ICONS, TYPE_LABELS_FR, RARITY_LABELS_FR } from "@/lib/domains";
import { Grid3X3, List, Copy, Check, Image, Hash, Gamepad2, BarChart3, Hammer } from "lucide-react";
import { DeckSummary } from "@/components/deck-summary";
import { CardTextRenderer } from "@/components/card-text-renderer";
import { isBanned } from "@/lib/banned-cards";
import { generateDeckImage } from "@/lib/export-image";
import { entriesToDeckCode } from "@/lib/deck-code";
import { exportAsTTS } from "@/lib/export-formats";
import type { DecklistCard, DeckSection } from "@/types";
import Link from "next/link";

interface DecklistInteractiveProps {
  cards: DecklistCard[];
  deckName: string;
  legendName: string;
  playerName?: string;
  context?: string;
  showExportPng?: boolean;
  showCopyCode?: boolean;
  showSaveButton?: boolean;
  compact?: boolean;
  sourceArticleSlug?: string;
  deckbuilderCode?: string;
}

// Keyed by string (not DeckSection) so "champion" - produced by the text deck
// code parser - is rendered too; otherwise champion units silently disappear.
const sectionLabels: Record<string, string> = {
  legend: "Légende",
  champion: "Champion",
  main: "Deck Principal",
  rune: "Runes",
  battlefield: "Champs de bataille",
  side: "Réserve",
};

const sectionOrder: string[] = ["legend", "champion", "main", "rune", "battlefield", "side"];

// Un champion arrive soit en section "champion" (code deck d'article, en-tête
// « == Champion == »), soit en section "legend" avec un type non-Légende (deck en
// base de données). On l'identifie de la même façon partout pour un affichage
// cohérent : le champion s'affiche TOUJOURS dans la section « Champion ».
const isChampionCard = (c: DecklistCard): boolean =>
  (c.section as string) === "champion" || (c.section === "legend" && c.type !== "Legend");

const RARITY_COLORS: Record<string, string> = {
  Common: "bg-zinc-500/20 text-zinc-400",
  Uncommon: "bg-green-500/20 text-green-400",
  Rare: "bg-blue-500/20 text-blue-400",
  Epic: "bg-purple-500/20 text-purple-400",
  Showcase: "bg-gold/20 text-gold",
};

type ExportTab = "deckcode" | "tts" | "image";

function CardTooltip({ card }: { card: DecklistCard }) {
  return (
    <div className="pointer-events-none absolute z-[100] rounded-xl border border-hairline bg-surface shadow-2xl bottom-full left-1/2 -translate-x-1/2 mb-2" style={{ width: 240 }}>
      {card.artUrl && (
        <img
          src={card.artUrl}
          alt={card.name}
          className="w-full rounded-t-xl object-contain bg-canvas"
        />
      )}
      <div className="p-3 space-y-2">
        <h4 className="text-lg font-bold leading-tight" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {card.name}
        </h4>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs rounded bg-surface-raised px-1.5 py-0.5 text-ink-secondary">
            {TYPE_ICONS[card.type] && <img src={TYPE_ICONS[card.type]} alt="" className="h-3 w-3" />}
            {TYPE_LABELS_FR[card.type] ?? card.type}
          </span>
          <span className={cn("text-xs rounded px-1.5 py-0.5 font-semibold", RARITY_COLORS[card.rarity] ?? "bg-surface-raised text-ink-secondary")}>{RARITY_LABELS_FR[card.rarity] ?? card.rarity}</span>
          {isBanned(card.name) && <span className="text-[10px] rounded px-1.5 py-0.5 font-bold bg-red-500/20 text-red-400">Banni</span>}
          {card.domains?.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ color: DOMAIN_COLORS[d] ?? "#6b7280", backgroundColor: `${DOMAIN_COLORS[d] ?? "#6b7280"}20` }}>
              {DOMAIN_ICONS[d] && <img src={DOMAIN_ICONS[d]} alt="" className="h-3 w-3" />}
              {DOMAIN_LABELS_FR[d] ?? d}
            </span>
          ))}
        </div>
        <div className="flex gap-3 text-sm font-semibold">
          {card.energy != null && <span className="inline-flex items-center gap-1 text-yellow-400"><img src="/icons/SwordIconRB.webp" alt="" className="h-3.5 w-3.5" />{card.energy}</span>}
          {card.power != null && <span className="text-pink-400">{card.power} <span className="text-xs font-normal text-ink-muted">Pouvoir</span></span>}
          {card.might != null && <span className="inline-flex items-center gap-1 text-red-400"><img src="/icons/OverNumbered.webp" alt="" className="h-3.5 w-3.5" />{card.might}</span>}
        </div>
        {card.description && (
          <p className="text-xs text-ink-secondary leading-relaxed"><CardTextRenderer text={card.description} /></p>
        )}
      </div>
    </div>
  );
}

function MobileCardModal({ card, onClose }: { card: DecklistCard; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-xs rounded-xl border border-hairline bg-surface overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {card.artUrl && (
          <img src={card.artUrl} alt={card.name} className="w-full object-contain bg-canvas" />
        )}
        <div className="p-4 space-y-2.5">
          <h4 className="text-xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {card.name}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs rounded bg-surface-raised px-2 py-0.5 text-ink-secondary">
              {TYPE_ICONS[card.type] && <img src={TYPE_ICONS[card.type]} alt="" className="h-3.5 w-3.5" />}
              {TYPE_LABELS_FR[card.type] ?? card.type}
            </span>
            <span className={cn("text-xs rounded px-2 py-0.5 font-semibold", RARITY_COLORS[card.rarity] ?? "bg-surface-raised text-ink-secondary")}>{RARITY_LABELS_FR[card.rarity] ?? card.rarity}</span>
            {isBanned(card.name) && <span className="text-xs rounded px-2 py-0.5 font-bold bg-red-500/20 text-red-400">Banni</span>}
            {card.domains?.map((d) => (
              <span key={d} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ color: DOMAIN_COLORS[d] ?? "#6b7280", backgroundColor: `${DOMAIN_COLORS[d] ?? "#6b7280"}20` }}>
                {DOMAIN_ICONS[d] && <img src={DOMAIN_ICONS[d]} alt="" className="h-3.5 w-3.5" />}
                {DOMAIN_LABELS_FR[d] ?? d}
              </span>
            ))}
          </div>
          <div className="flex gap-3 text-base font-semibold">
            {card.energy != null && <span className="inline-flex items-center gap-1 text-yellow-400"><img src="/icons/SwordIconRB.webp" alt="" className="h-4 w-4" />{card.energy}</span>}
            {card.power != null && <span className="text-pink-400">{card.power} <span className="text-xs font-normal text-ink-muted">Pouvoir</span></span>}
            {card.might != null && <span className="inline-flex items-center gap-1 text-red-400"><img src="/icons/OverNumbered.webp" alt="" className="h-4 w-4" />{card.might}</span>}
          </div>
          {card.description && (
            <p className="text-sm text-ink-secondary leading-relaxed"><CardTextRenderer text={card.description} /></p>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full border-t border-hairline py-3 text-sm font-medium text-ink-secondary hover:text-ink"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

function ExportPanel({ cards, deckName, onClose }: { cards: DecklistCard[]; deckName: string; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<ExportTab>("deckcode");
  const [copied, setCopied] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const exportEntries = cards.map((c) => ({
    quantity: c.quantity,
    name: c.name,
    section: (isChampionCard(c) ? "champion" : c.section) as "legend" | "champion" | "main" | "rune" | "battlefield" | "side",
  }));

  const textCode = entriesToDeckCode(exportEntries);
  const ttsCards = cards.map((c) => ({
    cardId: c.cardId,
    name: c.name,
    quantity: c.quantity,
    section: c.section as "legend" | "main" | "rune" | "battlefield" | "side",
  }));
  const ttsCode = exportAsTTS(ttsCards);

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleExportImage() {
    setExporting(true);
    try {
      const legend = cards.find((c) => c.section === "legend" && c.type === "Legend");
      const champion = cards.find(isChampionCard);
      const main = cards.filter((c) => c.section === "main");
      const rune = cards.filter((c) => c.section === "rune");
      const battlefield = cards.filter((c) => c.section === "battlefield");
      const side = cards.filter((c) => c.section === "side");
      const legendDomains = legend?.domains ?? [];

      const toEntry = (c: DecklistCard) => ({
        cardId: c.cardId,
        name: c.name,
        imageUrl: c.artUrl,
        energy: c.energy,
        quantity: c.quantity,
      });

      const blob = await generateDeckImage({
        title: deckName,
        legend: legend ? toEntry(legend) : null,
        champion: champion ? toEntry(champion) : undefined,
        main: main.map(toEntry),
        rune: rune.map(toEntry),
        battlefield: battlefield.map(toEntry),
        side: side.map(toEntry),
        legendDomains,
      });

      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `${deckName.replace(/\s+/g, "-").toLowerCase()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // silent fail
    }
    setExporting(false);
  }

  const tabs: { key: ExportTab; label: string; icon: typeof Hash }[] = [
    { key: "deckcode", label: "Deck Code", icon: Hash },
    { key: "tts", label: "TTS", icon: Gamepad2 },
    { key: "image", label: "Image", icon: Image },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-card border border-hairline bg-surface" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            Exporter - {deckName}
          </h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink text-xl leading-none">&times;</button>
        </div>

        <div className="flex border-b border-hairline overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors relative whitespace-nowrap",
                activeTab === tab.key ? "text-arcane" : "text-ink-muted hover:text-ink",
              )}
            >
              <tab.icon size={13} />
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-arcane" />}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "deckcode" && (
            <div className="relative">
              <textarea readOnly value={textCode} rows={12} className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 text-sm font-mono text-ink" />
              <button
                onClick={() => copyToClipboard(textCode, "code")}
                className="absolute top-2 right-2 flex items-center gap-1 rounded bg-surface px-2 py-1 text-[10px] text-ink-secondary hover:text-ink"
              >
                {copied === "code" ? <Check size={11} /> : <Copy size={11} />}
                {copied === "code" ? "Copié !" : "Copier"}
              </button>
            </div>
          )}

          {activeTab === "tts" && (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted">Format Tabletop Simulator - collez dans TTS ou Pixelborn.</p>
              <div className="relative">
                <textarea readOnly value={ttsCode} rows={6} className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 text-sm font-mono text-ink break-all" />
                <button
                  onClick={() => copyToClipboard(ttsCode, "tts")}
                  className="absolute top-2 right-2 flex items-center gap-1 rounded bg-surface px-2 py-1 text-[10px] text-ink-secondary hover:text-ink"
                >
                  {copied === "tts" ? <Check size={11} /> : <Copy size={11} />}
                  {copied === "tts" ? "Copié !" : "Copier"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "image" && (
            <div className="text-center py-6">
              <p className="text-sm text-ink-secondary mb-4">Exportez votre deck en image PNG.</p>
              <button
                onClick={handleExportImage}
                disabled={exporting}
                className="rounded-lg bg-arcane px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all disabled:opacity-50"
              >
                <Image size={15} className="inline mr-1.5" />
                {exporting ? "Génération..." : "Générer l’image"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DecklistInteractive({
  cards,
  deckName,
  legendName,
  playerName,
  context,
  showExportPng = true,
  showCopyCode = true,
  compact = false,
  sourceArticleSlug,
  deckbuilderCode,
}: DecklistInteractiveProps) {
  const [view, setView] = useState<"grid" | "list" | "stats">("grid");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mobileCard, setMobileCard] = useState<DecklistCard | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);

  const grouped = cards.reduce(
    (acc, c) => {
      // Champion toujours regroupé sous « Champion », qu'il vienne en section
      // "champion" ou "legend" (non-Légende) → affichage cohérent partout.
      const s = isChampionCard(c) ? "champion" : (c.section || "main");
      if (!acc[s]) acc[s] = [];
      acc[s].push(c);
      return acc;
    },
    {} as Record<string, DecklistCard[]>
  );

  const totalCards = cards.reduce((sum, c) => sum + c.quantity, 0);

  const handleQuickCopy = useCallback(async () => {
    const exportEntries = cards.map((c) => ({
      quantity: c.quantity,
      name: c.name,
      section: (isChampionCard(c) ? "champion" : c.section) as "legend" | "champion" | "main" | "rune" | "battlefield" | "side",
    }));
    const textCode = entriesToDeckCode(exportEntries);
    await navigator.clipboard.writeText(textCode);
    setQuickCopied(true);
    setTimeout(() => setQuickCopied(false), 2000);
  }, [cards]);

  return (
    <div className="rounded-card border border-hairline bg-surface-raised/50">
      {!compact && (
        <div className="border-b border-hairline p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                {deckName}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-arcane">{displayLegendName(legendName)}</span>
                {playerName && <span className="text-ink-muted">par {playerName}</span>}
                {context && <span className="text-ink-secondary">&middot; {context}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setView("grid")}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  view === "grid" ? "bg-arcane/10 text-arcane" : "text-ink-muted hover:text-ink"
                )}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  view === "list" ? "bg-arcane/10 text-arcane" : "text-ink-muted hover:text-ink"
                )}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setView("stats")}
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  view === "stats" ? "bg-arcane/10 text-arcane" : "text-ink-muted hover:text-ink"
                )}
              >
                <BarChart3 size={16} />
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-ink-muted">{totalCards} cartes</div>
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-between border-b border-hairline px-4 py-2">
          <div className="text-xs text-ink-muted">{totalCards} cartes</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setView("grid")} className={cn("rounded p-1.5", view === "grid" ? "text-arcane" : "text-ink-muted")}>
              <Grid3X3 size={14} />
            </button>
            <button onClick={() => setView("list")} className={cn("rounded p-1.5", view === "list" ? "text-arcane" : "text-ink-muted")}>
              <List size={14} />
            </button>
            <button onClick={() => setView("stats")} className={cn("rounded p-1.5", view === "stats" ? "text-arcane" : "text-ink-muted")}>
              <BarChart3 size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        {view === "stats" ? (
          <DeckSummary cards={cards} />
        ) : view === "grid" ? (
          <div className="space-y-6">
            {sectionOrder.map((section) => {
              const sectionCards = grouped[section];
              if (!sectionCards?.length) return null;
              const total = sectionCards.reduce((sum, c) => sum + c.quantity, 0);
              return (
                <div key={section}>
                  <h4 className="text-sm font-semibold text-ink-secondary" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                    {sectionLabels[section]} <span className="text-ink-muted font-normal">({total})</span>
                  </h4>
                  <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                    {sectionCards.map((c) => {
                      const isBf = c.type === "Battlefield";
                      return (
                      <div
                        key={c.cardId + c.section}
                        className="group relative cursor-pointer"
                        onMouseEnter={() => setHoveredCard(c.cardId + c.section)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => {
                          if (window.innerWidth < 768) setMobileCard(c);
                        }}
                      >
                        {isBf && c.artUrl ? (
                          <img src={c.artUrl.includes("cmsassets.rgpub.io") ? `${c.artUrl}${c.artUrl.includes("?") ? "&" : "?"}w=400&q=75&auto=format` : c.artUrl} alt={c.name} loading="lazy" className="w-full aspect-[5/7] rounded-game-card object-contain bg-surface-raised" />
                        ) : (
                          <CardImage src={c.artUrl} alt={c.name} size="sm" />
                        )}
                        {c.quantity > 1 && (
                          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-arcane text-xs font-bold text-white">
                            {c.quantity}
                          </span>
                        )}
                        <div className="mt-1 truncate text-xs text-ink-secondary group-hover:text-arcane">
                          {c.name}
                        </div>
                        {isBanned(c.name) && <span className="mt-0.5 inline-block text-[9px] rounded px-1 py-px font-bold bg-red-500/20 text-red-400">Banni</span>}
                        {hoveredCard === c.cardId + c.section && (
                          <div className="hidden md:block">
                            <CardTooltip card={c} />
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {sectionOrder.map((section) => {
              const sectionCards = grouped[section];
              if (!sectionCards?.length) return null;
              return (
                <div key={section}>
                  <h4 className="text-sm font-semibold text-ink-secondary mb-2" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                    {sectionLabels[section]}
                  </h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-hairline text-xs text-ink-muted">
                        <th className="text-left py-1 pr-2">Nom</th>
                        <th className="text-left py-1 px-2">Type</th>
                        <th className="text-center py-1 px-2">Coût</th>
                        <th className="text-center py-1 px-2">Puissance</th>
                        <th className="text-center py-1 px-2">Qté</th>
                        <th className="text-left py-1 px-2">Domaines</th>
                        <th className="text-left py-1 pl-2">Rareté</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionCards.map((c) => {
                        const rarityClass = RARITY_COLORS[c.rarity] ?? "text-ink-secondary";
                        return (
                        <tr
                          key={c.cardId + c.section}
                          className="border-b border-hairline/50 hover:bg-surface-raised/50 cursor-pointer relative"
                          onClick={() => { if (window.innerWidth < 768) setMobileCard(c); }}
                          onMouseEnter={() => setHoveredCard(c.cardId + c.section)}
                          onMouseLeave={() => setHoveredCard(null)}
                        >
                          <td className="py-1.5 pr-2 font-medium">{c.name}{isBanned(c.name) && <span className="ml-1.5 text-[10px] rounded px-1 py-px font-bold bg-red-500/20 text-red-400">Banni</span>}</td>
                          <td className="py-1.5 px-2 text-ink-secondary">{TYPE_LABELS_FR[c.type] ?? c.type}</td>
                          <td className="py-1.5 px-2 text-center text-yellow-400 font-medium">{c.energy ?? "-"}</td>
                          <td className="py-1.5 px-2 text-center text-red-400 font-medium">{c.might ?? "-"}</td>
                          <td className="py-1.5 px-2 text-center font-semibold text-arcane">{c.quantity}</td>
                          <td className="py-1.5 px-2">
                            <div className="flex gap-1">
                              {c.domains?.map((d) => (
                                <span key={d} className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[d] ?? "#6b7280" }} title={DOMAIN_LABELS_FR[d] ?? d} />
                              ))}
                            </div>
                          </td>
                          <td className="py-1.5 pl-2">
                            <span className={cn("text-xs rounded px-1.5 py-0.5", rarityClass)}>{RARITY_LABELS_FR[c.rarity] ?? c.rarity}</span>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(showCopyCode || showExportPng || sourceArticleSlug || deckbuilderCode) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3">
          {showCopyCode && (
            <button
              onClick={handleQuickCopy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink transition-colors"
            >
              {quickCopied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              {quickCopied ? "Copié !" : "Copier le deck code"}
            </button>
          )}
          {(showExportPng || showCopyCode) && (
            <button
              onClick={() => setShowExport(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-arcane/10 px-3 py-1.5 text-xs font-medium text-arcane hover:bg-arcane/20 transition-colors"
            >
              <Image size={14} />
              Exporter
            </button>
          )}
          {deckbuilderCode && (
            <Link
              href={`/deckbuilder?deck=${deckbuilderCode}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet/10 px-3 py-1.5 text-xs font-medium text-violet hover:bg-violet/20 transition-colors"
            >
              <Hammer size={14} />
              Ouvrir dans le Deckbuilder
            </Link>
          )}
          {sourceArticleSlug && (
            <Link
              href={`/articles/${sourceArticleSlug}`}
              className="inline-flex items-center gap-1.5 text-xs text-arcane hover:underline ml-auto"
            >
              Voir l&apos;article associé
            </Link>
          )}
        </div>
      )}

      {mobileCard && <MobileCardModal card={mobileCard} onClose={() => setMobileCard(null)} />}
      {showExport && <ExportPanel cards={cards} deckName={deckName} onClose={() => setShowExport(false)} />}
    </div>
  );
}
