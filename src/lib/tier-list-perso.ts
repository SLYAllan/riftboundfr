// Tier list d'un visiteur : son classement vit dans l'adresse, et nulle part
// ailleurs. Partager la tier list, c'est partager le lien ; rien n'est stocké en
// base, donc rien à modérer ni à purger.
//
// Une Légende s'y écrit par le slug de sa page (`legendFicheSlug`) : il survit à
// l'arrivée de nouvelles Légendes, là où un numéro d'ordre décalerait tous les
// liens déjà partagés.

export const RANGS = ["S", "A", "B", "C", "D"] as const;
export type Rang = (typeof RANGS)[number];
export type Classement = Record<Rang, string[]>;

/** Assez pour « Tier list Vendetta de Kennen le magnifique », pas pour un roman dans l'adresse. */
export const TITRE_MAX = 60;

// Le point et pas la virgule : l'adresse encode la virgule en « %2C », trois
// caractères par Légende dans un lien qu'on colle dans Discord.
const SEPARATEUR = ".";

export function classementVide(): Classement {
  return { S: [], A: [], B: [], C: [], D: [] };
}

/**
 * Relit un classement depuis l'adresse. Une Légende inconnue (renommée, retirée
 * du format) est ignorée, et une Légende citée deux fois garde son premier rang :
 * un lien retouché à la main ne doit pas casser la page.
 */
export function lireClassement(params: URLSearchParams, connues: ReadonlySet<string>): Classement {
  const classement = classementVide();
  const vues = new Set<string>();
  for (const rang of RANGS) {
    for (const slug of (params.get(rang.toLowerCase()) ?? "").split(SEPARATEUR)) {
      if (!connues.has(slug) || vues.has(slug)) continue;
      vues.add(slug);
      classement[rang].push(slug);
    }
  }
  return classement;
}

export function lireTitre(params: URLSearchParams): string {
  return (params.get("titre") ?? "").trim().slice(0, TITRE_MAX);
}

/** Le titre d'abord : l'adresse finit ainsi sur une Légende et pas sur une ponctuation du titre. */
export function ecrireClassement(classement: Classement, titre: string): URLSearchParams {
  const params = new URLSearchParams();
  const propre = titre.trim().slice(0, TITRE_MAX);
  if (propre) params.set("titre", propre);
  for (const rang of RANGS) {
    if (classement[rang].length) params.set(rang.toLowerCase(), classement[rang].join(SEPARATEUR));
  }
  return params;
}

/**
 * Le nom court écrit sous l'icône : le personnage (« Kennen »), ou le titre quand
 * deux Légendes partagent le personnage. Les deux Master Yi s'affichaient sinon
 * sous le même nom, et on ne savait plus laquelle on rangeait.
 */
export function nomsCourts(legendes: ReadonlyArray<{ slug: string; nom: string }>): Map<string, string> {
  const personnage = (nom: string) => nom.split(",")[0].trim();
  const parPersonnage = new Map<string, number>();
  for (const l of legendes) parPersonnage.set(personnage(l.nom), (parPersonnage.get(personnage(l.nom)) ?? 0) + 1);
  return new Map(
    legendes.map((l) => {
      const titre = l.nom.split(",").slice(1).join(",").trim();
      return [l.slug, (parPersonnage.get(personnage(l.nom)) ?? 0) > 1 && titre ? titre : personnage(l.nom)];
    }),
  );
}

/** Range une Légende en fin de rang, ou la rend à la réserve avec `null`. */
export function ranger(classement: Classement, slug: string, rang: Rang | null): Classement {
  const suivant = classementVide();
  for (const r of RANGS) suivant[r] = classement[r].filter((s) => s !== slug);
  if (rang) suivant[rang].push(slug);
  return suivant;
}
