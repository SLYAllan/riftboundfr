"use client";

import { useState, useRef, useLayoutEffect } from "react";
import { DOMAIN_COLORS, DOMAIN_ICONS, DOMAIN_LABELS_FR, TYPE_LABELS_FR } from "@/lib/domains";

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
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Une fois le popup rendu (opacity 0), on mesure sa hauteur RÉELLE puis on le
  // place au-dessus de la vignette — ou en dessous s'il n'y a pas la place — en
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPos(null); }}
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
          <img src={resized(src, width)} alt={alt} className="block w-full bg-canvas object-cover" style={{ aspectRatio: "300 / 419" }} />
          <div className="space-y-1.5 px-3 py-2.5">
            <div className="text-sm font-bold leading-tight text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              {name}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {type && <span className="text-ink-muted">{TYPE_LABELS_FR[type] ?? type}</span>}
              {energy != null && (
                <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/SwordIconRB.webp" alt="" className="h-3.5 w-3.5" />
                  {energy}
                </span>
              )}
              {might != null && (
                <span className="inline-flex items-center gap-1 font-semibold text-red-400">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/OverNumbered.webp" alt="" className="h-3.5 w-3.5" />
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
            {note && <div className="text-xs">{note}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
