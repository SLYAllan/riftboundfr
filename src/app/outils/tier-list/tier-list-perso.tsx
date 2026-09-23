"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIER_BANNER } from "@/lib/tier-colors";
import { useT } from "@/components/i18n-provider";
import { Bouton } from "@/components/bouton";
import {
  RANGS,
  TITRE_MAX,
  classementVide,
  ecrireClassement,
  nomsCourts,
  ranger,
  type Classement,
  type Rang,
} from "@/lib/tier-list-perso";

export interface LegendeATrier {
  slug: string;
  nom: string;
  icone: string | null;
}

interface Props {
  legendes: LegendeATrier[];
  initial: Classement;
  titreInitial: string;
  /** La tier list en cours du site, pour partir d'elle plutôt que de zéro. */
  officiel: Classement | null;
}

export function TierListPerso({ legendes, initial, titreInitial, officiel }: Props) {
  const t = useT();
  const [classement, setClassement] = useState<Classement>(initial);
  const [titre, setTitre] = useState(titreInitial);
  const [choisie, setChoisie] = useState<string | null>(null);
  const [survol, setSurvol] = useState<Rang | "reserve" | null>(null);
  const [copie, setCopie] = useState<"" | "ok" | "erreur">("");
  const parSlug = useMemo(() => new Map(legendes.map((l) => [l.slug, l])), [legendes]);
  const courts = useMemo(() => nomsCourts(legendes), [legendes]);
  const rangees = new Set(RANGS.flatMap((r) => classement[r]));
  const reserve = legendes.filter((l) => !rangees.has(l.slug));

  // L'adresse porte le classement : c'est elle qu'on partage, et un rechargement
  // ne perd rien. `replaceState` et pas `pushState` : cinquante Légendes rangées
  // ne doivent pas laisser cinquante pas dans le bouton « Précédent ».
  useEffect(() => {
    const q = ecrireClassement(classement, titre).toString();
    window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
  }, [classement, titre]);

  function poser(rang: Rang | null, slug: string | null = choisie) {
    setSurvol(null);
    if (!slug || !parSlug.has(slug)) return;
    setClassement((c) => ranger(c, slug, rang));
    setChoisie(null);
    setCopie("");
  }

  function remplacer(par: Classement) {
    if (rangees.size > 0 && !window.confirm(t("Remplacer votre classement ?"))) return;
    setClassement(par);
    setChoisie(null);
    setCopie("");
  }

  async function copier() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopie("ok");
    } catch {
      setCopie("erreur");
    }
  }

  const deposer = (rang: Rang | null) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setSurvol(rang ?? "reserve");
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSurvol(null);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      poser(rang, e.dataTransfer.getData("text/plain"));
    },
  });

  const jeton = (slug: string) => {
    const legende = parSlug.get(slug);
    if (!legende) return null;
    const active = choisie === slug;
    return (
      <button
        key={slug}
        type="button"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", slug);
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => setSurvol(null)}
        onClick={() => setChoisie(active ? null : slug)}
        aria-pressed={active}
        aria-label={legende.nom}
        title={legende.nom}
        className={cn(
          "flex w-16 flex-col items-center gap-1 rounded-lg p-0.5 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane sm:w-[72px]",
          active && "scale-105 ring-2 ring-arcane",
        )}
      >
        {legende.icone ? (
          <Image
            src={legende.icone}
            alt=""
            width={72}
            height={72}
            draggable={false}
            className="h-12 w-12 rounded-lg object-cover sm:h-16 sm:w-16"
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-raised text-xs text-ink-muted sm:h-16 sm:w-16">
            ?
          </span>
        )}
        <span className="line-clamp-2 w-full text-center text-[10px] leading-tight text-ink-secondary">
          {courts.get(slug)}
        </span>
      </button>
    );
  };

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface p-3 lg:flex-row lg:items-center">
        <input
          value={titre}
          onChange={(e) => {
            setTitre(e.target.value.slice(0, TITRE_MAX));
            setCopie("");
          }}
          maxLength={TITRE_MAX}
          placeholder={t("Titre de votre tier list (facultatif)")}
          aria-label={t("Titre de votre tier list")}
          className="min-h-11 flex-1 rounded-lg border border-hairline-strong bg-surface-raised px-3 text-base text-ink placeholder:text-ink-muted sm:text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {officiel && (
            <Bouton onClick={() => remplacer(officiel)} variante="neutre" icone={<Sparkles />}>
              {t("Partir de la tier list du site")}
            </Bouton>
          )}
          <Bouton onClick={() => remplacer(classementVide())} disabled={rangees.size === 0} variante="neutre" icone={<RotateCcw />}>
            {t("Tout remettre à classer")}
          </Bouton>
          <Bouton data-suivi="partage_tier_list" onClick={() => void copier()} icone={copie === "ok" ? <Check /> : <Copy />}>
            {copie === "ok" ? t("Lien copié") : t("Copier le lien")}
          </Bouton>
        </div>
      </div>
      {copie === "erreur" && (
        <div role="alert" className="mt-2 text-sm text-red-400">
          {t("La copie a échoué. Copiez l’adresse à la main :")}
          <input
            readOnly
            value={window.location.href}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={t("Lien de votre tier list")}
            className="mt-1 block w-full rounded-lg border border-hairline-strong bg-surface-raised px-3 py-2 font-mono text-xs text-ink"
          />
        </div>
      )}

      <p className="mt-3 text-sm text-ink-muted">
        {t("Touchez une Légende, puis la lettre de son rang. À la souris, vous pouvez aussi la faire glisser.")}
      </p>

      {titre.trim() && (
        <h2 className="mt-6 text-2xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {titre.trim()}
        </h2>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-hairline">
        {RANGS.map((rang) => (
          <div key={rang} className="flex border-b border-hairline last:border-b-0" {...deposer(rang)}>
            {/* La lettre est le bouton : sans souris ni glisser, c'est par elle
                qu'on range la Légende choisie, au doigt comme au clavier. */}
            <button
              type="button"
              onClick={() => poser(rang)}
              disabled={!choisie}
              aria-label={`${t("Ranger en")} ${rang}`}
              className={cn(
                "flex w-14 shrink-0 items-center justify-center text-3xl font-black focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-canvas disabled:cursor-default sm:w-20 sm:text-4xl",
                TIER_BANNER[rang].bg,
                TIER_BANNER[rang].text,
              )}
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              {rang}
            </button>
            <div
              className={cn(
                "flex min-h-[88px] flex-1 flex-wrap content-start items-start gap-1.5 p-2 transition-colors sm:gap-2 sm:p-3",
                survol === rang ? "bg-surface-raised" : "bg-surface",
              )}
            >
              {classement[rang].map(jeton)}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-6" aria-labelledby="reserve-titre" {...deposer(null)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="reserve-titre" className="text-lg font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {t("À classer")} <span className="font-normal text-ink-muted">({reserve.length})</span>
          </h2>
          {choisie && rangees.has(choisie) && (
            <Bouton onClick={() => poser(null)} variante="neutre" icone={<RotateCcw />}>
              {t("Remettre à classer")}
            </Bouton>
          )}
        </div>
        <div
          className={cn(
            "mt-3 flex min-h-[88px] flex-wrap content-start gap-1.5 rounded-xl border border-dashed border-hairline-strong p-3 transition-colors sm:gap-2",
            survol === "reserve" && "bg-surface-raised",
          )}
        >
          {reserve.length > 0 ? (
            reserve.map((l) => jeton(l.slug))
          ) : (
            <p className="self-center text-sm text-ink-muted">{t("Toutes les Légendes sont classées.")}</p>
          )}
        </div>
      </section>
    </div>
  );
}
