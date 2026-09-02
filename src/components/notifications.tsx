"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/components/lien";
import { Bell, Heart, MessageSquare, Reply, ThumbsUp } from "lucide-react";
import { useT } from "@/components/i18n-provider";

interface Notification {
  id: string;
  genre: "reponse" | "commentaire" | "jaime" | "vote";
  auteur: string | null;
  sujet: string;
  extrait: string | null;
  lien: string;
  date: string;
  nouvelle: boolean;
}

const ICONES = { reponse: Reply, commentaire: MessageSquare, jaime: Heart, vote: ThumbsUp };

/**
 * Cloche des notifications.
 *
 * Elle ne s'affiche que pour un membre connecté : la route répond 401 sinon, et
 * on ne montre pas une cloche vide à un visiteur. Le compte se relit à
 * l'ouverture du panneau et toutes les deux minutes — pas plus souvent, ce sont
 * des réponses de forum, pas une messagerie.
 */
export function Notifications() {
  const t = useT();
  const [liste, setListe] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [visible, setVisible] = useState(false);
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState(false);
  const panneauRef = useRef<HTMLDivElement>(null);
  const boutonRef = useRef<HTMLButtonElement>(null);

  // `r.ok` puis la FORME : une route en panne rend `{ error: … }` avec un 500, et
  // sans ce contrôle l'objet finissait dans l'état, où le `.map` du rendu levait.
  const charger = useCallback(async () => {
    try {
      const r = await fetch("/api/notifications");
      if (r.status === 401) {
        setVisible(false);
        return;
      }
      if (!r.ok) throw new Error(String(r.status));
      const corps: unknown = await r.json();
      if (!corps || typeof corps !== "object" || !Array.isArray((corps as { liste?: unknown }).liste)) {
        throw new Error("réponse inattendue");
      }
      const donnees = corps as { liste: Notification[]; nonLues: number };
      setListe(donnees.liste);
      setNonLues(typeof donnees.nonLues === "number" ? donnees.nonLues : 0);
      setVisible(true);
      setErreur(false);
    } catch {
      setErreur(true);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void charger());
    const minuteur = setInterval(() => void charger(), 120_000);
    return () => clearInterval(minuteur);
  }, [charger]);

  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvert(false);
        boutonRef.current?.focus();
      }
    };
    const surClic = (e: PointerEvent) => {
      const cible = e.target as Node;
      if (!panneauRef.current?.contains(cible) && !boutonRef.current?.contains(cible)) setOuvert(false);
    };
    document.addEventListener("keydown", surTouche);
    document.addEventListener("pointerdown", surClic);
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.removeEventListener("pointerdown", surClic);
    };
  }, [ouvert]);

  async function basculer() {
    const ouvre = !ouvert;
    setOuvert(ouvre);
    if (!ouvre) return;
    await charger();
    if (nonLues === 0) return;
    // La pastille tombe tout de suite : le panneau est ouvert, c'est lu. Les
    // lignes gardent leur point le temps de cette ouverture, pour qu'on voie
    // lesquelles sont neuves.
    setNonLues(0);
    try {
      await fetch("/api/notifications", { method: "POST" });
    } catch {
      /* la date se reposera à la prochaine ouverture */
    }
  }

  if (!visible) return null;

  return (
    <div className="relative">
      <button
        ref={boutonRef}
        type="button"
        onClick={() => void basculer()}
        aria-expanded={ouvert}
        aria-haspopup="dialog"
        aria-label={nonLues > 0 ? `${t("Notifications")} : ${nonLues} ${t("non lues")}` : t("Notifications")}
        className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-ink-secondary transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane"
      >
        <Bell size={18} aria-hidden />
        {nonLues > 0 && (
          <span className="absolute right-1 top-1 min-w-4 rounded-full bg-arcane px-1 text-[10px] font-bold leading-4 text-canvas">
            {nonLues > 9 ? "9+" : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div
          ref={panneauRef}
          role="dialog"
          aria-label={t("Notifications")}
          // Ancré à DROITE des deux côtés : la cloche touche le bord droit de la
          // barre en grand écran comme en petit. Aligné à gauche, le panneau de
          // 320 px sortait de l'écran par la droite et ajoutait une barre de
          // défilement horizontale à toute la page.
          className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-hairline bg-surface p-1 shadow-xl"
        >
          <p className="border-b border-hairline px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {t("Notifications")}
          </p>

          {erreur && (
            <div role="alert" className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-error-light">
              <span>{t("Les notifications n’ont pas pu se charger.")}</span>
              <button type="button" onClick={() => void charger()} className="min-h-11 shrink-0 font-semibold underline">
                {t("Réessayer")}
              </button>
            </div>
          )}

          {!erreur && liste.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-muted">{t("Rien de neuf pour le moment.")}</p>
          )}

          <div className="thin-scrollbar max-h-96 overflow-y-auto">
            {liste.map((n) => {
              const Icone = ICONES[n.genre];
              return (
                <Link
                  key={n.id}
                  href={n.lien}
                  onClick={() => setOuvert(false)}
                  className="flex gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane"
                >
                  <Icone size={14} className={n.nouvelle ? "mt-0.5 shrink-0 text-arcane" : "mt-0.5 shrink-0 text-ink-muted"} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink">{libelle(t, n)}</span>
                    {n.extrait && <span className="mt-0.5 block truncate text-xs text-ink-muted">{n.extrait}</span>}
                    <span className="mt-0.5 block text-[11px] text-ink-muted">{ilYA(n.date)}</span>
                  </span>
                  {n.nouvelle && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-arcane" aria-hidden />}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function libelle(t: (s: string) => string, n: Notification): string {
  const sujet = n.sujet ? ` « ${n.sujet} »` : "";
  if (n.genre === "reponse") return `${n.auteur} ${t("a répondu à votre commentaire")}${sujet}`;
  if (n.genre === "commentaire") return `${n.auteur} ${t("a commenté votre deck")}${sujet}`;
  if (n.genre === "jaime") return `${t("Nouveau j’aime sur votre deck")}${sujet}`;
  return `${t("Votre commentaire a reçu un vote")}${sujet}`;
}

function ilYA(date: string): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (minutes < 1) return "à l’instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  if (jours < 30) return `il y a ${jours} j`;
  return new Date(date).toLocaleDateString("fr-FR");
}
