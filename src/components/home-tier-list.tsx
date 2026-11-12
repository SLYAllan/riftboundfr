"use client";

import { classePastilleSet } from "@/components/pastille-set";
import { useState } from "react";
import Link from "@/components/lien";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { cn, displayLegendName, formatDate } from "@/lib/utils";
import { TIER_BANNER, TIER_ORDER } from "@/lib/tier-colors";
import { etiquetteLocale } from "@/lib/i18n";
import { useLangue, useT } from "@/components/i18n-provider";

interface TierListData {
  id: string;
  title: string;
  setContext: string | null;
  current: boolean;
  updatedAt: Date;
  entries: {
    id: string;
    legendId: string;
    legendName: string;
    tier: string;
    comment: string | null;
  }[];
}

interface CardData {
  imageUrl: string | null;
  domains: string[];
}

const SET_SHORT: Record<string, string> = {
  Origins: "OGN",
  Spiritforged: "SFD",
  Unleashed: "UNL",
  Vendetta: "VEN",
  Radiance: "RAD",
  // OGN/SFD/UNL sont les codes officiels des sets. « Global » n'en est pas un :
  // c'est un libellé, il se dit en français.
  Global: "TOUS",
};

const tierOrder = TIER_ORDER;

export function HomeTierList({
  tierLists,
  legendMap,
  pages = {},
}: {
  tierLists: TierListData[];
  legendMap: Map<string, CardData>;
  /** Slug de la page de chaque Légende, par `legendId`. Sans page, la vignette n'est pas un lien. */
  pages?: Record<string, string>;
}) {
  const t = useT();
  const langue = useLangue();
  const currentIdx = tierLists.findIndex((tl) => tl.current);
  const [activeIdx, setActiveIdx] = useState(
    currentIdx >= 0 ? currentIdx : 0,
  );
  const active = tierLists[activeIdx];

  if (!tierLists.length) {
    return (
      <div className="rounded-card border border-hairline bg-surface overflow-hidden">
        <div className="px-4 py-12 text-center text-sm text-ink-muted">
          {t("Tier list à venir")}
        </div>
      </div>
    );
  }

  const groupBy = (entries: TierListData["entries"]) =>
    entries.reduce(
      (acc, entry) => {
        if (!acc[entry.tier]) acc[entry.tier] = [];
        acc[entry.tier].push(entry);
        return acc;
      },
      {} as Record<string, TierListData["entries"]>,
    );

  // Pas de zone qui défile : la carte montre tout son contenu. Pour qu'elle ne
  // change pas de taille au changement d'onglet, les onglets sont empilés dans la
  // même cellule de grille et seul l'actif est visible ; les autres restent dans le
  // flux et donnent à la carte la hauteur du plus grand onglet. self-start l'empêche
  // de s'étirer si une colonne voisine est plus haute.
  return (
    <div className="flex flex-col self-start rounded-card border border-hairline bg-surface overflow-hidden">
      <div className="shrink-0 border-b border-hairline px-4 py-3 flex items-center justify-between">
        {/* Titre volontairement différent de « Tier List » : l'accueil captait les
            requêtes à la place de /tier-list, qui porte le vrai classement commenté. */}
        <h2
          className="titre-bloc text-lg font-bold"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          {t("Aperçu du méta")}
        </h2>
        <Link
          href="/tier-list"
          className="min-h-11 sm:min-h-6 flex items-center gap-1 text-xs text-arcane hover:text-arcane-light"
        >
          {t("Tier list complète")} <ArrowRight size={14} />
        </Link>
      </div>

      {tierLists.length > 1 && (
        <div className="flex shrink-0 flex-wrap gap-1.5 border-b border-hairline px-4 py-3">
          {tierLists.map((tl, i) => (
            <button
              key={tl.id}
              onClick={() => setActiveIdx(i)}
              aria-pressed={activeIdx === i}
              className={classePastilleSet(activeIdx === i)}
            >
              {SET_SHORT[tl.setContext ?? ""] ?? tl.setContext ?? tl.title}
            </button>
          ))}
        </div>
      )}

      <p className="px-4 py-2 text-center text-xs text-ink-muted">
        {t("Mis à jour le")} {formatDate(active.updatedAt, etiquetteLocale(langue))}
      </p>

      {tierLists.some((tl) => tl.entries.length > 0) ? (
        <div className="grid">
          {tierLists.map((tl, listIdx) => {
            const isActive = listIdx === activeIdx;
            const g = groupBy(tl.entries);
            // Les noms courts portés par deux Légendes de la liste (les deux Master Yi,
            // parfois dans deux tiers différents) : celles-là gardent leur nom entier.
            const courts = tl.entries.map((e) => displayLegendName(e.legendName).split(",")[0]);
            const doublons = new Set(courts.filter((c, i) => courts.indexOf(c) !== i));
            return (
              <div
                key={tl.id}
                // Même cellule pour tous les onglets : les inactifs restent dans le
                // flux et fixent la hauteur sur le plus grand, donc la carte ne
                // bouge pas au clic. invisible les sort de l'ordre de tabulation
                // et de l'arbre d'accessibilité.
                className={cn("col-start-1 row-start-1", !isActive && "invisible")}
                aria-hidden={!isActive}
              >
                {tierOrder.map((tier, tierIdx) => {
                  const entries = g[tier];
                  if (!entries || entries.length === 0) return null;
                  const isFirst = tierOrder.slice(0, tierIdx).every((t) => !g[t]?.length);
                  const isLast = tierIdx === tierOrder.length - 1 || tierOrder.slice(tierIdx + 1).every((t) => !g[t]?.length);
                  return (
                    <div
                      key={tier}
                      className="flex border-b border-hairline/50 last:border-b-0"
                    >
                      <div
                        className={cn(
                          "flex w-14 shrink-0 items-center justify-center",
                          TIER_BANNER[tier]?.bg,
                          TIER_BANNER[tier]?.text,
                          isFirst && "rounded-tl-sm",
                          isLast && "rounded-bl-sm",
                        )}
                      >
                        <span
                          className="text-2xl font-black"
                          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                        >
                          {tier}
                        </span>
                      </div>
                      <div className="flex min-h-[52px] flex-1 flex-wrap gap-x-1 gap-y-1.5 p-2">
                        {entries.map((entry) => {
                          const card = legendMap.get(entry.legendId);
                          const court = displayLegendName(entry.legendName).split(",")[0];
                          const nom = doublons.has(court) ? displayLegendName(entry.legendName) : court;
                          // Onglet inactif : un carré vide à la place de l'image, pour
                          // ne rien télécharger. Le nom reste : il fait la hauteur de la
                          // vignette, et la carte ne doit pas bouger au changement d'onglet.
                          const contenu = (
                            <>
                              {isActive && card?.imageUrl ? (
                                <Image
                                  src={card.imageUrl}
                                  alt=""
                                  width={48}
                                  height={48}
                                  suppressHydrationWarning
                                  className="h-12 w-12 rounded-lg object-cover transition-transform group-hover:scale-105"
                                />
                              ) : (
                                <span className="h-12 w-12 rounded-lg bg-surface-raised" />
                              )}
                              <span className="line-clamp-2 w-full text-center text-xs leading-tight text-ink-secondary group-hover:text-ink">{nom}</span>
                            </>
                          );
                          const classe = "group flex w-[4.5rem] flex-col items-center gap-1 rounded-lg p-1";
                          const slug = pages[entry.legendId];
                          // Les noms sous les icônes : 36 visages sans nom demandaient de
                          // connaître chaque champion de vue.
                          return slug ? (
                            <Link
                              key={entry.id}
                              href={`/legendes/${slug}`}
                              title={displayLegendName(entry.legendName)}
                              className={cn(classe, "transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane")}
                            >
                              {contenu}
                            </Link>
                          ) : (
                            <div key={entry.id} title={displayLegendName(entry.legendName)} className={classe}>
                              {contenu}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 px-4 py-12 text-center text-sm text-ink-muted">
          {t("Tier list à venir")}
        </div>
      )}

      {/* Reste collé en bas de la carte, hors de la zone qui défile. */}
      <Link
        href="/tier-list"
        className="flex shrink-0 items-center justify-center gap-1 border-t border-hairline px-4 py-3 text-sm font-semibold text-arcane hover:bg-surface-raised hover:text-arcane-light"
      >
        {t("Tier list Riftbound complète, avec les decks")}
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
