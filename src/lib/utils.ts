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

export function getRarityColor(rarity: string): string {
  const map: Record<string, string> = {
    Common: "text-rarity-common",
    Uncommon: "text-rarity-common",
    Rare: "text-rarity-rare",
    Epic: "text-rarity-epic",
    Champion: "text-rarity-champion",
    Showcase: "text-rarity-legend",
    Legend: "text-rarity-legend",
  };
  return map[rarity] ?? "text-ink-secondary";
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

export function getTierColor(tier: string): string {
  const map: Record<string, string> = {
    S: "text-tier-s",
    A: "text-tier-a",
    B: "text-tier-b",
    C: "text-tier-c",
    D: "text-tier-d",
  };
  return map[tier] ?? "text-ink-secondary";
}

export function getTierBgColor(tier: string): string {
  const map: Record<string, string> = {
    S: "bg-tier-s-bg border-tier-s/30",
    A: "bg-tier-a-bg border-tier-a/30",
    B: "bg-tier-b-bg border-tier-b/30",
    C: "bg-tier-c-bg border-tier-c/30",
    D: "bg-tier-d-bg border-tier-d/30",
  };
  return map[tier] ?? "";
}

export function displayLegendName(name: string): string {
  return name.replace(/\s*\([^)]+\)\s*$/, "");
}

export const CARD_TYPES = ["Unit", "Spell", "Gear", "Rune", "Battlefield", "Legend"] as const;
export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Showcase", "Promo"] as const;
export const DOMAINS = ["Fury", "Sorcery", "Order", "Calm", "Mind", "Body", "Chaos"] as const;
export const TIERS = ["S", "A", "B", "C", "D"] as const;
