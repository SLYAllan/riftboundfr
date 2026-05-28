"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { displayLegendName } from "@/lib/utils";

interface CarouselDeck {
  slug: string;
  title: string;
  legendName: string;
  playerName: string | null;
  placement: string | null;
  imageUrl: string | null;
}

export function HeroCarousel({ decks }: { decks: CarouselDeck[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (decks.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % decks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [decks.length]);

  if (decks.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-ink-muted">
        Aucun deck à la une
      </div>
    );
  }

  const deck = decks[current];

  return (
    <div className="relative">
      <Link href={`/decks/${deck.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden">
          {deck.imageUrl ? (
            <img
              src={deck.imageUrl}
              alt={deck.legendName}
              className="h-full w-full object-cover object-top transition-all duration-700"
            />
          ) : (
            <div className="h-full w-full bg-surface-raised flex items-center justify-center text-ink-muted">
              {displayLegendName(deck.legendName)}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas via-canvas/80 to-transparent px-4 pb-4 pt-16">
            <div
              className="text-xl font-bold text-ink"
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              {displayLegendName(deck.legendName)}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm">
              {deck.playerName && (
                <span className="text-ink-secondary">par {deck.playerName}</span>
              )}
              {deck.placement && (
                <span className="text-arcane">{deck.placement}</span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {decks.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrent((prev) => (prev - 1 + decks.length) % decks.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-canvas/60 p-1.5 text-ink-muted hover:text-ink hover:bg-canvas/80 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrent((prev) => (prev + 1) % decks.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-canvas/60 p-1.5 text-ink-muted hover:text-ink hover:bg-canvas/80 transition-colors"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-2 right-4 flex gap-1">
            {decks.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current
                    ? "w-4 bg-arcane"
                    : "w-1.5 bg-ink-muted/40 hover:bg-ink-muted"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
