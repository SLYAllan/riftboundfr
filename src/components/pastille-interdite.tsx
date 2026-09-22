"use client";

import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n-provider";

/**
 * Signale, sur une vignette, une liste qui joue une carte interdite aujourd'hui.
 * Un tiers des listes Vendetta jouaient Ekko, Recurrent ou Stacked Deck au ban du
 * 18 septembre, et seule la page du deck le disait : on choisissait une liste sur
 * sa vignette sans le savoir. Texte rouge sur fond neutre, comme l'étiquette
 * « Banni » des listes : c'est la même information, vue de plus loin.
 *
 * `compacte` pour les lignes étroites : le nom de la carte, coupé à trois lettres,
 * ne disait plus rien et écrasait celui de la Légende. Il reste dans l'infobulle.
 */
export function PastilleInterdite({ cartes, compacte, className }: { cartes: string[]; compacte?: boolean; className?: string }) {
  const t = useT();
  if (!cartes.length) return null;
  const plusieurs = cartes.length > 1;
  const complet = `${t(plusieurs ? "Interdites :" : "Interdite :")} ${cartes.join(" · ")}`;
  return (
    <span
      title={complet}
      className={cn("truncate rounded-full bg-canvas/85 px-2 py-0.5 text-[11px] font-bold text-red-400 shadow ring-1 ring-red-500/40", className)}
    >
      {compacte ? t(plusieurs ? "Cartes interdites" : "Carte interdite") : complet}
    </span>
  );
}
