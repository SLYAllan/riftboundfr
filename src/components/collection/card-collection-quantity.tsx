"use client";

import Link from "@/components/lien";
import { useT } from "@/components/i18n-provider";
import { useCollection } from "@/components/collection/collection-provider";

export function CardCollectionQuantity({ cardId }: { cardId: string }) {
  const t = useT();
  const { quantities, loggedIn, loading, setQuantity, etat, erreurChargement, recharger } = useCollection();
  const quantity = quantities[cardId] ?? 0;

  if (loading) {
    return <div role="status" className="mt-5 h-11 w-52 rounded-lg bg-surface-raised motion-safe:animate-pulse" aria-label={t("Chargement…")} />;
  }

  if (erreurChargement) {
    return (
      <div role="alert" className="mt-5 flex flex-wrap items-center gap-3 text-sm text-error-light">
        <span>{t("Impossible de charger votre collection.")}</span>
        <button type="button" onClick={recharger} className="min-h-11 rounded-lg bg-surface-raised px-3 font-semibold text-ink-secondary hover:text-ink">
          {t("Réessayer")}
        </button>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold">{t("Ma collection")}</span>
        <Link href="/api/auth/discord" className="text-arcane underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
          {t("Se connecter avec Discord")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-5 inline-flex flex-wrap items-center gap-3 rounded-lg border border-hairline bg-surface p-2.5">
      <span className="text-sm font-semibold">{t("Ma collection")}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={quantity === 0}
          onClick={() => setQuantity(cardId, quantity - 1)}
          aria-label={t("Retirer une copie")}
          className="flex size-11 items-center justify-center rounded bg-surface-raised text-xl text-ink-secondary hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-30"
        >
          −
        </button>
        <output aria-live="polite" className="min-w-10 text-center font-semibold tabular-nums text-arcane">
          {quantity}
        </output>
        <button
          type="button"
          onClick={() => setQuantity(cardId, quantity + 1)}
          aria-label={t("Ajouter une copie")}
          className="flex size-11 items-center justify-center rounded bg-surface-raised text-xl text-ink-secondary hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          +
        </button>
      </div>
      <span role="status" className="text-xs text-ink-muted">
        {t(etat === "envoi" ? "Enregistrement…" : etat === "hors-ligne" ? "Enregistrement impossible. Réessaie." : "À jour")}
      </span>
    </div>
  );
}
