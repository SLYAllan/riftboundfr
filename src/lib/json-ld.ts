import { prefixerLien, type Langue } from "./i18n";

/**
 * Un bloc JSON-LD prêt pour `dangerouslySetInnerHTML`.
 *
 * L'échappement de `<` a été recopié dans six pages, et l'une d'elles écrivait
 * l'échappement avec un seul antislash. Cette forme-là vaut déjà `<` une fois
 * la chaîne lue : elle ne remplaçait donc rien, et un article portant la
 * fermeture d'une balise script sortait du bloc. Une seule fonction, une règle.
 */
export function jsonLdHtml(donnees: unknown): string {
  return JSON.stringify(donnees).replace(/</g, "\\u003c");
}

/**
 * L'adresse d'une page dans la langue en cours. Les schémas figeaient l'adresse
 * FRANÇAISE et `inLanguage: "fr"`, y compris servis sous /en : ils décrivaient
 * une autre page que celle qu'on lisait.
 */
export function urlLangue(site: string, chemin: string, langue: Langue): string {
  return `${site}${prefixerLien(chemin, langue)}`;
}

/** Le code de langue attendu par schema.org. */
export function langueSchema(langue: Langue): string {
  return langue === "en" ? "en" : langue === "zh" ? "zh-Hant" : "fr";
}
