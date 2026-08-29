"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

type Emplacement = { id: string; code: string };

interface InventoryActionsProps {
  cardId: string;
  languageId: string;
  condition: "NM";
  finish: "NORMAL" | "FOIL";
  storageLocationId: string;
  emplacements: Emplacement[];
}

export function InventoryActions({ cardId, languageId, condition, finish, storageLocationId, emplacements }: InventoryActionsProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<"correction" | "transfert">("correction");
  const [erreur, setErreur] = useState("");
  const [charge, setCharge] = useState(false);

  function ouvrir(m: "correction" | "transfert") {
    setMode(m);
    setErreur("");
    dialogRef.current?.showModal();
  }

  async function envoyer(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    const form = formRef.current;
    if (!form) return;
    setCharge(true);
    setErreur("");

    const formulaire = new FormData(form);
    const source = String(formulaire.get("source") ?? "").trim();
    let url: string;
    let corps: Record<string, unknown>;
    if (mode === "correction") {
      const physicalDelta = Number(formulaire.get("physicalDelta"));
      const reservedDelta = Number(formulaire.get("reservedDelta") ?? 0);
      // Une chaîne vide n'est pas un coût : la route la refuserait alors qu'une
      // sortie de stock n'en demande aucun.
      const cout = String(formulaire.get("acquisitionUnitCost") ?? "").trim();
      url = "/api/admin/bulking/inventory/adjust";
      corps = {
        cardId,
        languageId,
        condition,
        finish,
        storageLocationId,
        physicalDelta,
        reservedDelta,
        ...(cout ? { acquisitionUnitCost: cout } : {}),
        source,
      };
    } else {
      url = "/api/admin/bulking/inventory/transfer";
      corps = {
        cardId,
        languageId,
        condition,
        finish,
        fromLocationId: storageLocationId,
        toLocationId: String(formulaire.get("toLocationId") ?? ""),
        quantity: Number(formulaire.get("quantity")),
        source,
      };
    }

    try {
      const reponse = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });
      const donnees: unknown = await reponse.json();
      if (!reponse.ok) {
        const message =
          donnees && typeof donnees === "object" && !Array.isArray(donnees) && typeof (donnees as Record<string, unknown>).error === "string"
            ? ((donnees as Record<string, unknown>).error as string)
            : "Écriture impossible";
        setErreur(message);
        return;
      }
      // Contrôle de la forme après r.ok : une route qui rendrait autre chose
      // qu'un objet ferait tomber la page en silence si on l'acceptait.
      if (!donnees || typeof donnees !== "object" || Array.isArray(donnees)) {
        setErreur("Réponse invalide du serveur");
        return;
      }
      dialogRef.current?.close();
      router.refresh();
    } catch {
      setErreur("Échec réseau, la ligne n'a pas été modifiée");
    } finally {
      setCharge(false);
    }
  }

  const bouton =
    "min-h-[44px] rounded-lg px-3 py-2 text-sm text-ink-secondary hover:text-ink border border-hairline bg-surface disabled:opacity-50";

  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => ouvrir("correction")} className={bouton}>
        Corriger
      </button>
      <button type="button" onClick={() => ouvrir("transfert")} className={bouton}>
        Transférer
      </button>

      <dialog ref={dialogRef} aria-labelledby="titre-action-stock" className="w-full max-w-md rounded-xl border border-hairline bg-surface p-5 text-ink backdrop:bg-black/40">
        <form ref={formRef} onSubmit={envoyer} className="space-y-4">
          <h2 id="titre-action-stock" className="text-lg font-bold text-ink">
            {mode === "correction" ? "Corriger le stock" : "Transférer du stock"}
          </h2>

          {mode === "correction" ? (
            <>
              <label htmlFor="action-physique" className="block text-sm text-ink-secondary">
                Variation physique (négative pour sortir)
                <input id="action-physique" name="physicalDelta" type="number" step="1" required className="mt-1 min-h-[44px] w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" />
              </label>
              <label htmlFor="action-reserve" className="block text-sm text-ink-secondary">
                Variation réservé
                <input id="action-reserve" name="reservedDelta" type="number" step="1" defaultValue={0} className="mt-1 min-h-[44px] w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" />
              </label>
              <label htmlFor="action-cout" className="block text-sm text-ink-secondary">
                Coût unitaire (obligatoire si la variation physique est positive)
                <input id="action-cout" name="acquisitionUnitCost" type="text" inputMode="decimal" placeholder="0.1200" className="mt-1 min-h-[44px] w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" />
              </label>
            </>
          ) : (
            <>
              <label htmlFor="action-vers" className="block text-sm text-ink-secondary">
                Vers l&apos;emplacement
                <select id="action-vers" name="toLocationId" required defaultValue="" className="mt-1 min-h-[44px] w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink">
                  <option value="" disabled>Choisir un emplacement</option>
                  {emplacements.map((emplacement) => (
                    <option key={emplacement.id} value={emplacement.id} disabled={emplacement.id === storageLocationId}>
                      {emplacement.code}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="action-quantite" className="block text-sm text-ink-secondary">
                Quantité
                <input id="action-quantite" name="quantity" type="number" step="1" min={1} required className="mt-1 min-h-[44px] w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" />
              </label>
            </>
          )}

          <label htmlFor="action-source" className="block text-sm text-ink-secondary">
            Motif
            <input id="action-source" name="source" type="text" required maxLength={120} placeholder="Comptage, rangement…" className="mt-1 min-h-[44px] w-full rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink" />
          </label>

          {erreur && (
            <p role="alert" className="rounded-lg border border-hairline bg-surface-raised p-3 text-sm text-danger">
              {erreur}
              <button type="button" onClick={() => envoyer()} className="ml-2 font-medium underline">
                Réessayer
              </button>
            </p>
          )}

          <div className="flex items-center gap-2">
            <button type="submit" disabled={charge} className="min-h-[44px] rounded-lg bg-arcane px-4 py-2 font-medium text-white disabled:opacity-50">
              {charge ? "Envoi…" : mode === "correction" ? "Valider la correction" : "Valider le transfert"}
            </button>
            <button type="button" onClick={() => dialogRef.current?.close()} className="min-h-[44px] rounded-lg border border-hairline bg-surface px-4 py-2 text-sm text-ink-secondary hover:text-ink">
              Annuler
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
