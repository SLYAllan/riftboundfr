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
        "group block rounded-card overflow-hidden transition-all",
        style === "highlight"
          ? "border-2 border-gold/40 bg-gold/5 hover:border-gold/60"
          : "border border-hairline bg-surface-raised hover:border-hairline-accent"
      )}
    >
      <div className="flex items-center gap-4 p-5">
        {imageUrl && (
          <div className="hidden sm:block h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {isSponsored && (
            <span className="text-[10px] uppercase tracking-widest text-ink-muted">Sponsorise</span>
          )}
          <h4
            className={cn(
              "font-semibold",
              style === "highlight" ? "text-gold" : "text-ink"
            )}
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          >
            {title}
          </h4>
          {description && <p className="mt-1 text-sm text-ink-secondary line-clamp-1">{description}</p>}
        </div>
        <span
          className={cn(
            "flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            style === "highlight"
              ? "bg-gold text-canvas hover:bg-gold/90"
              : "bg-arcane text-white hover:bg-arcane-dark"
          )}
        >
          {ctaText}
        </span>
      </div>
    </a>
  );
}
