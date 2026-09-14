"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { History, ChevronDown, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/components/i18n-provider";
import type { ResumeVersion, SectionDeck } from "@/lib/deck-diff";

interface Changement {
  nom: string;
  section: SectionDeck;
  avant: number;
  apres: number;
}

interface Version {
  id: string;
  version: number;
  changelog: string | null;
  createdAt: string;
  /** Le code de CETTE version. C'est lui qu'on renvoie pour y revenir. */
  deckCode: string;
  resume: ResumeVersion;
  changements: Changement[];
}

interface Props {
  currentVersion: number;
  history: Version[];
  shareCode: string;
  estAuteur: boolean;
}

const NOM_SECTION: Record<SectionDeck, string> = {
  legend: "Légende",
  champion: "Champion",
  main: "Deck principal",
  rune: "Runes",
  battlefield: "Champs de bataille",
  side: "Réserve",
};

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const jour = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/** Une pastille de résumé : chiffre coloré sur fond neutre, jamais l'inverse. */
function Pastille({ children, ton }: { children: React.ReactNode; ton?: "plus" | "moins" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-surface-raised px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        ton === "plus" ? "text-success" : ton === "moins" ? "text-error" : "text-ink-secondary",
      )}
    >
      {children}
    </span>
  );
}

/**
 * L'écart de courbe, en barres.
 *
 * En texte, la même chose donnait « +4 à 1 énergie, +1 à 2 énergie, -6 à
 * 3 énergie, -3 à 5 énergie… » : douze pastilles à déchiffrer une par une pour
 * une information qui est une FORME. Une barre vers le haut, une barre vers le
 * bas, et le coût dessous : on voit d'un coup si le deck s'est alourdi.
 *
 * Les hauteurs sont en style en ligne : une classe Tailwind construite par
 * concaténation n'est pas engendrée.
 */
function CourbeDelta({ courbe }: { courbe: ResumeVersion["courbe"] }) {
  const t = useT();
  if (courbe.length === 0) return null;
  const max = Math.max(...courbe.map((c) => Math.abs(c.delta)));

  return (
    <div className="mt-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
        {t("Courbe")}
      </div>
      <div className="mt-1 flex items-end gap-1 overflow-x-auto pb-0.5">
        {courbe.map((c) => {
          const hauteur = Math.max(2, Math.round((Math.abs(c.delta) / max) * 18));
          return (
            <div
              key={c.energie}
              className="flex w-5 shrink-0 flex-col items-center"
              title={`${c.delta > 0 ? "+" : ""}${c.delta} ${t("à")} ${c.energie} ${t("énergie")}`}
            >
              <div className="flex h-[18px] w-full items-end justify-center">
                {c.delta > 0 && <div className="w-3 rounded-t-sm bg-success" style={{ height: hauteur }} />}
              </div>
              <div className="h-px w-full bg-hairline-strong" />
              <div className="flex h-[18px] w-full items-start justify-center">
                {c.delta < 0 && <div className="w-3 rounded-b-sm bg-error" style={{ height: hauteur }} />}
              </div>
              <div className="mt-0.5 text-[10px] tabular-nums text-ink-muted">{c.energie}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Les cartes qui entrent ou qui sortent, en une colonne. */
function Colonne({ titre, ton, lignes }: { titre: string; ton: "plus" | "moins"; lignes: Changement[] }) {
  const t = useT();
  if (lignes.length === 0) return null;
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{titre}</div>
      <ul className="mt-1 space-y-1">
        {lignes.map((c) => {
          const delta = Math.abs(c.apres - c.avant);
          return (
            <li key={`${c.section}-${c.nom}`} className="flex items-baseline gap-1.5 text-sm">
              <span className={cn("shrink-0 font-semibold tabular-nums", ton === "plus" ? "text-success" : "text-error")}>
                {ton === "plus" ? "+" : "−"}{delta}
              </span>
              <span className="min-w-0 break-words text-ink-secondary">
                {c.nom}
                {c.section !== "main" && (
                  <span className="text-ink-muted"> · {t(NOM_SECTION[c.section])}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function VersionHistory({ currentVersion, history, shareCode, estAuteur }: Props) {
  const t = useT();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Le numéro de version qu'on s'apprête à restaurer. Deux temps, exprès : le
  // retour arrière réécrit la liste publiée, celle que d'autres ont en lien.
  const [aConfirmer, setAConfirmer] = useState<number | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  if (currentVersion <= 1 || history.length === 0) return null;

  const revenir = async (v: Version) => {
    setEnCours(true);
    setErreur(null);
    try {
      // Pas de route dédiée : renvoyer un ancien code au PATCH existant range
      // la version courante dans l'historique et repart d'elle. Une restauration
      // est une mise à jour comme une autre, elle ne s'efface pas. Le serveur
      // revalide la liste : une version que les règles ne passent plus (réserve
      // à 8, carte bannie depuis) est refusée, et on affiche pourquoi.
      const res = await fetch(`/api/community-decks/${shareCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckCode: v.deckCode,
          changelog: `Retour à la version ${v.version}`,
        }),
      });
      if (!res.ok) {
        const corps = (await res.json().catch(() => null)) as { error?: string } | null;
        setErreur(corps?.error || t("Le retour arrière a échoué. Réessayez."));
        return;
      }
      setAConfirmer(null);
      router.refresh();
    } catch {
      setErreur(t("Le retour arrière a échoué. Vérifiez votre connexion."));
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="rounded-xl border border-hairline bg-surface">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex min-h-11 w-full cursor-pointer items-center justify-between px-4 py-3 transition-colors hover:bg-surface-raised/30"
      >
        <span className="flex items-center gap-2">
          <History size={15} className="text-ink-muted" aria-hidden="true" />
          <span className="text-sm font-semibold text-ink">{t("Historique des versions")}</span>
          <span className="rounded-full bg-surface-raised px-1.5 text-xs tabular-nums text-ink-muted">{history.length}</span>
        </span>
        <ChevronDown size={15} className={cn("text-ink-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>

      {open && (
        <div className="space-y-2 border-t border-hairline p-3">
          {erreur && (
            <p role="alert" className="rounded-lg bg-error/10 px-3 py-2 text-sm text-error-light">{erreur}</p>
          )}

          <div className="flex items-center gap-2 px-1 py-1">
            <span className="rounded-md bg-arcane px-1.5 py-0.5 text-xs font-bold tabular-nums text-canvas">v{currentVersion}</span>
            <span className="text-sm text-ink-secondary">{t("version publiée aujourd’hui")}</span>
          </div>

          {history.map((v) => {
            const entrees = v.changements.filter((c) => c.apres > c.avant);
            const sorties = v.changements.filter((c) => c.apres < c.avant);
            const { ajoutees, retirees, deltaEur, courbe } = v.resume;

            return (
              // Une carte par version, séparées : tout coulait d'un bloc et on ne
              // voyait plus où une version finissait et où la suivante commençait.
              <div key={v.id} className="rounded-lg border border-hairline bg-canvas/40 p-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="rounded-md bg-surface-raised px-1.5 py-0.5 text-xs font-bold tabular-nums text-ink-secondary">
                    v{v.version}
                  </span>
                  <span className="text-xs text-ink-muted">{jour.format(new Date(v.createdAt))}</span>

                  {estAuteur && aConfirmer !== v.version && (
                    <button
                      onClick={() => { setAConfirmer(v.version); setErreur(null); }}
                      className="ml-auto inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
                    >
                      <Undo2 size={13} aria-hidden="true" /> {t("Revenir")}
                    </button>
                  )}
                </div>

                {v.changelog && (
                  <p className="mt-1.5 border-l-2 border-hairline pl-2 text-sm italic text-ink-secondary">
                    {v.changelog}
                  </p>
                )}

                {(ajoutees > 0 || retirees > 0) && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {ajoutees > 0 && <Pastille ton="plus">+{ajoutees} {t(ajoutees > 1 ? "cartes" : "carte")}</Pastille>}
                    {retirees > 0 && <Pastille ton="moins">−{retirees} {t(retirees > 1 ? "cartes" : "carte")}</Pastille>}
                    {deltaEur != null && deltaEur !== 0 && (
                      <Pastille ton={deltaEur > 0 ? "moins" : "plus"}>
                        {deltaEur > 0 ? "+" : "−"}{euros.format(Math.abs(deltaEur))}
                      </Pastille>
                    )}
                  </div>
                )}

                <CourbeDelta courbe={courbe} />

                {(entrees.length > 0 || sorties.length > 0) && (
                  // Une seule colonne : le panneau vit dans une barre latérale de
                  // 300 px, et `sm:` regarde la FENÊTRE, pas le conteneur. Sur un
                  // écran large il coupait donc « Master Yi, Wuju Bladesman » sur
                  // trois lignes dans deux colonnes de 130 px.
                  <div className="mt-2.5 space-y-2">
                    <Colonne titre={t("Entrent")} ton="plus" lignes={entrees} />
                    <Colonne titre={t("Sortent")} ton="moins" lignes={sorties} />
                  </div>
                )}

                {estAuteur && aConfirmer === v.version && (
                  <div className="mt-3 rounded-lg border border-hairline bg-surface p-2.5">
                    <p className="text-sm text-ink-secondary">
                      {t("Republier la version")} v{v.version} ?{" "}
                      <span className="text-ink-muted">
                        {t("La version actuelle rejoint l’historique, elle n’est pas perdue.")}
                      </span>
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => revenir(v)}
                        disabled={enCours}
                        aria-busy={enCours}
                        className="inline-flex min-h-9 items-center rounded-lg bg-arcane px-3 text-sm font-semibold text-canvas transition-colors hover:bg-arcane-light disabled:opacity-70"
                      >
                        {enCours ? t("Retour en cours…") : t("Revenir à cette version")}
                      </button>
                      <button
                        onClick={() => { setAConfirmer(null); setErreur(null); }}
                        className="inline-flex min-h-9 items-center rounded-lg bg-surface-raised px-3 text-sm text-ink-secondary transition-colors hover:text-ink"
                      >
                        {t("Annuler")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
