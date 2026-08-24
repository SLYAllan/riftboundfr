"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, LogOut } from "lucide-react";
import { useT } from "@/components/i18n-provider";

const boutonCls =
  "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors";

export function DeckActions({ shareCode, isPublic, titre }: { shareCode: string; isPublic: boolean; titre: string }) {
  const t = useT();
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [confirme, setConfirme] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState("");

  const appeler = async (methode: "PATCH" | "DELETE", corps?: { isPublic: boolean }) => {
    setEnCours(true);
    setErreur(null);
    try {
      const res = await fetch(`/api/community-decks/${shareCode}`, {
        method: methode,
        headers: corps ? { "Content-Type": "application/json" } : undefined,
        body: corps ? JSON.stringify(corps) : undefined,
      });
      if (!res.ok) {
        // SAFETY: nos routes /api/community-decks repondent { error: string } sur
        // tout statut non-2xx ; un corps illisible retombe sur null via le catch.
        const donnees = (await res.json().catch(() => null)) as { error?: string } | null;
        const message = donnees?.error || t("Action impossible. Réessaie.");
        setErreur(message);
        setAnnonce(message);
        return;
      }
      setAnnonce(methode === "DELETE" ? t("Deck supprimé") : t("Visibilité modifiée"));
      router.refresh();
    } catch {
      const message = t("Action impossible. Vérifie ta connexion.");
      setErreur(message);
      setAnnonce(message);
    } finally {
      setEnCours(false);
      setConfirme(false);
    }
  };

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <button
        onClick={() => appeler("PATCH", { isPublic: !isPublic })}
        disabled={enCours}
        aria-busy={enCours}
        className={`${boutonCls} bg-surface-raised text-ink-secondary hover:text-ink disabled:opacity-70`}
      >
        {isPublic ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
        {isPublic ? t("Rendre privé") : t("Rendre public")}
        <span className="sr-only">, {titre}</span>
      </button>

      {/* Deux temps plutôt qu'une fenêtre de confirmation : la suppression est
          définitive, mais une modale demanderait un piège à focus pour un seul
          bouton. Passer à une modale le jour où d'autres actions s'y ajoutent. */}
      <button
        onClick={() => (confirme ? appeler("DELETE") : setConfirme(true))}
        onBlur={() => setConfirme(false)}
        disabled={enCours}
        aria-busy={enCours}
        className={`${boutonCls} ${confirme ? "bg-red-500 text-white" : "bg-surface-raised text-ink-secondary hover:text-red-400"} disabled:opacity-70`}
      >
        <Trash2 size={13} aria-hidden="true" />
        {confirme ? t("Confirmer la suppression") : t("Supprimer")}
        <span className="sr-only">, {titre}</span>
      </button>

      {erreur && (
        <p role="alert" className="w-full text-xs text-red-400">{erreur}</p>
      )}
      <span role="status" aria-live="polite" className="sr-only">{annonce}</span>
    </div>
  );
}

export function BoutonDeconnexion() {
  const t = useT();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  // Sans contrôle de `r.ok`, une déconnexion refusée renvoyait quand même vers
  // l'accueil : l'utilisateur se croyait déconnecté alors que son cookie tenait
  // toujours. Et un échec réseau laissait le bouton grisé sans un mot.
  const deconnecter = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        setErreur(t("Déconnexion impossible. Réessaie."));
        setEnCours(false);
        return;
      }
      window.location.href = "/";
    } catch {
      setErreur(t("Déconnexion impossible. Vérifie ta connexion."));
      setEnCours(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={deconnecter}
        disabled={enCours}
        aria-busy={enCours}
        className={`${boutonCls} bg-surface-raised text-ink-secondary hover:text-ink disabled:opacity-70`}
      >
        <LogOut size={13} aria-hidden="true" /> {enCours ? t("Déconnexion…") : t("Déconnexion")}
      </button>
      {erreur && <p role="alert" className="text-xs text-red-400">{erreur}</p>}
    </div>
  );
}
