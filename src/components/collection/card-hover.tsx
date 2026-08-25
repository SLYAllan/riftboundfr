"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { DOMAIN_COLORS, DOMAIN_ICONS, DOMAIN_LABELS_FR, TYPE_LABELS_FR } from "@/lib/domains";
import { CardTextRenderer } from "@/components/card-text-renderer";
import { useT } from "@/components/i18n-provider";

// Aperçu agrandi d'une carte au survol : popup en position fixe (jamais rognée
// par les conteneurs en overflow-hidden), placée au-dessus de la vignette ou
// en dessous si pas la place. Footer riche (énergie/might/domaines avec icônes),
// aligné sur l'aperçu [[carte]] des articles. Réutilise l'image déjà connue.
function resized(url: string, w: number): string {
  if (url.includes("cmsassets.rgpub.io")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}w=${Math.round(w * 2)}&q=80&auto=format`;
  }
  return url;
}

// Texte d'effet chargé à la demande : ni la couverture de deck ni le classeur ne
// le transportent, et l'ajouter à leurs deux chaînes de données pour un survol ne
// vaut pas le détour. Une seule requête par nom, mise en cache pour la session ;
// la route répond avec un cache d'une heure.
const textCache = new Map<string, string | null>();

export function CardHover({
  src, alt, name, type, energy, might, domains, note, width = 300, className, children,
}: {
  src: string | null;
  alt: string;
  name: string;
  type?: string | null;
  energy?: number | null;
  might?: number | null;
  domains?: string[];
  note?: React.ReactNode;
  width?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useT();
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [text, setText] = useState<string | null>(textCache.get(name) ?? null);
  const ref = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hovered) return;
    if (textCache.has(name)) {
      return;
    }
    let cancelled = false;
    fetch(`/api/cards/preview?name=${encodeURIComponent(name)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const t = d?.textPlain ?? null;
        textCache.set(name, t);
        if (!cancelled) setText(t);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hovered, name]);

  const texte = textCache.has(name) ? textCache.get(name) ?? null : text;

  // Une fois le popup rendu (opacity 0), on mesure sa hauteur RÉELLE puis on le
  // place au-dessus de la vignette - ou en dessous s'il n'y a pas la place - en
  // bornant systématiquement dans le viewport. Jamais hors écran.
  useLayoutEffect(() => {
    if (!hovered || !ref.current || !popRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const pop = popRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = pop.width || width;
    const h = pop.height;
    let left = rect.left + rect.width / 2 - w / 2;
    left = Math.max(8, Math.min(left, vw - w - 8));
    let top = rect.top - h - 10;
    if (top < 8) top = rect.bottom + 10;
    top = Math.max(8, Math.min(top, vh - h - 8));
    setPos({ top, left });
  }, [hovered, width]);

  return (
    <div
      ref={ref}
      className={className}
      tabIndex={0}
      role="button"
      aria-label={name}
      aria-expanded={hovered}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPos(null); }}
      onFocus={() => setHovered(true)}
      onBlur={() => { setHovered(false); setPos(null); }}
      onClick={() => setHovered(true)}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setHovered(false);
          setPos(null);
        }
      }}
    >
      {children}
      {hovered && src && (
        <div
          ref={popRef}
          className="pointer-events-none fixed z-[200] overflow-hidden rounded-2xl border border-hairline bg-surface shadow-2xl"
          style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, width, opacity: pos ? 1 : 0 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* aspectRatio réserve la hauteur AVANT chargement du bitmap : la mesure
              de placement est correcte d'emblée, donc pas de débordement post-load */}
          <img
            src={resized(src, width)}
            alt={alt}
            className="block w-full bg-canvas object-cover"
            // Champs de bataille en paysage (1038x744), le reste en portrait.
            style={{ aspectRatio: type === "Battlefield" ? "419 / 300" : "300 / 419" }}
          />
          <div className="space-y-1.5 px-3 py-2.5">
            <div className="text-sm font-bold leading-tight text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              {name}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {type && <span className="text-ink-muted">{TYPE_LABELS_FR[type] ?? type}</span>}
              {/* Même correction que dans CardRef : l'énergie en pastille chiffrée,
                  la Puissance avec l'épée en blanc. */}
              {energy != null && (
                <span className="inline-flex items-center gap-1 font-semibold text-ink-secondary">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-canvas">
                    {energy}
                  </span>{t("Énergie")}</span>
              )}
              {might != null && (
                <span className="inline-flex items-center gap-1 font-semibold text-red-400">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/SwordIconRB.webp" alt="Puissance" className="h-3.5 w-3.5 brightness-0 invert" />
                  {might}
                </span>
              )}
              {domains?.map((d) => (
                <span key={d} className="inline-flex items-center gap-1 font-semibold" style={{ color: DOMAIN_COLORS[d] ?? "#9ca3af" }}>
                  {DOMAIN_ICONS[d] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={DOMAIN_ICONS[d]} alt="" className="h-3 w-3" />
                  )}
                  {DOMAIN_LABELS_FR[d] ?? d}
                </span>
              ))}
            </div>
            {texte && (
              <div className="border-t border-hairline pt-1.5 text-xs text-ink-secondary">
                <CardTextRenderer text={texte} />
              </div>
            )}
            {note && <div className="text-xs">{note}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
