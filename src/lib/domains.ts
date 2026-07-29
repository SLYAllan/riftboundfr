// Ces couleurs servent surtout de texte sur fond sombre : Furie, Esprit, Chaos et
// Sorcellerie ont été éclaircies pour tenir 4,5:1 (teinte et saturation inchangées).
// Doivent rester identiques aux tokens --color-domain-* de globals.css.
export const DOMAIN_COLORS: Record<string, string> = {
  Fury: "#ff5c58",
  Calm: "#22c55e",
  Mind: "#4b93ff",
  Body: "#f97316",
  Chaos: "#a77bff",
  Order: "#eab308",
  Sorcery: "#fa55a5",
};

export const DOMAIN_LABELS_FR: Record<string, string> = {
  Fury: "Furie",
  Calm: "Calme",
  Mind: "Esprit",
  Body: "Corps",
  Chaos: "Chaos",
  Order: "Ordre",
  Sorcery: "Sorcellerie",
};

export const DOMAIN_ICONS: Record<string, string> = {
  Fury: "/icons/Fury.webp",
  Calm: "/icons/Calm.webp",
  Mind: "/icons/Mind.webp",
  Body: "/icons/Body.webp",
  Chaos: "/icons/Chaos.webp",
  Order: "/icons/Order.webp",
};

export const RARITY_ICONS: Record<string, string> = {
  Common: "/icons/Common.webp",
  Uncommon: "/icons/Uncommon.webp",
  Rare: "/icons/Rare.webp",
  Epic: "/icons/Epic.webp",
  Legend: "/icons/Legend.webp",
};

export const TYPE_ICONS: Record<string, string> = {
  Unit: "/icons/Unit.webp",
  Spell: "/icons/Spell.webp",
  Gear: "/icons/Gear.webp",
  Rune: "/icons/Rune.webp",
  Legend: "/icons/Legend.webp",
};

export const TYPE_LABELS_FR: Record<string, string> = {
  Unit: "Unité",
  Spell: "Sort",
  Gear: "Équipement",
  Rune: "Rune",
  Legend: "Légende",
  Battlefield: "Champ de bataille",
  "Champion Unit": "Unité Champion",
};

export const RARITY_LABELS_FR: Record<string, string> = {
  Common: "Commune",
  Uncommon: "Peu commune",
  Rare: "Rare",
  Epic: "Épique",
  Showcase: "Showcase",
  Promo: "Promo",
  Legend: "Légende",
};

export function getDomainColor(domain: string): string {
  return DOMAIN_COLORS[domain] ?? "#6b7280";
}
