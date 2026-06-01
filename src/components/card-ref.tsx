"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DOMAIN_COLORS, DOMAIN_ICONS, DOMAIN_LABELS_FR, TYPE_LABELS_FR } from "@/lib/domains";

interface CardData {
  name: string;
  imageUrl: string | null;
  type?: string;
  energy?: number | null;
  might?: number | null;
  rarity?: string;
  domains?: string[];
}

const cache = new Map<string, CardData | null>();

const POP_W = 300;
const POP_H = 470; // image (~419 at 300w) + footer

function resized(url: string): string {
  if (url.includes("cmsassets.rgpub.io")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}w=600&q=80&auto=format`;
  }
  return url;
}

export function CardRef({ name, children }: { name: string; children?: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const [card, setCard] = useState<CardData | null>(cache.get(name) ?? null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const fetched = useRef(false);

  const fetchCard = useCallback(() => {
    if (fetched.current || cache.has(name)) return;
    fetched.current = true;
    fetch(`/api/cards/preview?name=${encodeURIComponent(name)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        cache.set(name, data);
        setCard(data);
      })
      .catch(() => {});
  }, [name]);

  const place = useCallback(() => {
    if (!ref.current) return;
    // Anchor on the first client rect so a name wrapping across two lines
    // still positions the preview against where the word actually starts.
    const rects = ref.current.getClientRects();
    const rect = rects.length ? rects[0] : ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = rect.left + rect.width / 2 - POP_W / 2;
    left = Math.max(8, Math.min(left, vw - POP_W - 8));
    let top = rect.top - POP_H - 10; // prefer above the word
    if (top < 8) top = rect.bottom + 10; // otherwise below
    top = Math.max(8, Math.min(top, vh - POP_H - 8));
    setPos({ top, left });
  }, []);

  const show = useCallback(() => {
    setHovered(true);
    fetchCard();
    place();
  }, [fetchCard, place]);

  useEffect(() => {
    if (cache.has(name) && !card) setCard(cache.get(name) ?? null);
  }, [name, card]);

  return (
    <>
      <span
        ref={ref}
        className="cursor-help border-b border-dotted border-arcane/40 text-arcane transition-colors hover:border-arcane hover:text-arcane-vivid"
        onMouseEnter={show}
        onMouseLeave={() => setHovered(false)}
      >
        {children ?? name}
      </span>
      {hovered && card?.imageUrl && pos && (
        <span
          className="pointer-events-none fixed z-[200] block overflow-hidden rounded-2xl border border-hairline bg-surface shadow-2xl"
          style={{ top: pos.top, left: pos.left, width: POP_W }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resized(card.imageUrl)} alt={card.name} className="block w-full bg-canvas" />
          <span className="block space-y-1.5 px-3 py-2.5">
            <span className="block text-sm font-bold leading-tight text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              {card.name}
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {card.type && <span className="text-ink-muted">{TYPE_LABELS_FR[card.type] ?? card.type}</span>}
              {card.energy != null && (
                <span className="inline-flex items-center gap-1 font-semibold text-yellow-400">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/SwordIconRB.webp" alt="" className="h-3.5 w-3.5" />
                  {card.energy}
                </span>
              )}
              {card.might != null && (
                <span className="inline-flex items-center gap-1 font-semibold text-red-400">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/OverNumbered.webp" alt="" className="h-3.5 w-3.5" />
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
          </span>
        </span>
      )}
    </>
  );
}
