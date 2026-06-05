"use client";

import { useCollection } from "@/components/collection/collection-provider";

export function QuantityStepper({ cardId }: { cardId: string }) {
  const { quantities, loggedIn, setQuantity } = useCollection();
  if (!loggedIn) return null;
  const qty = quantities[cardId] ?? 0;
  return (
    <div className="mt-1 flex items-center justify-center gap-3 text-sm">
      <button
        type="button"
        aria-label="Retirer un exemplaire"
        className="flex h-6 w-6 items-center justify-center rounded bg-surface-raised text-ink-muted hover:text-ink disabled:opacity-30"
        disabled={qty === 0}
        onClick={() => setQuantity(cardId, qty - 1)}
      >
        −
      </button>
      <span className={qty > 0 ? "min-w-4 text-center font-semibold text-arcane" : "min-w-4 text-center text-ink-muted"}>
        {qty}
      </span>
      <button
        type="button"
        aria-label="Ajouter un exemplaire"
        className="flex h-6 w-6 items-center justify-center rounded bg-surface-raised text-ink-muted hover:text-ink"
        onClick={() => setQuantity(cardId, qty + 1)}
      >
        +
      </button>
    </div>
  );
}
