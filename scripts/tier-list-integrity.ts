interface CarteLegende {
  id: string;
  name: string;
}

function normaliser(nom: string): string {
  return nom.toLowerCase().replace(/\s*[-–]\s*/, ", ").replace(/\s+/g, " ").trim();
}

export function resoudreLegende(nom: string, cartes: CarteLegende[]): string | null {
  const recherche = normaliser(nom);
  const correspondances = cartes.filter((carte) => normaliser(carte.name) === recherche);
  return correspondances.length === 1 ? correspondances[0].id : null;
}
