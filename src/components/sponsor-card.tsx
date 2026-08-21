"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface SponsorCardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  ctaText: string;
  url: string;
  style: "standard" | "highlight" | "minimal";
  isSponsored: boolean;
}

export function SponsorCard({ title, description, imageUrl, ctaText, url, style, isSponsored }: SponsorCardProps) {
  const rel = [
    "noopener",
    "noreferrer",
    ...(isSponsored ? ["sponsored", "nofollow"] : []),
  ].join(" ");

  if (style === "minimal") {
    return (
      <a
        href={url}
        target="_blank"
        rel={rel}
        className="group flex items-center gap-2 py-2 text-sm text-arcane hover:text-arcane-light transition-colors"
      >
        <span>{title}</span>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel={rel}
      className={cn(
        "group block rounded-card overflow-hidden transition-colors",
        style === "highlight"
          ? "border-2 border-gold/40 bg-gold/5 hover:border-gold/60"
          : "border border-hairline bg-surface-raised hover:border-hairline-accent"
      )}
    >
      {/* Carte carrée, pas bandeau : une vignette de 64 px dans une bande pleine
          largeur ne montrait rien du produit. L'image occupe maintenant tout le
          haut de la carte, en `contain` parce qu'un détourage sur fond blanc perd
          ses bords en `cover`. */}
      {imageUrl && (
        <div className="aspect-square w-full overflow-hidden bg-white">
          <img src={imageUrl} alt="" className="h-full w-full object-contain" />
        </div>
      )}
      <div className="flex flex-col gap-2 p-4">
        {isSponsored && (
          <span className="text-[10px] uppercase tracking-widest text-ink-muted">Sponsorise</span>
        )}
        <h4
          className={cn(
            "font-semibold leading-snug",
            style === "highlight" ? "text-gold" : "text-ink"
          )}
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          {title}
        </h4>
        {description && <p className="text-sm text-ink-secondary">{description}</p>}
        <span
          className={cn(
            "mt-1 rounded-lg px-4 py-2 text-center text-sm font-semibold transition-colors",
            style === "highlight"
              ? "bg-gold text-canvas hover:bg-gold/90"
              : "bg-arcane text-canvas hover:bg-arcane-light"
          )}
        >
          {ctaText}
        </span>
      </div>
    </a>
  );
}
