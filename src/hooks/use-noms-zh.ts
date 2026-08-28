"use client";

import { useEffect, useMemo, useState } from "react";
import { useLangue } from "@/components/i18n-provider";

/**
 * Traduit un nom de carte pour l'affichage : Légende, champion, champ de bataille.
 *
 * Hors du chinois, il rend le nom tel quel et ne demande rien au serveur. La table
 * est gardée au niveau du module : l'overlay, le tableau de bord et le compagnon la
 * partagent, et un cadre qui se remonte ne la retélécharge pas.
 *
 * Un échec laisse les noms en anglais. C'est le même repli que pour une carte absente
 * du figurier, donc rien à afficher à l'utilisateur : la page reste entière, seuls les
 * noms ne sont pas traduits.
 */
let table: Record<string, string> | null = null;

export function useNomsZh(): (nom: string) => string {
  const langue = useLangue();
  const [prete, setPrete] = useState(table !== null);

  useEffect(() => {
    if (langue !== "zh" || table) return;
    let annule = false;
    (async () => {
      try {
        const reponse = await fetch("/api/cards/noms-zh");
        if (!reponse.ok) return;
        const recu: unknown = await reponse.json();
        // Même garde-fou que les autres listes : une route en panne rend
        // `{ error: … }`, et un objet d'erreur rangé ici traduirait n'importe quoi.
        if (!recu || typeof recu !== "object" || Array.isArray(recu)) return;
        table = recu as Record<string, string>;
        if (!annule) setPrete(true);
      } catch {
        // Réseau coupé : on garde l'anglais, il n'y a rien de cassé à signaler.
      }
    })();
    return () => {
      annule = true;
    };
  }, [langue]);

  return useMemo(
    () => (nom: string) => (langue === "zh" && prete && table?.[nom]) || nom,
    [langue, prete],
  );
}
