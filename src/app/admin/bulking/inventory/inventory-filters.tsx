"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

type Langue = { id: string; code: string; label: string };
type Emplacement = { id: string; code: string; label?: string | null };

interface InventoryFiltersProps {
  langues: Langue[];
  emplacements: Emplacement[];
}

export function InventoryFilters({ langues, emplacements }: InventoryFiltersProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const setTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Écrit les filtres dans l'URL et repart toujours à la page 1 : changer un
  // filtre depuis la page 4 doit ramener en tête de liste, sinon la page peut
  // être vide alors que des lignes existent.
  const naviguer = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(sp.toString());
      params.delete("page");
      for (const [cle, valeur] of Object.entries(updates)) {
        if (valeur) params.set(cle, valeur);
        else params.delete(cle);
      }
      router.push(`/admin/bulking/inventory?${params.toString()}`);
    },
    [router, sp],
  );

  function rechercher(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => naviguer({ q: value }), 300);
  }

  function filtrerSet(value: string) {
    if (setTimerRef.current) clearTimeout(setTimerRef.current);
    setTimerRef.current = setTimeout(() => naviguer({ set: value }), 300);
  }

  const champ =
    "w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-arcane min-h-[44px]";

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label htmlFor="filtre-q" className="text-sm text-ink-secondary">
          Recherche (nom ou identifiant)
          <input
            id="filtre-q"
            type="text"
            placeholder="Poppy, OGN-012…"
            defaultValue={sp.get("q") ?? ""}
            onChange={(e) => rechercher(e.target.value)}
            className={champ}
          />
        </label>
        <label htmlFor="filtre-set" className="text-sm text-ink-secondary">
          Set
          <input
            id="filtre-set"
            type="text"
            placeholder="OGN, VEN…"
            defaultValue={sp.get("set") ?? ""}
            onChange={(e) => filtrerSet(e.target.value)}
            className={champ}
          />
        </label>
        <label htmlFor="filtre-seulement" className="text-sm text-ink-secondary">
          Afficher
          <select
            id="filtre-seulement"
            defaultValue={sp.get("seulement") ?? ""}
            onChange={(e) => naviguer({ seulement: e.target.value })}
            className={champ}
          >
            <option value="">Tout le stock</option>
            <option value="manquants">Manquants (rien de disponible)</option>
            <option value="reserves">Réservés</option>
          </select>
        </label>
        <label htmlFor="filtre-langue" className="text-sm text-ink-secondary">
          Langue
          <select
            id="filtre-langue"
            defaultValue={sp.get("languageId") ?? ""}
            onChange={(e) => naviguer({ languageId: e.target.value })}
            className={champ}
          >
            <option value="">Toutes les langues</option>
            {langues.map((langue) => (
              <option key={langue.id} value={langue.id}>
                {langue.code} · {langue.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="filtre-emplacement" className="text-sm text-ink-secondary">
          Emplacement
          <select
            id="filtre-emplacement"
            defaultValue={sp.get("storageLocationId") ?? ""}
            onChange={(e) => naviguer({ storageLocationId: e.target.value })}
            className={champ}
          >
            <option value="">Tous les emplacements</option>
            {emplacements.map((emplacement) => (
              <option key={emplacement.id} value={emplacement.id}>
                {emplacement.code}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => router.push("/admin/bulking/inventory")}
            className="min-h-[44px] rounded-lg border border-hairline bg-surface px-4 py-2 text-sm text-ink-secondary hover:text-ink"
          >
            Tout effacer
          </button>
        </div>
      </div>
    </div>
  );
}
