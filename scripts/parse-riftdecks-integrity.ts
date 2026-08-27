export interface EntreeFragment {
  id: string;
  file: string;
}

export function sortiesObsoletes(
  precedent: EntreeFragment[],
  courant: EntreeFragment[],
): string[] {
  const fichiersCourants = new Set(courant.map((entree) => entree.file));
  return [...new Set(precedent.map((entree) => entree.file))]
    .filter((fichier) => !fichiersCourants.has(fichier))
    .sort();
}

/**
 * riftdecks marque ses pages : dans le titre H1 d'un deck, des lettres latines
 * sont remplacées par des cyrilliques identiques à l'œil — « ASC HаruKаze »
 * porte deux U+0430 au lieu de deux « a ». La phrase du corps et l'URL, elles,
 * restent propres. Recopier le H1 tel quel donne un pseudo qui ne se rapproche
 * plus de rien : ni la recherche, ni le rapprochement d'un même joueur entre
 * deux tournois, ni la comparaison avec la liste officielle de Riot. 317
 * decklists déjà écrites en portent un, jusque dans leur nom de fichier
 * (« icebre-ker » pour « icebreaker »).
 *
 * On ne latinise QUE si le pseudo ne contient aucune autre lettre cyrillique :
 * un vrai pseudo russe s'écrit avec plus que des « а », et le latiniser
 * l'abîmerait. Les noms chinois ne sont pas concernés et passent intacts.
 */
const HOMOGLYPHES: Record<string, string> = {
  а: "a", е: "e", о: "o", р: "p", с: "c", у: "y", х: "x", і: "i", ѕ: "s", ј: "j",
  А: "A", В: "B", Е: "E", К: "K", М: "M", Н: "H", О: "O", Р: "P", С: "C", Т: "T", Х: "X",
};

const EST_CYRILLIQUE = /[\u0400-\u04FF]/;

export function sansHomoglyphes(nom: string): string {
  const cyrilliques = [...nom].filter((c) => EST_CYRILLIQUE.test(c));
  if (!cyrilliques.length) return nom;
  if (cyrilliques.some((c) => !(c in HOMOGLYPHES))) return nom;
  return [...nom].map((c) => HOMOGLYPHES[c] ?? c).join("");
}
