import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(date: Date | string, locale = "fr-FR"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// Fond neutre, la couleur ne vit que sur le texte (pas d'empilement fond+texte).
export function getRarityBgColor(rarity: string): string {
  const map: Record<string, string> = {
    Common: "bg-surface-raised text-rarity-common",
    Uncommon: "bg-surface-raised text-rarity-uncommon",
    Rare: "bg-surface-raised text-rarity-rare",
    Epic: "bg-surface-raised text-rarity-epic",
    Champion: "bg-surface-raised text-rarity-champion",
    Showcase: "bg-surface-raised text-rarity-legend",
    Promo: "bg-surface-raised text-rarity-champion",
  };
  return map[rarity] ?? "bg-surface-raised text-ink-secondary";
}

export function displayLegendName(name: string): string {
  return name.replace(/\s*\([^)]+\)\s*$/, "");
}

export const CARD_TYPES = ["Unit", "Spell", "Gear", "Rune", "Battlefield", "Legend"] as const;
export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Showcase", "Promo"] as const;
