"use client";

import { X } from "lucide-react";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR } from "@/lib/domains";
import type { CardData } from "@/types";

interface CardDetailModalProps {
  card: CardData;
  onClose: () => void;
}

export function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-canvas/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-card border border-hairline bg-surface overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{card.name}</h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X size={20} /></button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 p-5">
          <div className="shrink-0 sm:w-64">
            {card.imageUrl ? (
              <img src={card.imageUrl} alt={card.name} className="w-full rounded-lg" />
            ) : (
              <div className="aspect-[5/7] w-full rounded-lg bg-surface-raised flex items-center justify-center text-ink-muted">
                Pas d&apos;image
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink-secondary">{card.supertype ? `${card.supertype} ` : ""}{card.type}</span>
              <span className="rounded-full bg-violet/20 px-2.5 py-0.5 text-xs font-bold text-violet">{card.rarity}</span>
              {card.domains.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor: `${DOMAIN_COLORS[d] ?? "#6b7280"}20`,
                    color: DOMAIN_COLORS[d] ?? "#6b7280",
                    borderColor: `${DOMAIN_COLORS[d] ?? "#6b7280"}40`,
                  }}
                >
                  {DOMAIN_LABELS_FR[d] ?? d}
                </span>
              ))}
            </div>

            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {card.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-hairline bg-surface-raised px-2.5 py-0.5 text-xs font-medium text-ink-secondary">{tag}</span>
                ))}
              </div>
            )}

            {(card.energy != null || card.power != null || card.might != null) && (
              <div className="grid grid-cols-3 gap-3">
                {card.energy != null && (
                  <div className="rounded-lg bg-surface-raised p-3 text-center">
                    <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold">Énergie</div>
                    <div className="text-3xl font-bold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{card.energy}</div>
                  </div>
                )}
                {card.power != null && (
                  <div className="rounded-lg bg-surface-raised p-3 text-center">
                    <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold">Pouvoir</div>
                    <div className="text-3xl font-bold text-gold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{card.power}</div>
                  </div>
                )}
                {card.might != null && (
                  <div className="rounded-lg bg-surface-raised p-3 text-center">
                    <div className="text-xs uppercase tracking-wider text-ink-muted font-semibold">Puissance</div>
                    <div className="text-3xl font-bold text-violet" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{card.might}</div>
                  </div>
                )}
              </div>
            )}

            {card.textPlain && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">Description</div>
                <p className="text-sm leading-relaxed text-ink-secondary">{card.textPlain}</p>
              </div>
            )}

            <div className="rounded-lg border border-hairline bg-surface-raised p-4 space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">Information</div>
              <div className="text-sm text-ink-secondary">Set : <span className="text-ink font-medium">{card.setName}</span></div>
              <div className="text-sm text-ink-secondary">ID : <span className="text-ink font-mono">{card.id}</span></div>
              {card.signature && <div className="text-sm text-gold font-semibold">Carte Signature</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
