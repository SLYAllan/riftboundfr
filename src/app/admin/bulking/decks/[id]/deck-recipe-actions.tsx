"use client";

import { useCallback, useEffect, useState } from "react";

type Langue = { id: string; code: string; label: string };

type SectionRecette = "LEGEND" | "CHAMPION" | "MAIN_DECK" | "BATTLEFIELD" | "SIDEBOARD" | "GENERIC";

type LigneAnalyse = {
  cardId: string;
  languageId: string;
  section?: SectionRecette;
  quantity: number;
  availableQuantity: number;
  missingQuantity: number;
  buildableQuantity: number;
  averageAcquisitionCost: string;
  limiting: boolean;
};

type ReponseAnalyse = {
  deck: { id: string; name: string; slug: string };
  analysis: {
    buildableQuantity: number;
    inventoryCostPerProduct: string;
    lines: LigneAnalyse[];
  };
  cards: Record<string, { name: string; riftboundId: string; imageUrl: string | null; rarity: string }>;
};

const LIBELLES_SECTION: Record<SectionRecette, string> = {
  LEGEND: "Légende",
  CHAMPION: "Champion",
  MAIN_DECK: "Deck principal",
  BATTLEFIELD: "Champs de bataille",
  SIDEBOARD: "Réserve",
  GENERIC: "Générique",
};

/**
 * Contrôle la forme de la réponse d'analyse avant de l'afficher : un objet
 * `{ error }` avec un 500, ou une forme inattendue, ne doit jamais atterrir
 * dans l'état et faire lever le rendu.
 */
function estReponseAnalyse(donnees: unknown): donnees is ReponseAnalyse {
  if (!donnees || typeof donnees !== "object") return false;
  const racine = donnees as Record<string, unknown>;
  const analyse = racine.analysis;
  if (!analyse || typeof analyse !== "object") return false;
  const a = analyse as Record<string, unknown>;
  if (typeof a.buildableQuantity !== "number") return false;
  if (typeof a.inventoryCostPerProduct !== "string") return false;
  if (!Array.isArray(a.lines)) return false;
  if (!racine.cards || typeof racine.cards !== "object" || Array.isArray(racine.cards)) return false;
  return true;
}

/**
 * Formate un coût en chaîne sans passer par un nombre flottant : les coûts de
 * stockage voyagent en chaînes précisément pour ne jamais être convertis.
 */
function formaterMontant(montant: string): string {
  const brut = montant.includes(".") ? montant : `${montant}.0`;
  const [entier, decimalesBrutes = ""] = brut.split(".");
  const decimales = decimalesBrutes.slice(0, 4).replace(/0+$/, "");
  const entiers = entier.replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
  return `${entiers}${decimales ? `,${decimales}` : ""} €`;
}

async function lire(reponse: Response): Promise<unknown> {
  const donnees = await reponse.json();
  if (!reponse.ok) throw new Error((donnees as { error?: string } | null)?.error ?? "Requête impossible");
  return donnees;
}

export function DeckRecipeActions({ deckId, deckName }: { deckId: string; deckName: string }) {
  const [langues, setLangues] = useState<Langue[]>([]);
  const [languageId, setLanguageId] = useState("");
  const [includeSideboard, setIncludeSideboard] = useState(false);
  const [analyse, setAnalyse] = useState<ReponseAnalyse | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [echec, setEchec] = useState<"analyse" | "creation" | null>(null);
  const [nom, setNom] = useState("");
  const [creation, setCreation] = useState(false);
  const [message, setMessage] = useState("");
  const [chargee, setChargee] = useState(false);

  // Charge la liste des langues puis lance la première analyse via l'effet suivant.
  useEffect(() => {
    fetch("/api/admin/bulking/languages")
      .then(lire)
      .then((donnees) => {
        if (!Array.isArray(donnees)) throw new Error("Réponse invalide");
        setLangues(donnees as Langue[]);
        setLanguageId((donnees[0]?.id) ?? "");
        setNom(deckName);
      })
      .catch((e) => setErreur(e instanceof Error ? e.message : "Chargement impossible"))
      .finally(() => setChargee(true));
  }, [deckName]);

  const chargerAnalyse = useCallback(
    async (langueId: string, sideboard: boolean): Promise<boolean> => {
      setChargement(true);
      setErreur("");
      setEchec(null);
      const params = new URLSearchParams({ languageId: langueId, includeSideboard: String(sideboard) });
      try {
        const reponse = await fetch(`/api/admin/bulking/decks/${deckId}/analysis?${params}`);
        const donnees = await reponse.json();
        if (!reponse.ok) throw new Error((donnees as { error?: string } | null)?.error ?? "Analyse impossible");
        if (!estReponseAnalyse(donnees)) throw new Error("Réponse invalide");
        setAnalyse(donnees);
        return true;
      } catch (e) {
        setAnalyse(null);
        setErreur(e instanceof Error ? e.message : "Analyse impossible");
        setEchec("analyse");
        return false;
      } finally {
        setChargement(false);
      }
    },
    [deckId],
  );

  useEffect(() => {
    if (!chargee || !languageId) return;
    let annule = false;
    // L'attente d'une microtâche sort du rendu : chargerAnalyse pose son état
    // de chargement tout de suite, et l'appeler à sec ici relancerait un rendu
    // en cascade.
    void Promise.resolve().then(() => {
      if (!annule) void chargerAnalyse(languageId, includeSideboard);
    });
    return () => { annule = true; };
  }, [chargee, languageId, includeSideboard, chargerAnalyse]);

  async function creerRecette() {
    if (!nom.trim()) {
      setErreur("Nom de recette manquant");
      setEchec(null);
      return;
    }
    setCreation(true);
    setErreur("");
    setEchec(null);
    setMessage("");
    try {
      const reponse = await fetch(`/api/admin/bulking/decks/${deckId}/recipe`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: nom.trim(), languageId, includeSideboard }),
      });
      const donnees = await reponse.json();
      if (!reponse.ok) throw new Error((donnees as { error?: string } | null)?.error ?? "Création impossible");
      if (!donnees || typeof donnees !== "object" || typeof (donnees as { id?: unknown }).id !== "string") {
        throw new Error("Réponse invalide");
      }
      setMessage(`Recette « ${nom.trim()} » créée.`);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Création impossible");
      setEchec("creation");
    } finally {
      setCreation(false);
    }
  }

  function reessayer() {
    setErreur("");
    setEchec(null);
    if (echec === "creation") void creerRecette();
    else void chargerAnalyse(languageId, includeSideboard);
  }

  if (!chargee) return <p className="text-ink-muted">Chargement…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-hairline bg-surface p-4">
        <label className="block text-sm text-ink-secondary">
          Langue
          <select
            value={languageId}
            onChange={(e) => setLanguageId(e.target.value)}
            className="mt-1 rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink"
          >
            {langues.map((l) => (
              <option key={l.id} value={l.id}>
                {l.code} · {l.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-ink-secondary">
          <input
            type="checkbox"
            checked={includeSideboard}
            onChange={(e) => setIncludeSideboard(e.target.checked)}
            className="h-4 w-4 rounded border-hairline"
          />
          Inclure la réserve
        </label>
      </div>

      {erreur && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-surface p-3 text-sm text-danger">
          <p>{erreur}</p>
          <button
            type="button"
            onClick={reessayer}
            className="mt-2 rounded-lg bg-danger/10 px-3 py-1.5 font-medium text-danger hover:bg-danger/20"
          >
            Réessayer
          </button>
        </div>
      )}

      {message && (
        <p role="status" className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink">
          {message}
        </p>
      )}

      {chargement && !analyse && !erreur && <p className="text-ink-muted">Analyse en cours…</p>}

      {analyse && !erreur && (
        <div className="space-y-4">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-hairline bg-surface p-5">
              <dt className="text-sm text-ink-secondary">Quantité réalisable</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums text-ink">{analyse.analysis.buildableQuantity}</dd>
            </div>
            <div className="rounded-xl border border-hairline bg-surface p-5">
              <dt className="text-sm text-ink-secondary">Coût de stock par produit</dt>
              <dd className="mt-1 text-3xl font-bold tabular-nums text-ink">
                {formaterMontant(analyse.analysis.inventoryCostPerProduct)}
              </dd>
            </div>
          </dl>

          <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-hairline text-left text-sm text-ink-muted">
                  <th className="px-4 py-3">Carte</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Requis</th>
                  <th className="px-4 py-3">Disponible</th>
                  <th className="px-4 py-3">Manque</th>
                </tr>
              </thead>
              <tbody>
                {analyse.analysis.lines.map((ligne) => {
                  const carte = analyse.cards[ligne.cardId];
                  const section = ligne.section ?? "GENERIC";
                  return (
                    <tr key={`${ligne.cardId}-${section}`} className="border-b border-hairline last:border-0 hover:bg-surface-raised">
                      <td className="px-4 py-3 text-sm text-ink">
                        {carte?.name ?? ligne.cardId}
                        {ligne.limiting && (
                          <span className="ml-2 rounded-full bg-gold/10 px-2 py-0.5 text-xs text-gold">Limitante</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-ink-secondary">{LIBELLES_SECTION[section]}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-ink">{ligne.quantity}</td>
                      <td className="px-4 py-3 text-sm tabular-nums text-ink">{ligne.availableQuantity}</td>
                      <td className={`px-4 py-3 text-sm tabular-nums ${ligne.missingQuantity > 0 ? "text-danger" : "text-ink-secondary"}`}>
                        {ligne.missingQuantity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-hairline bg-surface p-4">
        <label className="block text-sm text-ink-secondary">
          Nom de la recette
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-1 w-full min-w-[280px] rounded-lg border border-hairline bg-canvas px-3 py-2 text-ink"
          />
        </label>
        <button
          type="button"
          onClick={() => void creerRecette()}
          disabled={creation || !nom.trim() || !languageId}
          className="rounded-lg bg-arcane px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {creation ? "Création…" : "Créer la recette"}
        </button>
      </div>
    </div>
  );
}
