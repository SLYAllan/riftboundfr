"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useCollection } from "@/components/collection/collection-provider";
import type { DeckCoverage } from "@/lib/collection";

export interface CoverageItem {
  cardId: string;
  quantity: number;
  section?: string;
  name?: string;
}

// `quantities` du contexte sert juste de déclencheur : quand la collection change
// (stepper, import), on recalcule. Le calcul fiable (alt-art) vient du serveur.
export function DeckCoveragePanel({ items }: { items: CoverageItem[] }) {
  const { loggedIn, quantities } = useCollection();
  const [coverage, setCoverage] = useState<DeckCoverage | null>(null);
  const [loading, setLoading] = useState(false);

  // Signature stable des items + de la collection pour limiter les appels.
  const itemsKey = useMemo(
    () => items.map((i) => `${i.cardId}:${i.quantity}`).join("|"),
    [items],
  );
  const collKey = useMemo(() => Object.entries(quantities).map(([k, v]) => `${k}:${v}`).sort().join("|"), [quantities]);

  useEffect(() => {
    if (!loggedIn || items.length === 0) return;
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
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
        <Link href="/api/auth/discord" className="text-arcane hover:underline">
          Connecte-toi avec Discord
        </Link>{" "}
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
      <div className="flex items-center justify-between">
        <span className="font-semibold">Ma collection</span>
        {loading && missing === null ? (
          <span className="text-sm text-ink-muted">Calcul…</span>
        ) : missing === 0 ? (
          <span className="text-sm font-medium text-emerald-400">Deck complet ✓</span>
        ) : missing != null ? (
          <span className="text-sm font-medium text-amber-400">Il te manque {missing} carte(s)</span>
        ) : null}
      </div>
      {coverage && coverage.totals.missing > 0 && (
        <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm text-ink-muted sm:grid-cols-2">
          {coverage.entries
            .filter((e) => e.missing > 0)
            .map((e) => (
              <li key={e.cardId}>
                <span className="text-amber-400">{e.missing}×</span> {e.name}
              </li>
            ))}
        </ul>
      )}
      {coverage && coverage.totals.required > 0 && (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded bg-surface-raised">
            <div
              className="h-2 rounded bg-arcane transition-all"
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
