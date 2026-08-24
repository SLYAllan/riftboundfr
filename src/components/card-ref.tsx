"use client";

import { useState, useRef, useCallback, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { DOMAIN_COLORS, DOMAIN_ICONS, DOMAIN_LABELS_FR, TYPE_LABELS_FR } from "@/lib/domains";
import { CardTextRenderer } from "@/components/card-text-renderer";
import { useT } from "@/components/i18n-provider";
import { isBanned } from "@/lib/banned-cards";

interface CardData {
  name: string;
  imageUrl: string | null;
  type?: string;
  energy?: number | null;
  might?: number | null;
  rarity?: string;
  domains?: string[];
  textPlain?: string | null;
}

const cache = new Map<string, CardData | null>();

const POP_W = 300;

function resized(url: string): string {
  if (url.includes("cmsassets.rgpub.io")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}w=600&q=80&auto=format`;
  }
  return url;
}

export function CardRef({ name, href, children }: { name: string; href?: string; children?: React.ReactNode }) {
  const t = useT();
  const [hovered, setHovered] = useState(false);
  const [card, setCard] = useState<CardData | null>(cache.get(name) ?? null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const fetched = useRef(false);

  const fetchCard = useCallback(() => {
    // Déjà en cache (rempli par une autre occurrence de la même carte) :
    // appliquer la valeur à CETTE instance, sinon son aperçu reste vide.
    if (cache.has(name)) {
      setCard(cache.get(name) ?? null);
      return;
    }
    if (fetched.current) return;
    fetched.current = true;
    fetch(`/api/cards/preview?name=${encodeURIComponent(name)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        cache.set(name, data);
        setCard(data);
      })
      .catch(() => {});
  }, [name]);

  const show = useCallback(() => {
    setHovered(true);
    fetchCard();
  }, [fetchCard]);

  // Mesure la hauteur RÉELLE du popup une fois rendu (opacity 0) puis le place
  // au-dessus du mot - ou en dessous faute de place - toujours borné dans le
  // viewport. Jamais hors écran, quelle que soit la hauteur du footer.
  useLayoutEffect(() => {
    if (!hovered || !ref.current || !popRef.current) return;
    // On se cale sur le premier rectangle : un nom coupé sur deux lignes plaçait
    // l'aperçu au milieu du bloc, loin du mot survolé.
    const rects = ref.current.getClientRects();
    const rect = rects.length ? rects[0] : ref.current.getBoundingClientRect();
    const pop = popRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = pop.width || POP_W;
    const h = pop.height;
    let left = rect.left + rect.width / 2 - w / 2;
    left = Math.max(8, Math.min(left, vw - w - 8));
    let top = rect.top - h - 10; // au-dessus du mot de préférence
    if (top < 8) top = rect.bottom + 10; // en dessous s'il n'y a pas la place
    top = Math.max(8, Math.min(top, vh - h - 8));
    setPos({ top, left });
  }, [hovered, card]);

  // Lien SSR vers la fiche carte quand href est fourni (maillage interne) ; sinon
  // simple ancrage de survol. Le mot reste identique, le hover marche dans les deux cas.
  const cls = "border-b border-dotted border-arcane/40 text-arcane transition-colors hover:border-arcane hover:text-arcane-vivid";

  // Toute mention de carte passe par ici : guides, fiches Légendes, articles. Marquer
  // le bannissement dans le rendu plutôt que dans chaque texte évite de relire la prose
  // à chaque mise à jour de la ban list, et couvre les textes qu'on ne réécrit pas.
  const banni = isBanned(name);
  const contenu = (
    <>
      {children ?? name}
      {banni && (
        <span className="ml-1 rounded bg-red-500/15 px-1 py-0.5 text-[10px] font-bold text-red-400">
          bannie
        </span>
      )}
    </>
  );

  return (
    <>
      {href ? (
        <a
          ref={ref as React.RefObject<HTMLAnchorElement>}
          href={href}
          className={`cursor-pointer ${cls}`}
          onMouseEnter={show}
          onMouseLeave={() => { setHovered(false); setPos(null); }}
          onFocus={show}
          onBlur={() => { setHovered(false); setPos(null); }}
        >
          {contenu}
        </a>
      ) : (
        <span
          ref={ref as React.RefObject<HTMLSpanElement>}
          className={`cursor-help ${cls}`}
          tabIndex={0}
          aria-label={name}
          onMouseEnter={show}
          onMouseLeave={() => { setHovered(false); setPos(null); }}
          onFocus={show}
          onBlur={() => { setHovered(false); setPos(null); }}
        >
          {contenu}
        </span>
      )}
      {hovered && card?.imageUrl && (
        <span
          ref={popRef}
          className="pointer-events-none fixed z-[200] block overflow-hidden rounded-2xl border border-hairline bg-surface shadow-2xl"
          style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, width: POP_W, opacity: pos ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* aspectRatio réserve la hauteur AVANT chargement du bitmap : la mesure
              de placement est correcte d'emblée, donc pas de débordement post-load */}
          <img
            src={resized(card.imageUrl)}
            alt={card.name}
            className="block w-full bg-canvas object-cover"
            // Les champs de bataille sont en paysage (1038x744), tout le reste en
            // portrait. Avec un seul ratio, le terrain était rogné de moitié.
            style={{ aspectRatio: card.type === "Battlefield" ? "419 / 300" : "300 / 419" }}
          />
          <span className="block space-y-1.5 px-3 py-2.5">
            <span className="block text-sm font-bold leading-tight text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              {card.name}
            </span>
            {banni && (
              <span className="block text-xs font-semibold text-red-400">
                {t("Bannie en construit")}
              </span>
            )}
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {card.type && <span className="text-ink-muted">{TYPE_LABELS_FR[card.type] ?? card.type}</span>}
              {/* Énergie en pastille chiffrée, Puissance avec l'épée : c'était
                  l'inverse, l'énergie portait l'épée de Puissance et la Puissance
                  l'icône des surnuméraires, noire sur fond sombre donc invisible.
                  Même rendu que CardTextRenderer. */}
              {card.energy != null && (
                <span className="inline-flex items-center gap-1 font-semibold text-ink-secondary">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-canvas">
                    {card.energy}
                  </span>{t("Énergie")}</span>
              )}
              {card.might != null && (
                <span className="inline-flex items-center gap-1 font-semibold text-red-400">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/SwordIconRB.webp" alt="Puissance" className="h-3.5 w-3.5 brightness-0 invert" />
                  {card.might}
                </span>
              )}
              {card.domains?.map((d) => (
                <span key={d} className="inline-flex items-center gap-1 font-semibold" style={{ color: DOMAIN_COLORS[d] ?? "#9ca3af" }}>
                  {DOMAIN_ICONS[d] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={DOMAIN_ICONS[d]} alt="" className="h-3 w-3" />
                  )}
                  {DOMAIN_LABELS_FR[d] ?? d}
                </span>
              ))}
            </span>
            {card.textPlain && (
              <span className="block border-t border-hairline pt-1.5 text-xs text-ink-secondary">
                <CardTextRenderer text={card.textPlain} />
              </span>
            )}
          </span>
        </span>
      )}
    </>
  );
}
