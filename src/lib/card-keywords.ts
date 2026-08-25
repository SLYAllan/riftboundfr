import { GLOSSARY_TERMS } from "./glossary";

type CarteAvecTexte = { textPlain: string | null };

type CategorieMecanique = "mot-cle" | "declencheur" | "ressource";

interface MecaniqueCarte {
  value: string;
  label: string;
  labelEn: string;
  categorie: CategorieMecanique;
}

export interface FiltreMotCle extends MecaniqueCarte {
  count: number;
}

const MOTS_CLES = GLOSSARY_TERMS
  .filter(({ en, subcategory, term }) => en && (subcategory?.startsWith("Mot-clé") || term === "Action" || term === "Réaction"))
  .map(({ en, term }) => ({ value: en.toLowerCase(), label: term, labelEn: en, categorie: "mot-cle" as const }));

const DECLENCHEURS: Array<MecaniqueCarte & { motif: RegExp }> = [
  { value: "when-you-play", label: "Quand vous jouez", labelEn: "When you play", categorie: "declencheur", motif: /\bwhen you play\b/i },
  { value: "when-i-attack", label: "Quand j’attaque", labelEn: "When I attack", categorie: "declencheur", motif: /\bwhen i attack\b/i },
  { value: "when-i-defend", label: "Quand je défends", labelEn: "When I defend", categorie: "declencheur", motif: /\bwhen i (?:attack or )?defend\b/i },
  { value: "when-i-conquer", label: "Quand je conquiers", labelEn: "When I conquer", categorie: "declencheur", motif: /\bwhen i conquer\b/i },
  { value: "when-you-conquer", label: "Quand vous conquérez", labelEn: "When you conquer", categorie: "declencheur", motif: /\bwhen you conquer\b/i },
  { value: "when-i-move", label: "Quand je me déplace", labelEn: "When I move", categorie: "declencheur", motif: /\bwhen i move\b/i },
  { value: "when-i-die", label: "Quand je meurs", labelEn: "When I die", categorie: "declencheur", motif: /\bwhen i die\b/i },
  { value: "when-i-hold", label: "Quand je contrôle", labelEn: "When I hold", categorie: "declencheur", motif: /\bwhen i (?:conquer or )?hold\b/i },
  { value: "when-you-hold", label: "Quand vous contrôlez", labelEn: "When you hold", categorie: "declencheur", motif: /\bwhen you (?:conquer or )?hold\b/i },
  { value: "when-you-win", label: "Quand vous gagnez", labelEn: "When you win", categorie: "declencheur", motif: /\bwhen you win\b/i },
  { value: "when-you-recycle", label: "Quand vous recyclez", labelEn: "When you recycle", categorie: "declencheur", motif: /\bwhen you recycle\b/i },
  { value: "when-you-discard", label: "Quand vous défaussez", labelEn: "When you discard", categorie: "declencheur", motif: /\bwhen you discard\b/i },
  { value: "when-you-attach", label: "Quand vous attachez", labelEn: "When you attach", categorie: "declencheur", motif: /\bwhen you attach\b/i },
  { value: "when-you-empower", label: "Quand vous amplifiez", labelEn: "When you empower", categorie: "declencheur", motif: /\bwhen you empower\b/i },
  { value: "when-you-defend", label: "Quand vous défendez", labelEn: "When you defend", categorie: "declencheur", motif: /\bwhen you defend\b/i },
];

const XP: MecaniqueCarte = { value: "xp", label: "XP", labelEn: "XP", categorie: "ressource" };
const TOUTES_LES_MECANIQUES: MecaniqueCarte[] = [
  ...MOTS_CLES,
  ...DECLENCHEURS.map(({ value, label, labelEn, categorie }) => ({ value, label, labelEn, categorie })),
  XP,
];

function mecaniquesDuTexte(textPlain: string | null): MecaniqueCarte[] {
  if (!textPlain) return [];
  const tokens = [...textPlain.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1].toLowerCase());
  const trouvees: MecaniqueCarte[] = MOTS_CLES.filter(({ value }) => tokens.some((token) => token === value || token.startsWith(`${value} `)));
  if (/\bXP\b/i.test(textPlain)) trouvees.push(XP);
  trouvees.push(...DECLENCHEURS.filter(({ motif }) => motif.test(textPlain)).map(({ value, label, labelEn, categorie }) => ({ value, label, labelEn, categorie })));
  return trouvees;
}

export function listerMotsCles(cartes: CarteAvecTexte[]): FiltreMotCle[] {
  const uniques = new Map<string, FiltreMotCle>();
  cartes.flatMap((carte) => mecaniquesDuTexte(carte.textPlain)).forEach((filtre) => {
    const existant = uniques.get(filtre.value);
    uniques.set(filtre.value, { ...filtre, count: (existant?.count ?? 0) + 1 });
  });
  return [...uniques.values()].sort((a, b) => a.label.localeCompare(b.label, "fr", { sensitivity: "base" }));
}

function normaliserRecherche(texte: string): string {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function rechercherMotsCles(options: FiltreMotCle[], recherche: string): FiltreMotCle[] {
  const cible = normaliserRecherche(recherche.trim());
  if (!cible) return options;
  return options.filter(({ label, labelEn }) => normaliserRecherche(`${label} ${labelEn}`).includes(cible));
}

export function filtrerParMotCle<T extends CarteAvecTexte>(cartes: T[], motCle: string): T[] {
  if (!motCle) return cartes;
  return cartes.filter((carte) => mecaniquesDuTexte(carte.textPlain).some(({ value }) => value === motCle));
}

export function preparerFiltreMotCle<T extends CarteAvecTexte>(cartes: T[], valeurDemandee?: string) {
  const options = listerMotsCles(cartes);
  const mecanique = TOUTES_LES_MECANIQUES.find(({ value }) => value === valeurDemandee);
  if (!mecanique) return { cartes, options, value: "" };
  if (!options.some(({ value }) => value === mecanique.value)) options.push({ ...mecanique, count: 0 });
  return { cartes: filtrerParMotCle(cartes, mecanique.value), options, value: mecanique.value };
}
