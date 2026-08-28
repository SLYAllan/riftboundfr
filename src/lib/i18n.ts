import { EN } from "./i18n-en";
import { EN_ARTICLES } from "./i18n-articles-en";
import { ZH } from "./i18n-zh";

export type Langue = "fr" | "en" | "zh";

/** Préfixe d'URL de la version anglaise. Le site français reste à la racine. */
export const PREFIXE_EN = "/en";
/** Chinois traditionnel. Seul l'overlay est traduit ; voir `i18n-zh.ts`. */
export const PREFIXE_ZH = "/zh";

/** Le préfixe d'URL de chaque langue autre que le français. */
export const PREFIXES: Record<Exclude<Langue, "fr">, string> = { en: PREFIXE_EN, zh: PREFIXE_ZH };

/**
 * Le dictionnaire est indexé par le texte français lui-même : pas de clés à
 * inventer, et une phrase non traduite retombe sur le français au lieu
 * d'afficher « home.title ». C'est ce qui permet de traduire le site page par
 * page sans jamais le casser entre deux passes.
 */
export function traduire(texte: string, langue: Langue): string {
  if (langue === "fr") return texte;
  // Le chinois ne couvre que l'overlay : un seul dictionnaire, et le reste retombe
  // sur le français, comme l'anglais le faisait pendant sa propre traduction.
  if (langue === "zh") return ZH[texte] ?? texte;
  // Deux dictionnaires : l'interface, puis la prose des articles. Séparés parce
  // qu'un seul paragraphe d'article pèse plus que dix phrases de menu, et qu'un
  // article se traduit d'un bloc alors que l'interface se traduit par pages.
  return EN[texte] ?? EN_ARTICLES[texte] ?? texte;
}

/** Étiquette de langue pour les nombres et les dates. */
export function etiquetteLocale(langue: Langue): string {
  if (langue === "en") return "en-GB";
  return langue === "zh" ? "zh-Hant" : "fr-FR";
}

/**
 * Retire le préfixe de langue d'un chemin. `usePathname()` rend l'URL du
 * navigateur, donc `/en/decks` : sans ça, tous les tests « lien actif »
 * échouent sur la version anglaise.
 */
export function sansPrefixe(chemin: string): string {
  for (const prefixe of Object.values(PREFIXES)) {
    if (chemin === prefixe) return "/";
    if (chemin.startsWith(`${prefixe}/`)) return chemin.slice(prefixe.length);
  }
  return chemin;
}

/**
 * Ajoute le préfixe de langue à un lien interne. Laisse passer les liens
 * externes, les ancres, les mailto et l'API : les préfixer casserait la
 * destination.
 */
export function prefixerLien(href: string, langue: Langue): string {
  if (langue === "fr") return href;
  if (!href.startsWith("/")) return href;
  const prefixe = PREFIXES[langue];
  // Déjà préfixé : la pagination et les filtres reconstruisent leurs liens à
  // partir de l'URL courante, qui contient déjà « /en » ou « /zh ».
  if (href.startsWith("/api/") || href === prefixe || href.startsWith(`${prefixe}/`) || href.startsWith(`${prefixe}?`) || href.startsWith(`${prefixe}#`)) {
    return href;
  }
  return href === "/" ? prefixe : `${prefixe}${href}`;
}

/** Le canonical doit désigner la page dans la langue réellement rendue. */
type Canonical = string | URL | { title?: string; url: string | URL };

export function traduireCanonical(canonical: Canonical, langue: Langue): Canonical {
  if (langue === "fr") return canonical;
  if (typeof canonical === "string") {
    if (canonical.startsWith("/")) return prefixerLien(canonical, langue);
    const traduit = traduireCanonical(new URL(canonical), langue);
    return traduit.toString();
  }
  if (!(canonical instanceof URL)) {
    return { ...canonical, url: traduireCanonical(canonical.url, langue) as string | URL };
  }
  const traduit = new URL(canonical);
  traduit.pathname = prefixerLien(traduit.pathname, langue);
  return traduit;
}
