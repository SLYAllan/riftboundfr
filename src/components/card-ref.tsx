"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface CardData {
  name: string;
  imageUrl: string | null;
}

const cache = new Map<string, CardData | null>();

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

  const show = useCallback(() => {
    setHovered(true);
    fetchCard();
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    const left = spaceRight > 260 ? rect.right + 8 : rect.left - 252;
    const top = Math.max(8, Math.min(rect.top - 40, window.innerHeight - 380));
    setPos({ top, left });
  }, [fetchCard]);

  useEffect(() => {
    if (cache.has(name) && !card) setCard(cache.get(name) ?? null);
  }, [name, card]);

  const imageUrl = card?.imageUrl;

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
      {hovered && imageUrl && pos && (
        <span
          className="pointer-events-none fixed z-[200] overflow-hidden rounded-xl border border-hairline shadow-2xl"
          style={{ top: pos.top, left: pos.left, width: 244 }}
        >
          <img src={imageUrl} alt={card?.name ?? name} className="w-full" />
        </span>
      )}
    </>
  );
}
