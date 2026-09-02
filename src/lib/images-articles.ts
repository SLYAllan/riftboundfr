import mesures from "../../data/images-articles.json";

/**
 * Dimensions d'origine des images d'articles servies depuis public/.
 *
 * Un `<img>` sans width/height ne laisse au navigateur aucun moyen de réserver
 * la place : le texte sautait sous chaque illustration au chargement. Le relevé
 * est écrit par `scripts/mesurer-images-articles.mts` ; une image absente du
 * relevé (adresse distante) rend simplement `null`, sans rien casser.
 */
export function tailleImage(src: string): { width: number; height: number } | null {
  const trouve = (mesures as Record<string, number[]>)[src];
  return trouve?.length === 2 ? { width: trouve[0], height: trouve[1] } : null;
}
