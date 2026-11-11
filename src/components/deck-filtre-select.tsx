"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useLien, useT } from "@/components/i18n-provider";
import { modifierParametresDecks } from "@/lib/deck-listing-params";

/**
 * Un menu déroulant de filtre pour /decks.
 *
 * Chaque filtre était une rangée de pastilles qui construisait son lien à la main,
 * en oubliant les autres : choisir un set effaçait le tournoi en cours. Ici on
 * repart des paramètres présents et on ne touche qu'au sien. `offset` saute à
 * chaque changement, sinon on reste à la page 3 d'une liste qui vient de changer.
 */
export function DeckFiltreSelect({
  nom,
  libelle,
  toutes,
  valeurParDefaut = "",
  options,
  chemin = "/decks",
}: {
  /** Page à recharger avec le nouveau filtre : /tournois emploie le même menu. */
  chemin?: string;
  nom: string;
  libelle: string;
  toutes: string;
  valeurParDefaut?: string;
  options: Array<{ valeur: string; libelle: string }>;
}) {
  const t = useT();
  const router = useRouter();
  const lien = useLien();
  const params = useSearchParams();
  const courant = params.get(nom) ?? valeurParDefaut;

  // Même allure que les menus de Légende et de tournoi posés à côté : sans
  // `appearance-none`, la flèche du système et son fond tranchaient sur la rangée.
  return (
    <span className="relative inline-flex">
    <select
      value={courant}
      aria-label={libelle}
      onChange={(e) => {
        const suivant = modifierParametresDecks(params, { [nom]: e.target.value });
        const q = suivant.toString();
        router.push(lien(q ? `${chemin}?${q}` : chemin));
      }}
      className="h-11 min-h-11 cursor-pointer appearance-none rounded-lg border border-hairline-strong bg-canvas pl-3 pr-9 text-sm text-ink focus:border-arcane"
    >
      <option value="all">{t(toutes)}</option>
      {options.map((o) => (
        <option key={o.valeur} value={o.valeur}>
          {o.libelle}
        </option>
      ))}
    </select>
    <ChevronDown size={15} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" />
    </span>
  );
}
