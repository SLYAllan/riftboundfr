"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "@/components/lien";
import { LayoutGrid, List, ChevronDown } from "lucide-react";
import { useCollection } from "@/components/collection/collection-provider";
import { CardImage } from "@/components/card-image";
import { CardHover } from "@/components/collection/card-hover";
import type { DeckCoverage } from "@/lib/collection";
import { useT } from "@/components/i18n-provider";

export interface CoverageItem {
  cardId: string;
  quantity: number;
  section?: string;
  name?: string;
}

// `quantities` du contexte sert juste de déclencheur : quand la collection change
// (stepper, import), on recalcule. Le calcul fiable (alt-art) vient du serveur.
export function DeckCoveragePanel({ items }: { items: CoverageItem[] }) {
  const t = useT();
  const { loggedIn, quantities } = useCollection();
  const [coverage, setCoverage] = useState<DeckCoverage | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [open, setOpen] = useState(false);

  // Signature stable des items + de la collection pour limiter les appels.
  const itemsKey = useMemo(
    () => items.map((i) => `${i.cardId}:${i.quantity}`).join("|"),
    [items],
  );
  const collKey = useMemo(() => Object.entries(quantities).map(([k, v]) => `${k}:${v}`).sort().join("|"), [quantities]);

  useEffect(() => {
    if (!loggedIn || items.length === 0) return;
    let cancelled = false;
    const t = setTimeout(() => {
      setLoading(true);
      fetch("/api/collection/coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!cancelled && data?.coverage) setCoverage(data.coverage);
        })
        .catch(() => {})
        .finally(() => !cancelled && setLoading(false));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, itemsKey, collKey]);

  if (!loggedIn) {
    return (
      <div className="rounded-lg border border-line p-4 text-sm text-ink-muted">
        <Link href="/api/auth/discord" className="text-arcane hover:underline">{t("Connecte-toi avec Discord")}</Link>{" "}
        pour voir combien de cartes il te manque pour ce deck.{" "}
        <Link href="/collection" className="text-arcane hover:underline">
          Ma collection
        </Link>
      </div>
    );
  }

  const missing = coverage?.totals.missing ?? null;

  return (
    <div className="rounded-lg border border-line bg-surface-raised/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 font-semibold">
          <ChevronDown size={14} className={`text-ink-muted transition-transform ${!open ? "-rotate-90" : ""}`} />
          Ma collection
        </button>
        <div className="flex items-center gap-3">
          {loading && missing === null ? (
            <span className="text-sm text-ink-muted">Calcul…</span>
          ) : missing === 0 ? (
            <span className="text-sm font-medium text-emerald-400">Deck complet ✓</span>
          ) : missing != null ? (
            <button onClick={() => setOpen(!open)} className="text-sm font-medium text-amber-400 hover:underline">Il te manque {missing} carte{missing > 1 ? "s" : ""}</button>
          ) : null}
          {open && coverage && coverage.totals.missing > 0 && (
            <div className="flex rounded-lg border border-hairline bg-surface p-0.5">
              <button onClick={() => setMode("grid")} aria-label="Vue cartes"
                className={`flex h-6 w-6 items-center justify-center rounded-md ${mode === "grid" ? "bg-arcane text-canvas" : "text-ink-muted hover:text-ink"}`}>
                <LayoutGrid size={13} />
              </button>
              <button onClick={() => setMode("list")} aria-label="Vue liste"
                className={`flex h-6 w-6 items-center justify-center rounded-md ${mode === "list" ? "bg-arcane text-canvas" : "text-ink-muted hover:text-ink"}`}>
                <List size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
      {open && coverage && coverage.totals.missing > 0 && mode === "list" && (
        <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {coverage.entries.filter((e) => e.missing > 0).map((e, i) => (
            <li key={`${e.cardId}-${i}`} className="flex items-center gap-2 rounded px-1.5 py-1 transition-colors hover:bg-surface-raised">
              <span className="flex h-5 min-w-5 items-center justify-center rounded bg-amber-500 px-1 text-[11px] font-bold text-canvas">{e.missing}×</span>
              <span className="truncate text-ink-secondary">{e.name}</span>
            </li>
          ))}
        </ul>
      )}
      {open && coverage && coverage.totals.missing > 0 && mode === "grid" && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
          {coverage.entries
            .filter((e) => e.missing > 0)
            .map((e, i) => {
              const W = 84, H = 117, OFFSET = 16;
              const shown = Math.min(e.missing, 5);
              return (
                <CardHover
                  key={`${e.cardId}-${i}`}
                  className="group"
                  src={e.imageUrl ?? null}
                  alt={e.name}
                  width={190}
                  name={e.name}
                  type={e.type}
                  energy={e.energy}
                  might={e.might}
                  domains={e.domains}
                  note={<span className="font-semibold text-amber-400">Il t&apos;en manque {e.missing}</span>}
                >
                  <div className="relative" style={{ width: W + (shown - 1) * OFFSET, height: H }}>
                    {Array.from({ length: shown }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 overflow-hidden rounded-game-card transition duration-200 group-hover:ring-2 group-hover:ring-arcane/70"
                        style={{ left: i * OFFSET, width: W, zIndex: i }}
                      >
                        <CardImage src={e.imageUrl ?? null} alt={e.name} size="sm" />
                      </div>
                    ))}
                    {e.missing > 1 && (
                      <span
                        className="absolute -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-canvas shadow"
                        style={{ left: (shown - 1) * OFFSET + W - 18, zIndex: shown + 1 }}
                      >
                        {e.missing}×
                      </span>
                    )}
                  </div>
                </CardHover>
              );
            })}
        </div>
      )}
      {coverage && coverage.totals.required > 0 && (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded bg-surface-raised">
            <div
              className="h-2 rounded bg-arcane transition-colors"
              style={{ width: `${coverage.totals.completionPct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-ink-muted">
            {coverage.totals.owned}/{coverage.totals.required} cartes possédées ({coverage.totals.completionPct}%)
          </p>
        </div>
      )}
    </div>
  );
}
