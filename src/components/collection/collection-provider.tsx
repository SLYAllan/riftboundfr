"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { creerFileCollection, type EtatEnvoi, type CartesEnAttente } from "@/lib/collection-envoi";

interface CollectionCtx {
  quantities: Record<string, number>;
  loggedIn: boolean;
  loading: boolean;
  setQuantity: (cardId: string, qty: number) => void;
  etat: EtatEnvoi;
  renvoyer: () => void;
}

const Ctx = createContext<CollectionCtx>({
  quantities: {},
  loggedIn: false,
  loading: true,
  setQuantity: () => {},
  etat: "a-jour",
  renvoyer: () => {},
});

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [etat, setEtat] = useState<EtatEnvoi>("a-jour");

  useEffect(() => {
    fetch("/api/collection")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data === "object" && !("error" in data) && !("anonymous" in data)) {
          setQuantities(data as Record<string, number>);
          setLoggedIn(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Un lot peut porter plusieurs cartes : on les poste l'une après l'autre vers
  // le classeur par défaut. Un 4xx/5xx fait échouer le lot entier, qui reste en
  // attente dans la file jusqu'à « Réessayer ».
  const envoyer = useCallback(async (cartes: CartesEnAttente) => {
    for (const [cardId, quantity] of Object.entries(cartes)) {
      const r = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, quantity }),
      });
      if (!r.ok) throw new Error("sauvegarde refusée");
    }
  }, []);

  // Créée une seule fois : la file garde son état entre deux rendus, sinon un
  // changement pendant un envoi en vol partirait dans une file neuve et vide.
  const fileRef = useRef<ReturnType<typeof creerFileCollection> | null>(null);
  if (fileRef.current === null) {
    fileRef.current = creerFileCollection(envoyer, setEtat);
  }
  const file = fileRef.current;

  const setQuantity = useCallback(
    (cardId: string, qty: number) => {
      const next = Math.max(0, Math.min(9999, Math.floor(qty)));
      setQuantities((prev) => {
        const updated = { ...prev };
        if (next <= 0) delete updated[cardId];
        else updated[cardId] = next;
        return updated;
      });
      file.ajouter({ cardId, quantity: next });
    },
    [file],
  );

  const renvoyer = useCallback(() => file.renvoyer(), [file]);

  return (
    <Ctx.Provider value={{ quantities, loggedIn, loading, setQuantity, etat, renvoyer }}>
      {children}
      {etat === "hors-ligne" && (
        <div data-chrome="collection" className="fixed inset-x-0 bottom-0 z-50 p-4">
          <div
            role="alert"
            className="mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-card border border-hairline bg-surface p-4 text-sm text-error-light shadow-xl backdrop-blur-sm"
          >
            <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              Impossible d&apos;enregistrer la collection. Vos changements attendent, rien n&apos;est perdu.
            </span>
            <button
              type="button"
              onClick={renvoyer}
              className="ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-sm font-semibold text-ink-secondary hover:text-ink"
            >
              <RefreshCw size={15} aria-hidden />
              Réessayer
            </button>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export const useCollection = () => useContext(Ctx);
