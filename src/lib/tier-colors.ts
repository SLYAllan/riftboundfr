/**
 * Couleurs des bandeaux S/A/B/C/D des tier lists : dégradé chaud vers froid.
 *
 * Source unique. L'accueil et /tier-list en avaient chacun une copie, avec des
 * opacités et des couleurs de lettre différentes : le même tier n'avait pas la
 * même tête aux deux endroits.
 *
 * Ne pas confondre avec les tokens `--color-tier-*` de globals.css, qui servent de
 * TEXTE (« Tier A » sur /decks, /meta) et pas de bandeau.
 *
 * Couleur de lettre : sombre sur orange, jaune et turquoise, où le blanc tombe à
 * 2,4:1 pour 3:1 requis. Blanc sur rouge et gris, où il passe.
 */
export const TIER_BANNER: Record<string, { bg: string; text: string }> = {
  S: { bg: "bg-red-500", text: "text-white" },
  A: { bg: "bg-orange-400", text: "text-gray-900" },
  B: { bg: "bg-yellow-400", text: "text-gray-900" },
  C: { bg: "bg-teal-500", text: "text-gray-900" },
  D: { bg: "bg-gray-500", text: "text-white" },
};

/**
 * Lettre de tier en TEXTE sur fond neutre, pour les cibles trop petites pour un
 * bandeau. Le blanc sur rouge tient 3,81:1 : assez pour une grosse lettre (seuil 3)
 * mais pas pour un bouton de 10px (seuil 4,5). Ces tokens-là sont réglés pour du
 * texte, ils passent.
 */
export const TIER_TEXT_CLASS: Record<string, string> = {
  S: "text-tier-s",
  A: "text-tier-a",
  B: "text-tier-b",
  C: "text-tier-c",
  D: "text-tier-d",
};

export const TIER_ORDER = ["S", "A", "B", "C", "D"];
