import { describe, expect, it } from "vitest";
import { exigencesDepuisDeck } from "./bulking-decks";

const LANGUE = "language-1";

describe("exigencesDepuisDeck", () => {
  it("traduit la légende en LEGEND", () => {
    const resultat = exigencesDepuisDeck(
      [{ cardId: "card-legend", quantity: 1, section: "legend" }],
      LANGUE,
      false,
    );
    expect(resultat).toEqual([
      { cardId: "card-legend", languageId: LANGUE, section: "LEGEND", quantity: 1 },
    ]);
  });

  it("traduit le champion en CHAMPION", () => {
    const resultat = exigencesDepuisDeck(
      [{ cardId: "card-champion", quantity: 1, section: "champion" }],
      LANGUE,
      false,
    );
    expect(resultat).toEqual([
      { cardId: "card-champion", languageId: LANGUE, section: "CHAMPION", quantity: 1 },
    ]);
  });

  it("traduit le deck principal en MAIN_DECK", () => {
    const resultat = exigencesDepuisDeck(
      [{ cardId: "card-main", quantity: 4, section: "main" }],
      LANGUE,
      false,
    );
    expect(resultat).toEqual([
      { cardId: "card-main", languageId: LANGUE, section: "MAIN_DECK", quantity: 4 },
    ]);
  });

  it("range les runes en GENERIC", () => {
    const resultat = exigencesDepuisDeck(
      [{ cardId: "card-rune", quantity: 7, section: "rune" }],
      LANGUE,
      false,
    );
    expect(resultat).toEqual([
      { cardId: "card-rune", languageId: LANGUE, section: "GENERIC", quantity: 7 },
    ]);
  });

  it("traduit le champ de bataille en BATTLEFIELD", () => {
    const resultat = exigencesDepuisDeck(
      [{ cardId: "card-bf", quantity: 1, section: "battlefield" }],
      LANGUE,
      false,
    );
    expect(resultat).toEqual([
      { cardId: "card-bf", languageId: LANGUE, section: "BATTLEFIELD", quantity: 1 },
    ]);
  });

  it("additionne les doublons d'une même carte et d'une même section", () => {
    const resultat = exigencesDepuisDeck(
      [
        { cardId: "card-main", quantity: 3, section: "main" },
        { cardId: "card-main", quantity: 2, section: "main" },
      ],
      LANGUE,
      false,
    );
    expect(resultat).toEqual([
      { cardId: "card-main", languageId: LANGUE, section: "MAIN_DECK", quantity: 5 },
    ]);
  });

  it("n'agrège pas la même carte dans deux sections différentes", () => {
    const resultat = exigencesDepuisDeck(
      [
        { cardId: "card-x", quantity: 1, section: "main" },
        { cardId: "card-x", quantity: 1, section: "side" },
      ],
      LANGUE,
      true,
    );
    expect(resultat).toHaveLength(2);
    expect(resultat).toContainEqual({ cardId: "card-x", languageId: LANGUE, section: "MAIN_DECK", quantity: 1 });
    expect(resultat).toContainEqual({ cardId: "card-x", languageId: LANGUE, section: "SIDEBOARD", quantity: 1 });
  });

  it("exclut la réserve par défaut", () => {
    const resultat = exigencesDepuisDeck(
      [
        { cardId: "card-main", quantity: 1, section: "main" },
        { cardId: "card-side", quantity: 1, section: "side" },
      ],
      LANGUE,
      false,
    );
    expect(resultat).toEqual([
      { cardId: "card-main", languageId: LANGUE, section: "MAIN_DECK", quantity: 1 },
    ]);
  });

  it("inclut la réserve quand includeSideboard vaut true", () => {
    const resultat = exigencesDepuisDeck(
      [{ cardId: "card-side", quantity: 3, section: "side" }],
      LANGUE,
      true,
    );
    expect(resultat).toEqual([
      { cardId: "card-side", languageId: LANGUE, section: "SIDEBOARD", quantity: 3 },
    ]);
  });

  it("refuse une quantité nulle", () => {
    expect(() =>
      exigencesDepuisDeck([{ cardId: "c", quantity: 0, section: "main" }], LANGUE, false),
    ).toThrow("Quantité invalide");
  });

  it("refuse une quantité négative", () => {
    expect(() =>
      exigencesDepuisDeck([{ cardId: "c", quantity: -1, section: "main" }], LANGUE, false),
    ).toThrow("Quantité invalide");
  });

  it("refuse une quantité non entière", () => {
    expect(() =>
      exigencesDepuisDeck([{ cardId: "c", quantity: 1.5, section: "main" }], LANGUE, false),
    ).toThrow("Quantité invalide");
  });

  it("range une section inconnue en GENERIC", () => {
    const resultat = exigencesDepuisDeck(
      [{ cardId: "c", quantity: 1, section: "mystere" }],
      LANGUE,
      false,
    );
    expect(resultat).toEqual([
      { cardId: "c", languageId: LANGUE, section: "GENERIC", quantity: 1 },
    ]);
  });
});
