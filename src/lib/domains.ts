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

// Ordre de rareté, du plus commun au plus rare. Les deux jeux de noms croisés
// dans la base cohabitent (Showcase/Mythic/Legendary côté import, Legend côté
// fiches), d'où les rangs partagés. Inconnu = 99, trié en dernier.
export const RARITY_RANK: Record<string, number> = {
  Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Promo: 4,
  Showcase: 5, Mythic: 6, Legend: 7, Legendary: 7,
};

// Couleurs de rareté, alignées sur les tokens --color-rarity-* de globals.css.
export const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af", Uncommon: "#4ade80", Rare: "#0ea5e9", Epic: "#a77bff",
  Promo: "#f59e0b", Showcase: "#f59e0b", Mythic: "#ff5c58", Legend: "#ff5c58", Legendary: "#ff5c58",
};

export function rarityRank(rarity: string): number {
  return RARITY_RANK[rarity] ?? 99;
}

export function getDomainColor(domain: string): string {
  return DOMAIN_COLORS[domain] ?? "#6b7280";
}
