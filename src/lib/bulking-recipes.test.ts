import { describe, expect, it } from "vitest";
import { analyserRecette } from "./bulking-recipes";
import type { BulkRecipeRequirement, BulkStockBalance } from "./bulking-types";

function ligneStock(cardId: string, languageId: string, physicalQuantity: number, reservedQuantity: number, averageAcquisitionCost: string): BulkStockBalance {
  return {
    cardId,
    languageId,
    condition: "NM",
    finish: "NORMAL",
    storageLocationId: "loc-1",
    physicalQuantity,
    reservedQuantity,
    averageAcquisitionCost,
  };
}

describe("analyserRecette", () => {
  it("rend zéro pour une recette vide", () => {
    const resultat = analyserRecette([], []);

    expect(resultat.buildableQuantity).toBe(0);
    expect(resultat.inventoryCostPerProduct).toBe("0.0000");
    expect(resultat.lines).toEqual([]);
  });

  it("signale une carte manquante", () => {
    const resultat = analyserRecette([{ cardId: "card-1", languageId: "lang-en", quantity: 3 }], []);

    expect(resultat.buildableQuantity).toBe(0);
    expect(resultat.lines).toHaveLength(1);
    expect(resultat.lines[0].availableQuantity).toBe(0);
    expect(resultat.lines[0].missingQuantity).toBe(3);
    expect(resultat.lines[0].buildableQuantity).toBe(0);
    expect(resultat.lines[0].limiting).toBe(true);
  });

  it("ne mélange pas deux langues distinctes", () => {
    const stock = [ligneStock("card-1", "lang-en", 10, 0, "0.1000")];
    const resultat = analyserRecette([{ cardId: "card-1", languageId: "lang-fr", quantity: 4 }], stock);

    expect(resultat.buildableQuantity).toBe(0);
    expect(resultat.lines[0].missingQuantity).toBe(4);
  });

  it("agrège plusieurs emplacements et pondère le coût moyen", () => {
    const stock: BulkStockBalance[] = [
      { ...ligneStock("card-1", "lang-en", 3, 0, "0.5000"), storageLocationId: "loc-1" },
      { ...ligneStock("card-1", "lang-en", 7, 0, "1.0000"), storageLocationId: "loc-2" },
    ];
    const resultat = analyserRecette([{ cardId: "card-1", languageId: "lang-en", quantity: 5 }], stock);

    expect(resultat.lines[0].availableQuantity).toBe(10);
    expect(resultat.lines[0].averageAcquisitionCost).toBe("0.8500");
    expect(resultat.buildableQuantity).toBe(2);
  });

  it("retire le réservé du disponible", () => {
    const stock = [ligneStock("card-1", "lang-en", 10, 4, "0.1000")];
    const resultat = analyserRecette([{ cardId: "card-1", languageId: "lang-en", quantity: 3 }], stock);

    expect(resultat.lines[0].availableQuantity).toBe(6);
    expect(resultat.buildableQuantity).toBe(2);
  });

  it("calcule le coût de stock par produit", () => {
    const stock: BulkStockBalance[] = [
      ligneStock("card-a", "lang-en", 10, 0, "0.1000"),
      ligneStock("card-b", "lang-en", 5, 0, "0.4000"),
    ];
    const exigences: BulkRecipeRequirement[] = [
      { cardId: "card-a", languageId: "lang-en", quantity: 2 },
      { cardId: "card-b", languageId: "lang-en", quantity: 1 },
    ];
    const resultat = analyserRecette(exigences, stock);

    expect(resultat.inventoryCostPerProduct).toBe("0.6000");
  });

  it("marque la carte limitante", () => {
    const stock: BulkStockBalance[] = [
      ligneStock("card-a", "lang-en", 10, 0, "0.1000"),
      ligneStock("card-b", "lang-en", 4, 0, "0.1000"),
    ];
    const resultat = analyserRecette(
      [
        { cardId: "card-a", languageId: "lang-en", quantity: 2 },
        { cardId: "card-b", languageId: "lang-en", quantity: 3 },
      ],
      stock,
    );

    expect(resultat.buildableQuantity).toBe(1);
    expect(resultat.lines.find((ligne) => ligne.cardId === "card-a")?.limiting).toBe(false);
    expect(resultat.lines.find((ligne) => ligne.cardId === "card-b")?.limiting).toBe(true);
  });

  it("additionne les exigences en double", () => {
    const stock = [ligneStock("card-1", "lang-en", 10, 0, "0.1000")];
    const resultat = analyserRecette(
      [
        { cardId: "card-1", languageId: "lang-en", quantity: 2 },
        { cardId: "card-1", languageId: "lang-en", quantity: 3 },
      ],
      stock,
    );

    expect(resultat.lines).toHaveLength(1);
    expect(resultat.lines[0].quantity).toBe(5);
    expect(resultat.buildableQuantity).toBe(2);
  });

  it("refuse une quantité nulle ou non entière", () => {
    expect(() => analyserRecette([{ cardId: "card-1", languageId: "lang-en", quantity: 0 }], [])).toThrow("entier");
    expect(() => analyserRecette([{ cardId: "card-1", languageId: "lang-en", quantity: 1.5 }], [])).toThrow("entier");
  });
});
