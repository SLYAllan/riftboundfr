export const DOMAIN_COLORS: Record<string, string> = {
  Fury: "#ef4444",
  Calm: "#22c55e",
  Mind: "#3b82f6",
  Body: "#f97316",
  Chaos: "#8b5cf6",
  Order: "#eab308",
  Sorcery: "#ec4899",
};

export const DOMAIN_BG: Record<string, string> = {
  Fury: "bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30",
  Calm: "bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30",
  Mind: "bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30",
  Body: "bg-[#f97316]/15 text-[#f97316] border-[#f97316]/30",
  Chaos: "bg-[#8b5cf6]/15 text-[#8b5cf6] border-[#8b5cf6]/30",
  Order: "bg-[#eab308]/15 text-[#eab308] border-[#eab308]/30",
  Sorcery: "bg-[#ec4899]/15 text-[#ec4899] border-[#ec4899]/30",
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
  Legend: "Légende",
};

export function getDomainColor(domain: string): string {
  return DOMAIN_COLORS[domain] ?? "#6b7280";
}
