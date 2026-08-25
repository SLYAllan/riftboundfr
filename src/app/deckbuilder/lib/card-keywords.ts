type CarteAvecTags = { tags: string[] };

export function listerMotsCles(cartes: CarteAvecTags[]): string[] {
  return [...new Set(cartes.flatMap((carte) => carte.tags))]
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
}

export function filtrerParMotCle<T extends CarteAvecTags>(cartes: T[], motCle: string): T[] {
  if (!motCle) return cartes;
  const cible = motCle.toLocaleLowerCase("fr");
  return cartes.filter((carte) => carte.tags.some((tag) => tag.toLocaleLowerCase("fr") === cible));
}
