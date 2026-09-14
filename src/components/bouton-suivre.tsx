"use client";

import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n-provider";
import type { GenreAbonnement } from "@/lib/abonnements";

interface Props {
  genre: GenreAbonnement;
  /** Vide pour un abonnement global (tournois français, règles). */
  cible?: string;
  /** L'état au chargement, calculé côté serveur. */
  suiviInitial: boolean;
  /** Sans compte, il n'y a nulle part où envoyer l'alerte : on n'affiche rien. */
  connecte: boolean;
  libelle: string;
  libelleSuivi?: string;
  className?: string;
}

/**
 * Suivre un sujet pour être prévenu dans la cloche.
 *
 * L'état voulu part au serveur, pas l'action : deux clics rapides finissent au
 * même endroit au lieu de basculer deux fois. L'affichage change tout de suite
 * et revient en arrière si la requête échoue, plutôt que de mentir.
 */
export function BoutonSuivre({
  genre, cible = "", suiviInitial, connecte, libelle, libelleSuivi, className,
}: Props) {
  const t = useT();
  const [suivi, setSuivi] = useState(suiviInitial);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  if (!connecte) return null;

  const basculer = async () => {
    const voulu = !suivi;
    setSuivi(voulu);
    setEnCours(true);
    setErreur(null);
    try {
      const res = await fetch("/api/abonnements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre, cible, suivre: voulu }),
      });
      if (!res.ok) {
        setSuivi(!voulu);
        const corps = (await res.json().catch(() => null)) as { error?: string } | null;
        setErreur(corps?.error || t("Impossible d’enregistrer. Réessayez."));
      }
    } catch {
      setSuivi(!voulu);
      setErreur(t("Impossible d’enregistrer. Vérifiez votre connexion."));
    } finally {
      setEnCours(false);
    }
  };

  const Icone = suivi ? BellRing : Bell;

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={basculer}
        disabled={enCours}
        aria-pressed={suivi}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors disabled:opacity-70",
          suivi
            ? "border-arcane bg-arcane text-canvas hover:bg-arcane-light"
            : "border-hairline-strong bg-surface text-ink-secondary hover:text-ink",
          className,
        )}
      >
        <Icone size={14} aria-hidden="true" />
        {suivi ? libelleSuivi ?? t("Suivi") : libelle}
      </button>
      {erreur && <span role="alert" className="text-xs text-error-light">{erreur}</span>}
    </span>
  );
}
