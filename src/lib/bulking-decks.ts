import type { BulkRecipeRequirement } from "./bulking-types";

type SectionRecette = NonNullable<BulkRecipeRequirement["section"]>;

/**
 * Sections d'un deck officiel traduites vers celles d'une recette Bulking.
 *
 * La base n'écrit que "legend", "main", "rune", "battlefield" et "side"
 * (deckCoverageItems et les seeds) ; "champion" n'est qu'un repère de parse
 * dans deck-code.ts, on l'accepte quand même. "rune" n'a pas d'équivalent
 * dans BulkRecipeSection : il retombe sur GENERIC avec les sections inconnues.
 */
const TRADUCTION_SECTION: Record<string, SectionRecette> = {
  legend: "LEGEND",
  champion: "CHAMPION",
  main: "MAIN_DECK",
  battlefield: "BATTLEFIELD",
  side: "SIDEBOARD",
};

/**
 * Convertit les lignes d'un DeckCard en exigences de recette Bulking.
 *
 * La réserve n'est gardée que si `includeSideboard` vaut `true`. Les doublons
 * (même carte et même section) sont additionnés. Une quantité nulle, négative
 * ou non entière est refusée, sauf si la ligne est écartée (réserve exclue).
 */
export function exigencesDepuisDeck(
  cards: Array<{ cardId: string; quantity: number; section: string }>,
  languageId: string,
  includeSideboard: boolean,
): BulkRecipeRequirement[] {
  const cumuls = new Map<string, BulkRecipeRequirement>();

  for (const carte of cards) {
    if (carte.section === "side" && !includeSideboard) continue;

    if (!Number.isInteger(carte.quantity) || carte.quantity <= 0) {
      throw new Error(`Quantité invalide pour ${carte.cardId}`);
    }

    const section = TRADUCTION_SECTION[carte.section] ?? "GENERIC";
    const cle = `${carte.cardId}|${section}`;

    const existante = cumuls.get(cle);
    if (existante) {
      existante.quantity += carte.quantity;
    } else {
      cumuls.set(cle, {
        cardId: carte.cardId,
        languageId,
        section,
        quantity: carte.quantity,
      });
    }
  }

  return [...cumuls.values()];
}
