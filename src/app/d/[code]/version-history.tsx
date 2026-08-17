"use client";

import { useState } from "react";
import { History, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n-provider";
import type { SectionDeck } from "@/lib/deck-diff";

interface Changement {
  nom: string;
  section: SectionDeck;
  avant: number;
  apres: number;
}

interface Version {
  id: string;
  version: number;
  changelog: string | null;
  createdAt: string;
  changements: Changement[];
}

interface Props {
  currentVersion: number;
  history: Version[];
}

const NOM_SECTION: Record<SectionDeck, string> = {
  legend: "Légende",
  champion: "Champion",
  main: "Deck principal",
  rune: "Runes",
  battlefield: "Champs de bataille",
  side: "Réserve",
};

export function VersionHistory({ currentVersion, history }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);

  if (currentVersion <= 1 || history.length === 0) return null;

  return (
    <div className="rounded-xl border border-hairline bg-surface">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 hover:bg-surface-raised/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History size={15} className="text-ink-muted" />
          <span className="text-sm font-semibold text-ink">{t("Historique des versions")}</span>
          <span className="text-xs text-ink-muted">({history.length})</span>
        </div>
        <ChevronDown size={15} className={cn("text-ink-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-hairline px-4 py-3 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-arcane font-semibold">
              v{currentVersion}
            </span>
            <span className="text-ink-muted">- {t("version actuelle")}</span>
          </div>
          {history.map((v) => (
            <div key={v.id} className="flex items-start gap-2 text-xs">
              <span className="rounded-full bg-surface-raised px-2 py-0.5 text-ink-secondary font-semibold shrink-0">
                v{v.version}
              </span>
              <div className="min-w-0">
                <span className="text-ink-muted">
                  {new Date(v.createdAt).toLocaleDateString("fr-FR")}
                </span>
                {v.changelog && (
                  <p className="text-ink-secondary mt-0.5">{v.changelog}</p>
                )}
                {v.changements.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {v.changements.map((c) => {
                      const delta = c.apres - c.avant;
                      return (
                        <li key={`${c.section}-${c.nom}`} className="flex items-baseline gap-1.5">
                          <span
                            className={cn(
                              "font-mono font-semibold tabular-nums shrink-0",
                              delta > 0 ? "text-success" : "text-error",
                            )}
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                          <span className="text-ink-secondary break-words">{c.nom}</span>
                          {c.section !== "main" && (
                            <span className="text-ink-muted shrink-0">({t(NOM_SECTION[c.section])})</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
