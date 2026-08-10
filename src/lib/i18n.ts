import { EN } from "./i18n-en";

export type Langue = "fr" | "en";

/** Préfixe d'URL de la version anglaise. Le site français reste à la racine. */
export const PREFIXE_EN = "/en";

/**
 * Le dictionnaire est indexé par le texte français lui-même : pas de clés à
 * inventer, et une phrase non traduite retombe sur le français au lieu
 * d'afficher « home.title ». C'est ce qui permet de traduire le site page par
 * page sans jamais le casser entre deux passes.
 */
export function traduire(texte: string, langue: Langue): string {
  if (langue === "fr") return texte;
  return EN[texte] ?? texte;
}

/** Étiquette de langue pour les nombres et les dates. */
export function etiquetteLocale(langue: Langue): string {
  return langue === "en" ? "en-GB" : "fr-FR";
}

/**
 * Retire le préfixe de langue d'un chemin. `usePathname()` rend l'URL du
 * navigateur, donc `/en/decks` : sans ça, tous les tests « lien actif »
 * échouent sur la version anglaise.
 */
export function sansPrefixe(chemin: string): string {
  if (chemin === PREFIXE_EN) return "/";
  return chemin.startsWith(`${PREFIXE_EN}/`) ? chemin.slice(PREFIXE_EN.length) : chemin;
}

/**
 * Ajoute le préfixe de langue à un lien interne. Laisse passer les liens
 * externes, les ancres, les mailto et l'API : les préfixer casserait la
 * destination.
 */
export function prefixerLien(href: string, langue: Langue): string {
  if (langue === "fr") return href;
  if (!href.startsWith("/")) return href;
  // Déjà préfixé : la pagination et les filtres reconstruisent leurs liens à
  // partir de l'URL courante, qui contient déjà « /en ».
  if (href.startsWith("/api/") || href === PREFIXE_EN || /^\/en[/?#]/.test(href)) {
    return href;
  }
  return href === "/" ? PREFIXE_EN : `${PREFIXE_EN}${href}`;
}
