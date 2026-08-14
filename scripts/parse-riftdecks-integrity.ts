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
