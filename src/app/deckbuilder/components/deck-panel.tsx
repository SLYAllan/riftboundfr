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
import { useT } from "@/components/i18n-provider";
import { peutAfficherApercuCarte } from "../lib/preview-pointer";

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

/* Aperçu carte au survol d'une vignette : affiché en `fixed` à gauche du panneau,
   clampé verticalement pour ne jamais sortir de l'écran. */
const PREVIEW_W = 240;
const PREVIEW_H = 336; // portrait 5/7 ; les terrains (paysage) seront plus courts

interface PreviewState {
  entry: DeckEntry;
  top: number;
  left: number;
}

function computePreview(entry: DeckEntry, el: HTMLElement): PreviewState {
  const r = el.getBoundingClientRect();
  const top = Math.min(
    Math.max(r.top + r.height / 2 - PREVIEW_H / 2, 8),
    Math.max(window.innerHeight - PREVIEW_H - 8, 8),
  );
  const left = Math.max(r.left - PREVIEW_W - 12, 8);
  return { entry, top, left };
}

interface RowHoverProps {
  onHover: (entry: DeckEntry, el: HTMLElement) => void;
  onLeave: () => void;
}

function tileBtn(extra?: string) {
  return cn(
    "flex h-6 w-6 items-center justify-center rounded-md bg-canvas/85 text-ink-secondary shadow transition-colors",
    extra,
  );
}

function DeckCardTile({
  entry, section, onRemove, onQtyChange, onMove, showMove, onHover, onLeave,
}: {
  entry: DeckEntry; section: DeckSection;
  onRemove: () => void; onQtyChange?: (delta: number) => void;
  onMove?: () => void; showMove?: boolean;
} & RowHoverProps) {
  const t = useT();
  const isBattlefield = entry.type === "Battlefield";
  return (
    <div
      className="group relative"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("remove-card", `${section}|${entry.cardId}`);
        onLeave();
      }}
      onMouseEnter={(e) => onHover(entry, e.currentTarget)}
      onMouseLeave={onLeave}
    >
      {entry.imageUrl ? (
        <img
          src={entry.imageUrl}
          alt={entry.name}
          className={cn(
            "w-full rounded-lg aspect-[5/7]",
            isBattlefield ? "object-contain bg-surface-raised" : "object-cover",
          )}
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-[5/7] rounded-lg bg-surface-raised flex items-center justify-center text-[10px] text-ink-muted p-1 text-center leading-tight">
          {entry.name}
        </div>
      )}

      <span className="absolute -top-1.5 -right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-arcane text-[11px] font-bold text-canvas shadow-md">
        {entry.quantity}
      </span>

      {/* Ces actions doivent rester utilisables sur écran tactile, où le survol n'existe pas. */}
      <div className="absolute bottom-1 inset-x-1 z-20 flex justify-center gap-1">
        {onQtyChange && (
          <>
            <button onClick={() => onQtyChange(-1)} className={tileBtn("hover:text-ink hover:bg-canvas")} aria-label={t("Retirer une copie")}>
              <Minus size={13} />
            </button>
            <button onClick={() => onQtyChange(1)} className={tileBtn("hover:text-arcane hover:bg-canvas")} aria-label={t("Ajouter une copie")}>
              <Plus size={13} />
            </button>
          </>
        )}
        {showMove && onMove && (
          <button onClick={onMove} className={tileBtn("hover:text-gold hover:bg-canvas")} aria-label={t("Déplacer vers l’autre section")}>
            <ArrowRightLeft size={13} />
          </button>
        )}
        <button onClick={onRemove} className={tileBtn("hover:text-error hover:bg-canvas")} aria-label={t("Supprimer la carte")}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function LegendTile({ entry, onRemove, onHover, onLeave }: {
  entry: DeckEntry; onRemove: () => void;
} & RowHoverProps) {
  const t = useT();
  return (
    <div
      className="group relative"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("remove-card", `legend|${entry.cardId}`);
        onLeave();
      }}
      onMouseEnter={(e) => onHover(entry, e.currentTarget)}
      onMouseLeave={onLeave}
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
        className="absolute top-1.5 right-1.5 z-10 rounded-full bg-canvas/85 p-1.5 text-ink-muted shadow transition-colors hover:text-error"
        aria-label={t("Retirer la légende")}
      >
        <Trash2 size={13} />
      </button>
      <div className="mt-1 flex items-center justify-center gap-1.5">
        {entry.domains.map((d) => (
          <span key={d} className="text-[10px] font-semibold" style={{ color: DOMAIN_COLORS[d] }}>
            {DOMAIN_LABELS_FR[d] ?? d}
          </span>
        ))}
      </div>
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
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</p>
        </div>
        <span className={cn(
          "text-xs font-bold tabular-nums",
          isOver ? "text-error" : isFull ? "text-success" : "text-ink-muted"
        )}>
          {total}{target != null ? `/${target}` : ""}
        </span>
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </div>
  );
}

const EMPTY_HINT = <div className="px-2 py-1.5 text-xs italic text-ink-muted">Vide</div>;

export function DeckPanelV2({
  deck, onRemoveCard, onUpdateQuantity, onMoveCard, onApplyRunes, onSectionClick,
  legendDomains, isCompetitive,
}: DeckPanelV2Props) {
  const t = useT();
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const showPreview = (entry: DeckEntry, el: HTMLElement) => {
    if (!peutAfficherApercuCarte(
      window.matchMedia("(hover: hover)").matches,
      window.matchMedia("(pointer: fine)").matches,
    )) return;
    setPreview(computePreview(entry, el));
  };
  const hidePreview = () => setPreview(null);
  const hover: RowHoverProps = { onHover: showPreview, onLeave: hidePreview };

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

  const cardGrid = "grid grid-cols-3 gap-2 px-1";

  return (
    <div className="flex flex-col h-full overflow-y-auto thin-scrollbar" onScroll={hidePreview}>
      {/* Aperçu carte (hover card), hors flux */}
      {preview?.entry.imageUrl && (
        <img
          src={preview.entry.imageUrl}
          alt={preview.entry.name}
          className="pointer-events-none fixed z-[100] rounded-xl border border-hairline bg-canvas shadow-2xl"
          style={{ top: preview.top, left: preview.left, width: PREVIEW_W }}
        />
      )}

      {/* Stats - always at top */}
      <DeckStats mainDeck={deck.main} />

      {/* Header with counters */}
      <div className="px-3 pt-3 pb-2 border-b border-hairline">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Deck</h2>
          <div className="flex items-center gap-2 text-[10px] font-medium tabular-nums">
            <span className={cn(mainTotal >= 40 ? "text-success" : "text-ink-muted")}>{mainTotal}/40</span>
            <span className="text-ink-muted">&middot;</span>
            <span className={cn(runeTotal === 12 ? "text-success" : runeTotal > 12 ? "text-error" : "text-ink-muted")}>{runeTotal}/12</span>
            <span className="text-ink-muted">&middot;</span>
            <span className={cn(bfTotal === 3 ? "text-success" : bfTotal > 3 ? "text-error" : "text-ink-muted")}>{bfTotal}/3</span>
          </div>
        </div>
        {legendDomains.length > 0 && (
          <div className="mt-1 flex gap-1">
            {legendDomains.map((d) => (
              <span key={d} className="rounded-full bg-surface-raised px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ color: DOMAIN_COLORS[d] }}>
                {DOMAIN_LABELS_FR[d] ?? d}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Legend - first */}
      <CollapsibleSection label={t("Légende")} target={null} total={deck.legend ? 1 : 0}>
        {deck.legend ? (
          <div className={cardGrid}>
            <LegendTile entry={deck.legend} onRemove={() => onRemoveCard("legend", deck.legend!.cardId)} {...hover} />
          </div>
        ) : (
          <div className="px-2 py-1.5 text-xs italic text-ink-muted">{t("Cliquez sur une légende pour commencer")}</div>
        )}
      </CollapsibleSection>

      {/* Main Deck - card image grid */}
      <CollapsibleSection label="Deck Principal" target={40} total={mainTotal}>
        {sortedMain.length > 0 ? (
          <div className={cardGrid}>
            {sortedMain.map((entry) => (
              <DeckCardTile
                key={entry.cardId}
                entry={entry}
                section="main"
                onRemove={() => onRemoveCard("main", entry.cardId)}
                onQtyChange={(d) => onUpdateQuantity("main", entry.cardId, d)}
                onMove={() => onMoveCard("main", "side", entry.cardId)}
                showMove
                {...hover}
              />
            ))}
          </div>
        ) : EMPTY_HINT}
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
          <div className={cardGrid}>
            {sortedRune.map((entry) => (
              <DeckCardTile
                key={entry.cardId}
                entry={entry}
                section="rune"
                onRemove={() => onRemoveCard("rune", entry.cardId)}
                onQtyChange={(d) => onUpdateQuantity("rune", entry.cardId, d)}
                {...hover}
              />
            ))}
          </div>
        ) : EMPTY_HINT}
      </CollapsibleSection>

      {/* Battlefields */}
      <CollapsibleSection label={t("Champs de bataille")} target={3} total={bfTotal}>
        {deck.battlefield.length > 0 ? (
          <div className={cardGrid}>
            {deck.battlefield.map((entry) => (
              <DeckCardTile
                key={entry.cardId}
                entry={entry}
                section="battlefield"
                onRemove={() => onRemoveCard("battlefield", entry.cardId)}
                {...hover}
              />
            ))}
          </div>
        ) : EMPTY_HINT}
      </CollapsibleSection>

      {/* Reserve (sideboard) - card image grid */}
      <CollapsibleSection label={t("Réserve")} target={null} total={sideTotal} defaultOpen={sideTotal > 0}>
        {sortedSide.length > 0 ? (
          <div className={cardGrid}>
            {sortedSide.map((entry) => (
              <DeckCardTile
                key={entry.cardId}
                entry={entry}
                section="side"
                onRemove={() => onRemoveCard("side", entry.cardId)}
                onQtyChange={(d) => onUpdateQuantity("side", entry.cardId, d)}
                onMove={() => onMoveCard("side", "main", entry.cardId)}
                showMove
                {...hover}
              />
            ))}
          </div>
        ) : EMPTY_HINT}
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
