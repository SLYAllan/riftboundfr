/**
 * Passage unique pour lire une réponse d'API attendue comme un tableau JSON.
 *
 * Deux défauts que ce garde-fou ferme, payés chacun une fois sur l'habillage :
 * un 500 qui renvoie `{ error: … }` passait droit dans `setListe`, et le `.map`
 * du rendu faisait tomber la page ; un 200 dont le corps n'est pas un tableau
 * (objet, chaîne) passait tout aussi bien. Ici on refuse les deux : l'appelant
 * reçoit une erreur et décide de l'afficher, jamais de l'avaler.
 */
export async function lireTableauJson<T>(response: Response): Promise<T[]> {
  if (!response.ok) {
    throw new Error(`La requête a échoué (${response.status}).`);
  }

  let corps: unknown;
  try {
    corps = await response.json();
  } catch {
    throw new Error("La réponse n'est pas du JSON valide.");
  }

  if (!Array.isArray(corps)) {
    throw new Error("La réponse n'est pas une liste.");
  }

  return corps as T[];
}
