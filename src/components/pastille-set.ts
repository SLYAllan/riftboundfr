import { cn } from "@/lib/utils";

/**
 * La pastille de choix de set, celle de /meta. Le site avait cinq façons de choisir
 * un set (onglets soulignés, blocs pleins, pastilles, menus) ; partout où le set est
 * le seul choix, c'est celle-ci (choix d'Allan du 12 novembre 2026, volet esthétique
 * E4). Sur /decks et /cartes, le set reste un menu, posé parmi d'autres filtres.
 */
export function classePastilleSet(actif: boolean): string {
  return cn(
    "inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane",
    actif ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink",
  );
}
