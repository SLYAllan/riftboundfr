"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import { Smile } from "lucide-react";
import { LISTE_EMOTES } from "@/lib/emotes";
import { useT } from "@/components/i18n-provider";

interface Props {
  /** Le champ où insérer « :nom: », au curseur. */
  champRef: RefObject<HTMLTextAreaElement | null>;
  /** Appelé avec le nouveau texte : le champ est contrôlé côté parent. */
  onTexte: (texte: string) => void;
}

/**
 * Menu d'incrustations. Insère « :nom: » à la position du curseur plutôt qu'à
 * la fin, sinon écrire au milieu d'une phrase oblige à tout retaper.
 */
export function EmotePicker({ champRef, onTexte }: Props) {
  const t = useT();
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState("");
  const panneauRef = useRef<HTMLDivElement>(null);
  const boutonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    const onTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvert(false);
        boutonRef.current?.focus();
      }
    };
    const onClic = (e: PointerEvent) => {
      const cible = e.target as Node;
      if (!panneauRef.current?.contains(cible) && !boutonRef.current?.contains(cible)) setOuvert(false);
    };
    document.addEventListener("keydown", onTouche);
    document.addEventListener("pointerdown", onClic);
    return () => {
      document.removeEventListener("keydown", onTouche);
      document.removeEventListener("pointerdown", onClic);
    };
  }, [ouvert]);

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return LISTE_EMOTES;
    return LISTE_EMOTES.filter((e) => e.nom.includes(q) || e.label.toLowerCase().includes(q));
  }, [recherche]);

  function inserer(nom: string) {
    const champ = champRef.current;
    const jeton = `:${nom}:`;
    if (!champ) return;
    const debut = champ.selectionStart ?? champ.value.length;
    const fin = champ.selectionEnd ?? debut;
    // Une espace de chaque côté, mais seulement si elle manque : sinon on
    // obtient « joue  :irelia: » avec deux espaces.
    const avant = champ.value.slice(0, debut);
    const apres = champ.value.slice(fin);
    const sepAvant = avant && !/\s$/.test(avant) ? " " : "";
    const sepApres = apres && /^\s/.test(apres) ? "" : " ";
    onTexte(avant + sepAvant + jeton + sepApres + apres);
    requestAnimationFrame(() => {
      const pos = debut + sepAvant.length + jeton.length + sepApres.length;
      champ.focus();
      champ.setSelectionRange(pos, pos);
    });
  }

  const domaines = liste.filter((e) => e.categorie === "domaine");
  const legendes = liste.filter((e) => e.categorie === "legende");

  return (
    <div className="relative">
      <button
        ref={boutonRef}
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-haspopup="dialog"
        aria-label={t("Insérer une icône")}
        className="flex size-9 items-center justify-center rounded-lg text-ink-muted transition-[color,background-color,scale] hover:bg-surface-raised hover:text-ink active:scale-[0.96]"
      >
        <Smile size={18} />
      </button>

      {ouvert && (
        <div
          ref={panneauRef}
          role="dialog"
          aria-label={t("Icônes")}
          className="absolute bottom-11 left-0 z-30 w-72 rounded-xl border border-hairline-strong bg-surface-raised p-3 shadow-2xl"
        >
          <input
            autoFocus
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder={t("Chercher une icône…")}
            aria-label={t("Chercher une icône")}
            className="h-9 w-full rounded-lg border border-hairline bg-canvas px-2.5 text-base sm:text-sm"
          />

          <div className="thin-scrollbar mt-3 max-h-64 overflow-y-auto">
            {liste.length === 0 && (
              <p className="py-6 text-center text-xs text-ink-muted">
                {t("Aucune icône pour")} « {recherche} »
              </p>
            )}

            {[
              [t("Domaines"), domaines] as const,
              [t("Légendes"), legendes] as const,
            ].map(([titre, groupe]) =>
              groupe.length === 0 ? null : (
                <div key={titre} className="mb-3 last:mb-0">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{titre}</p>
                  <div className="grid grid-cols-6 gap-1">
                    {groupe.map((e) => (
                      <button
                        key={e.nom}
                        type="button"
                        onClick={() => inserer(e.nom)}
                        title={`${e.label}  :${e.nom}:`}
                        aria-label={e.label}
                        className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-surface"
                      >
                        <Image src={e.src} alt="" width={24} height={24} className="size-6 object-contain" unoptimized />
                      </button>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
