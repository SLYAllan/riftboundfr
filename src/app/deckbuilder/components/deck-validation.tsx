"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeckValidationIssue } from "../lib/deck-rules";

interface DeckValidationProps {
  issues: DeckValidationIssue[];
  isCompetitive: boolean;
  onSectionClick: (section: string) => void;
}

export function DeckValidation({ issues, isCompetitive, onSectionClick }: DeckValidationProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!isCompetitive) return null;

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const isValid = errors.length === 0;

  return (
    <div className="border-t border-hairline/50">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center justify-between px-3 py-2 hover:bg-surface-raised/30 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <ChevronDown size={13} className={cn("text-ink-muted transition-transform", collapsed && "-rotate-90")} />
          {isValid ? (
            <CheckCircle2 size={13} className="text-emerald-400" />
          ) : (
            <AlertTriangle size={13} className="text-amber-400" />
          )}
          <span className="text-xs font-semibold text-ink-muted">
            {isValid ? "Deck valide" : `${errors.length} problème${errors.length > 1 ? "s" : ""}`}
          </span>
        </div>
      </button>

      {!collapsed && (
        <div className="px-3 pb-2 space-y-0.5">
          {errors.map((issue) => (
            <button
              key={issue.id}
              onClick={() => onSectionClick(issue.section)}
              className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left hover:bg-surface-raised/50 transition-colors"
            >
              <XCircle size={11} className="text-error shrink-0" />
              <span className="text-[11px] text-ink-secondary">{issue.message}</span>
            </button>
          ))}
          {warnings.map((issue) => (
            <button
              key={issue.id}
              onClick={() => onSectionClick(issue.section)}
              className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left hover:bg-surface-raised/50 transition-colors"
            >
              <AlertTriangle size={11} className="text-amber-400 shrink-0" />
              <span className="text-[11px] text-ink-secondary">{issue.message}</span>
            </button>
          ))}
          {isValid && (
            <div className="flex items-center gap-1.5 px-2 py-1">
              <CheckCircle2 size={11} className="text-emerald-400" />
              <span className="text-[11px] text-emerald-400">Toutes les règles compétitives sont respectées</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
