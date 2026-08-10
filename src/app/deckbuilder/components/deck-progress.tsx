"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { SIDE_SIZE } from "../lib/deck-rules";

export type ProgressStep = "legend" | "champion" | "main" | "rune" | "battlefield" | "side";

interface StepConfig {
  key: ProgressStep;
  label: string;
  current: number;
  target: number;
  filterTab: "legend" | "main" | "rune" | "battlefield";
}

interface DeckProgressProps {
  legendCount: number;
  championCount: number;
  mainTotal: number;
  runeTotal: number;
  battlefieldTotal: number;
  sideTotal: number;
  activeStep: string;
  onStepClick: (tab: "legend" | "main" | "rune" | "battlefield") => void;
}

export function DeckProgress({
  legendCount, championCount, mainTotal, runeTotal, battlefieldTotal, sideTotal,
  activeStep, onStepClick,
}: DeckProgressProps) {
  const steps: StepConfig[] = [
    { key: "legend", label: "Légende", current: legendCount, target: 1, filterTab: "legend" },
    { key: "champion", label: "Champion", current: championCount, target: 1, filterTab: "legend" },
    { key: "main", label: "Deck", current: mainTotal, target: 40, filterTab: "main" },
    { key: "rune", label: "Runes", current: runeTotal, target: 12, filterTab: "rune" },
    { key: "battlefield", label: "Champs", current: battlefieldTotal, target: 3, filterTab: "battlefield" },
    { key: "side", label: "Réserve", current: sideTotal, target: SIDE_SIZE, filterTab: "main" },
  ];

  const allComplete = steps.slice(0, 5).every((s) => s.current >= s.target);

  return (
    <div className="flex items-center gap-1 px-3 py-2 overflow-x-auto">
      {steps.map((step, i) => {
        const done = step.key === "side"
          ? sideTotal === 0 || sideTotal === SIDE_SIZE
          : step.current >= step.target;
        const isOver = step.current > step.target && step.key !== "main" && step.key !== "side";
        const isActive = activeStep === step.filterTab ||
          (step.key === "champion" && activeStep === "legend") ||
          (step.key === "side" && activeStep === "main");

        return (
          <div key={step.key} className="flex items-center">
            {i > 0 && (
              <div className={cn(
                "w-3 h-px mx-0.5 shrink-0",
                done ? "bg-emerald-500/50" : "bg-hairline",
              )} />
            )}
            <button
              onClick={() => onStepClick(step.filterTab)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors whitespace-nowrap",
                isActive && "bg-arcane/10 text-arcane",
                !isActive && done && "text-emerald-400 hover:bg-emerald-500/10",
                !isActive && isOver && "text-error hover:bg-error/10",
                !isActive && !done && !isOver && "text-ink-muted hover:bg-surface-raised hover:text-ink",
              )}
            >
              {done && !isOver ? (
                <Check size={12} className="text-emerald-400 shrink-0" />
              ) : (
                <span className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold shrink-0",
                  isActive ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted",
                )}>
                  {i + 1}
                </span>
              )}
              <span>{step.label}</span>
              <span className={cn(
                "text-[10px] font-mono",
                done && !isOver ? "text-emerald-400" : isOver ? "text-error" : "text-ink-muted",
              )}>
                {step.current}/{step.target}
              </span>
            </button>
          </div>
        );
      })}

      {allComplete && (
        <div className="ml-auto flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 whitespace-nowrap">
          <Check size={13} /> Deck valide
        </div>
      )}
    </div>
  );
}
