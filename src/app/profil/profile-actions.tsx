"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Trash2 } from "lucide-react";
import { useT } from "@/components/i18n-provider";

interface ProfileActionsProps {
  username: string;
  riotGameName: string | null;
  riotTagLine: string | null;
}

// Hauteur des champs et des boutons : 44 px, le minimum tactile. Le reste de la
// page monte à peine à 30 px, mais ici on vise un formulaire utilisable au doigt.
const champCls =
  "mt-1 min-h-11 w-full rounded-lg border border-hairline bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-arcane";
const boutonCls = "flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors";

export function ProfileActions({ username, riotGameName, riotTagLine }: ProfileActionsProps) {
  const t = useT();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [newRiotName, setNewRiotName] = useState(riotGameName ?? "");
  const [newRiotTag, setNewRiotTag] = useState(riotTagLine ?? "");
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState("");

  const idPseudo = useId();
  const idRiotName = useId();
  const idRiotTag = useId();
  const idErreur = useId();

  const declencheur = useRef<HTMLButtonElement>(null);
  const premierChamp = useRef<HTMLInputElement>(null);
  // Sans ce drapeau, le bouton prendrait le focus au tout premier rendu de la page.
  const dejaOuvert = useRef(false);

  useEffect(() => {
    if (editing) {
      dejaOuvert.current = true;
      premierChamp.current?.focus();
    } else if (dejaOuvert.current) {
      declencheur.current?.focus();
    }
  }, [editing]);

  const fermer = () => {
    setEditing(false);
    setErreur(null);
    setNewUsername(username);
    setNewRiotName(riotGameName ?? "");
    setNewRiotTag(riotTagLine ?? "");
  };

  const save = async () => {
    setSaving(true);
    setErreur(null);
    setAnnonce(t("Enregistrement en cours"));
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim() || username,
          riotGameName: newRiotName.trim() || null,
          riotTagLine: newRiotTag.trim() || null,
        }),
      });
      if (!res.ok) {
        // Avant, un échec ne produisait rien : le bouton se réactivait et
        // l'utilisateur recliquait sans savoir que rien n'était parti.
        // SAFETY: /api/auth/profile repond { error: string } sur tout statut
        // non-2xx ; un corps illisible retombe sur null via le catch.
        const corps = (await res.json().catch(() => null)) as { error?: string } | null;
        const message = corps?.error || t("L’enregistrement a échoué. Réessayez.");
        setErreur(message);
        setAnnonce(message);
        return;
      }
      setAnnonce(t("Profil enregistré"));
      setEditing(false);
      router.refresh();
    } catch {
      const message = t("L’enregistrement a échoué. Vérifiez votre connexion.");
      setErreur(message);
      setAnnonce(message);
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <>
        <button
          ref={declencheur}
          onClick={() => setEditing(true)}
          className={`${boutonCls} bg-surface-raised text-ink-secondary hover:text-ink`}
        >
          <Pencil size={13} aria-hidden="true" /> {t("Modifier le profil")}
        </button>
        <span role="status" aria-live="polite" className="sr-only">{annonce}</span>
      </>
    );
  }

  return (
    <div className="space-y-3 rounded-card border border-hairline bg-surface p-4">
      <h2 className="text-sm font-semibold text-ink">{t("Modifier le profil")}</h2>
      {erreur && (
        <p id={idErreur} role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {erreur}
        </p>
      )}
      <div>
        <label htmlFor={idPseudo} className="text-xs font-medium text-ink-muted">{t("Pseudo")}</label>
        <input
          ref={premierChamp}
          id={idPseudo}
          name="username"
          autoComplete="username"
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          maxLength={30}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? idErreur : undefined}
          className={champCls}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={idRiotName} className="text-xs font-medium text-ink-muted">Riot ID</label>
          <input
            id={idRiotName}
            name="riotGameName"
            autoComplete="off"
            type="text"
            value={newRiotName}
            onChange={(e) => setNewRiotName(e.target.value)}
            placeholder="GameName"
            className={champCls}
          />
        </div>
        <div>
          <label htmlFor={idRiotTag} className="text-xs font-medium text-ink-muted">Tag</label>
          <input
            id={idRiotTag}
            name="riotTagLine"
            autoComplete="off"
            type="text"
            value={newRiotTag}
            onChange={(e) => setNewRiotTag(e.target.value)}
            placeholder="TAG"
            maxLength={5}
            className={champCls}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          aria-busy={saving}
          className={`${boutonCls} bg-arcane font-medium text-canvas hover:bg-arcane-light disabled:opacity-70`}
        >
          <Check size={14} aria-hidden="true" /> {saving ? t("Enregistrement…") : t("Enregistrer")}
        </button>
        <button onClick={fermer} className={`${boutonCls} bg-surface-raised text-ink-secondary hover:text-ink`}>
          <X size={14} aria-hidden="true" /> {t("Annuler")}
        </button>
      </div>
      <span role="status" aria-live="polite" className="sr-only">{annonce}</span>
    </div>
  );
}

/**
 * Suppression du compte. Deux temps, exprès : rien ne se répare après.
 *
 * L'écran de confirmation dit ce qui part et ce qui reste. Les decks publiés
 * restent en ligne sous « Anonyme » : d'autres les ont likés, commentés, mis en
 * lien, et les faire disparaître casserait leurs pages. Le taire aurait été pire
 * que de le dire.
 */
export function SupprimerCompte() {
  const t = useT();
  const [confirme, setConfirme] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const supprimer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const res = await fetch("/api/auth/profile", { method: "DELETE" });
      if (!res.ok) {
        const corps = (await res.json().catch(() => null)) as { error?: string } | null;
        setErreur(corps?.error || t("La suppression a échoué. Réessayez."));
        return;
      }
      // Rechargement complet et pas router.push : le cookie vient d'être retiré,
      // et tout l'état client encore en mémoire (collection, notifications)
      // parle d'un compte qui n'existe plus. Une navigation Next garderait ces
      // fournisseurs montés avec leurs données.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/";
    } catch {
      setErreur(t("La suppression a échoué. Vérifiez votre connexion."));
    } finally {
      setEnCours(false);
    }
  };

  if (!confirme) {
    return (
      <button
        onClick={() => setConfirme(true)}
        className={`${boutonCls} mt-3 text-error-light hover:bg-error/10`}
      >
        <Trash2 size={14} aria-hidden="true" /> {t("Supprimer mon compte")}
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-error/40 bg-error/5 p-4">
      <h3 className="text-sm font-semibold text-error-light">{t("Supprimer mon compte ?")}</h3>
      <p className="text-sm text-ink-secondary">
        Ta collection, tes classeurs, tes commentaires, tes j&apos;aime et ton overlay de stream
        seront effacés. C&apos;est sans retour.
      </p>
      <p className="text-sm text-ink-muted">
        Tes decks publiés restent en ligne, signés « Anonyme » : d&apos;autres joueurs les ont
        commentés et mis en lien.
      </p>
      {erreur && (
        <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error-light">{erreur}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={supprimer}
          disabled={enCours}
          aria-busy={enCours}
          className={`${boutonCls} bg-error font-medium text-canvas hover:bg-error/80 disabled:opacity-70`}
        >
          <Trash2 size={14} aria-hidden="true" />
          {enCours ? t("Suppression…") : t("Supprimer définitivement")}
        </button>
        <button
          onClick={() => { setConfirme(false); setErreur(null); }}
          className={`${boutonCls} bg-surface-raised text-ink-secondary hover:text-ink`}
        >
          <X size={14} aria-hidden="true" /> {t("Annuler")}
        </button>
      </div>
    </div>
  );
}
