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
