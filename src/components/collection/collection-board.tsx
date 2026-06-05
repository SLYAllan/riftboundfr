"use client";

import { useCollection } from "@/components/collection/collection-provider";

export interface SetInfo {
  set: string;
  name: string;
  cardCount: number;
  cardIds: string[];
}

export function CollectionBoard({ sets }: { sets: SetInfo[] }) {
  const { quantities, loggedIn } = useCollection();

  if (!loggedIn) {
    return (
      <p className="rounded-lg border border-line p-4 text-sm text-ink-muted">
        Connecte-toi avec Discord pour suivre ta collection et voir ta progression par set.
      </p>
    );
  }

  const totalOwned = Object.values(quantities).reduce((s, q) => s + q, 0);
  const totalDistinct = Object.keys(quantities).length;

  return (
    <div className="space-y-5">
      <div className="flex gap-6 text-sm">
        <div>
          <div className="text-2xl font-bold text-arcane">{totalOwned}</div>
          <div className="text-ink-muted">exemplaires</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{totalDistinct}</div>
          <div className="text-ink-muted">cartes différentes</div>
        </div>
      </div>

      <div className="space-y-4">
        {sets.map((s) => {
          const ownedDistinct = s.cardIds.filter((id) => (quantities[id] ?? 0) > 0).length;
          const pct = s.cardCount ? Math.round((ownedDistinct / s.cardCount) * 100) : 0;
          return (
            <div key={s.set}>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{s.name}</span>
                <span className="text-ink-muted">
                  {ownedDistinct}/{s.cardCount} ({pct}%)
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded bg-surface-raised">
                <div className="h-2 rounded bg-arcane transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
