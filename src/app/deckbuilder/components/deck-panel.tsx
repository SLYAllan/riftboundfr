"use client";

import { Minus, Plus, Trash2, ArrowRightLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR } from "@/lib/domains";

import { DeckStats } from "./deck-stats";
import { RuneSuggestionPanel } from "./rune-suggestion";
import { DeckValidation } from "./deck-validation";
import { validateDeck } from "../lib/deck-rules";
import type { DeckState, DeckEntry } from "@/types";
import type { DeckSection } from "@/types";
import type { RuneSuggestion } from "../lib/rune-calculator";

interface DeckPanelV2Props {
  deck: DeckState;
  onRemoveCard: (section: DeckSection, cardId: string) => void;
  onUpdateQuantity: (section: DeckSection, cardId: string, delta: number) => void;
  onMoveCard: (fromSection: DeckSection, toSection: DeckSection, cardId: string) => void;
  onApplyRunes: (suggestions: RuneSuggestion[]) => void;
  onSectionClick: (section: string) => void;
  legendDomains: string[];
  isCompetitive: boolean;
}

function LegendCard({ entry, onRemove, label }: { entry: DeckEntry; onRemove: () => void; label: string }) {
  return (
    <div
      className="group relative"
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("remove-card", `legend|${entry.cardId}`); }}
    >
      {entry.imageUrl ? (
        <img src={entry.imageUrl} alt={entry.name} className="w-full rounded-lg object-cover" loading="lazy" />
      ) : (
        <div className="aspect-[5/7] w-full rounded-lg bg-surface-raised flex items-center justify-center text-sm text-ink-muted">
          {entry.name}
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 p-1 rounded-full bg-canvas/80 text-ink-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={12} />
      </button>
      <div className="mt-1 text-center text-[10px] text-ink-muted">{label}</div>
    </div>
  );
}

function DeckCardTile({
  entry, section, onRemove, onQtyChange, onMove, showMove,
}: {
  entry: DeckEntry; section: DeckSection;
  onRemove: () => void; onQtyChange: (delta: number) => void;
  onMove?: () => void; showMove: boolean;
}) {
  return (
    <div
      className="group relative"
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("remove-card", `${section}|${entry.cardId}`); }}
    >
      {entry.imageUrl ? (
        <img
          src={entry.imageUrl}
          alt={entry.name}
          className="w-full rounded aspect-[5/7] object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-[5/7] rounded bg-surface-raised flex items-center justify-center text-[7px] text-ink-muted p-0.5 text-center leading-tight">
          {entry.name}
        </div>
      )}

      {entry.quantity > 1 && (
        <span className="absolute -top-1 -right-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-arcane text-[9px] font-bold text-white shadow-sm">
          {entry.quantity}
        </span>
      )}

      <div className="absolute inset-0 z-20 flex items-center justify-center gap-0.5 rounded bg-canvas/70 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onQtyChange(-1); }} className="rounded-full bg-surface p-1 text-ink-muted hover:text-ink">
          <Minus size={10} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onQtyChange(1); }} className="rounded-full bg-surface p-1 text-ink-muted hover:text-arcane">
          <Plus size={10} />
        </button>
        {showMove && onMove && (
          <button onClick={(e) => { e.stopPropagation(); onMove(); }} className="rounded-full bg-surface p-1 text-ink-muted hover:text-gold">
            <ArrowRightLeft size={10} />
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="rounded-full bg-surface p-1 text-ink-muted hover:text-error">
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}

function BattlefieldTile({ entry, onRemove }: { entry: DeckEntry; onRemove: () => void }) {
  return (
    <div className="group relative" draggable onDragStart={(e) => { e.dataTransfer.setData("remove-card", `battlefield|${entry.cardId}`); }}>
      {entry.imageUrl ? (
        <img src={entry.imageUrl} alt={entry.name} className="w-full aspect-[5/7] rounded-md object-contain bg-surface-raised" loading="lazy" />
      ) : (
        <div className="aspect-[5/7] w-full rounded-md bg-surface-raised flex items-center justify-center text-[10px] text-ink-muted p-1 text-center">
          {entry.name}
        </div>
      )}
      <button
        onClick={onRemove}
        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-canvas/80 text-ink-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function CollapsibleSection({
  label, target, total, children, defaultOpen = true,
}: {
  label: string; target: number | null; total: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOver = target != null && total > target;
  const isFull = target != null && total === target;

  return (
    <div className="border-b border-hairline/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 hover:bg-surface-raised/30 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <ChevronDown size={13} className={cn("text-ink-muted transition-transform", !open && "-rotate-90")} />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</h4>
        </div>
        <span className={cn(
          "text-xs font-bold",
          isOver ? "text-error" : isFull ? "text-success" : "text-ink-muted"
        )}>
          {total}{target != null ? `/${target}` : ""}
        </span>
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </div>
  );
}

export function DeckPanelV2({
  deck, onRemoveCard, onUpdateQuantity, onMoveCard, onApplyRunes, onSectionClick,
  legendDomains, isCompetitive,
}: DeckPanelV2Props) {
  const mainTotal = deck.main.reduce((s, e) => s + e.quantity, 0);
  const runeTotal = deck.rune.reduce((s, e) => s + e.quantity, 0);
  const bfTotal = deck.battlefield.reduce((s, e) => s + e.quantity, 0);
  const sideTotal = deck.side.reduce((s, e) => s + e.quantity, 0);

  const sortedMain = [...deck.main].sort((a, b) => (a.energy ?? 99) - (b.energy ?? 99) || a.name.localeCompare(b.name));
  const sortedRune = [...deck.rune].sort((a, b) => a.name.localeCompare(b.name));
  const sortedSide = [...deck.side].sort((a, b) => (a.energy ?? 99) - (b.energy ?? 99) || a.name.localeCompare(b.name));

  const validationIssues = validateDeck(
    {
      legend: !!deck.legend,
      legendFirstName: deck.legend?.name.split(",")[0] ?? null,
      mainTotal,
      runeTotal,
      battlefieldTotal: bfTotal,
      sideTotal,
    },
    deck.main.map((e) => ({ ...e })),
    deck.rune.map((e) => ({ ...e })),
    deck.side.map((e) => ({ ...e })),
    legendDomains,
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto thin-scrollbar">
      {/* Stats - always at top */}
      <DeckStats mainDeck={deck.main} />

      {/* Header with counters */}
      <div className="px-3 pt-3 pb-2 border-b border-hairline">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Deck</h3>
          <div className="flex items-center gap-2 text-[10px] font-medium">
            <span className={cn(mainTotal >= 40 ? "text-success" : "text-ink-muted")}>{mainTotal}/40</span>
            <span className="text-ink-disabled">&middot;</span>
            <span className={cn(runeTotal === 12 ? "text-success" : runeTotal > 12 ? "text-error" : "text-ink-muted")}>{runeTotal}/12</span>
            <span className="text-ink-disabled">&middot;</span>
            <span className={cn(bfTotal === 3 ? "text-success" : bfTotal > 3 ? "text-error" : "text-ink-muted")}>{bfTotal}/3</span>
          </div>
        </div>
        {legendDomains.length > 0 && (
          <div className="mt-1 flex gap-1">
            {legendDomains.map((d) => (
              <span key={d} className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ color: DOMAIN_COLORS[d], backgroundColor: `${DOMAIN_COLORS[d]}15` }}>
                {DOMAIN_LABELS_FR[d] ?? d}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Legend - first */}
        <CollapsibleSection label="Légende" target={null} total={deck.legend ? 1 : 0}>
          {deck.legend ? (
            <div className="grid grid-cols-2 gap-2 px-1">
              <LegendCard entry={deck.legend} onRemove={() => onRemoveCard("legend", deck.legend!.cardId)} label="Légende" />
            </div>
          ) : (
            <div className="text-xs text-ink-disabled italic py-2 px-1">Cliquez sur une légende pour commencer</div>
          )}
        </CollapsibleSection>

        {/* Main Deck - card image grid */}
        <CollapsibleSection label="Deck Principal" target={40} total={mainTotal}>
          {sortedMain.length > 0 ? (
            <div className="grid grid-cols-5 xl:grid-cols-6 gap-1 px-1">
              {sortedMain.map((entry) => (
                <DeckCardTile
                  key={entry.cardId}
                  entry={entry}
                  section="main"
                  onRemove={() => onRemoveCard("main", entry.cardId)}
                  onQtyChange={(d) => onUpdateQuantity("main", entry.cardId, d)}
                  onMove={() => onMoveCard("main", "side", entry.cardId)}
                  showMove
                />
              ))}
            </div>
          ) : (
            <div className="text-xs text-ink-disabled italic py-2 px-1">Vide</div>
          )}
        </CollapsibleSection>

        {/* Rune Suggestion */}
        <RuneSuggestionPanel
          mainDeck={deck.main}
          legendDomains={legendDomains}
          currentRunes={deck.rune}
          onApply={onApplyRunes}
        />

        {/* Runes - card image grid */}
        <CollapsibleSection label="Runes" target={12} total={runeTotal}>
          {sortedRune.length > 0 ? (
            <div className="grid grid-cols-5 xl:grid-cols-6 gap-1 px-1">
              {sortedRune.map((entry) => (
                <DeckCardTile
                  key={entry.cardId}
                  entry={entry}
                  section="rune"
                  onRemove={() => onRemoveCard("rune", entry.cardId)}
                  onQtyChange={(d) => onUpdateQuantity("rune", entry.cardId, d)}
                  showMove={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-xs text-ink-disabled italic py-2 px-1">Vide</div>
          )}
        </CollapsibleSection>

        {/* Battlefields */}
        <CollapsibleSection label="Champs de bataille" target={3} total={bfTotal}>
          {deck.battlefield.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5 px-1">
              {deck.battlefield.map((entry) => (
                <BattlefieldTile key={entry.cardId} entry={entry} onRemove={() => onRemoveCard("battlefield", entry.cardId)} />
              ))}
            </div>
          ) : (
            <div className="text-xs text-ink-disabled italic py-2 px-1">Vide</div>
          )}
        </CollapsibleSection>

        {/* Reserve (sideboard) - card image grid */}
        <CollapsibleSection label="Réserve" target={null} total={sideTotal} defaultOpen={sideTotal > 0}>
          {sortedSide.length > 0 ? (
            <div className="grid grid-cols-5 xl:grid-cols-6 gap-1 px-1">
              {sortedSide.map((entry) => (
                <DeckCardTile
                  key={entry.cardId}
                  entry={entry}
                  section="side"
                  onRemove={() => onRemoveCard("side", entry.cardId)}
                  onQtyChange={(d) => onUpdateQuantity("side", entry.cardId, d)}
                  onMove={() => onMoveCard("side", "main", entry.cardId)}
                  showMove
                />
              ))}
            </div>
          ) : (
            <div className="text-xs text-ink-disabled italic py-2 px-1">Vide</div>
          )}
        </CollapsibleSection>

        {/* Validation */}
        <DeckValidation
          issues={validationIssues}
          isCompetitive={isCompetitive}
          onSectionClick={onSectionClick}
        />
    </div>
  );
}
