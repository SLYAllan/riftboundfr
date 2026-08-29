import { describe, expect, it } from "vitest";
import { appliquerMouvement, calculerCoutUniforme, calculerNouveauStock } from "./bulking-stock";

describe("calculerCoutUniforme", () => {
  it("répartit 40 euros entre 4 000 cartes", () => {
    expect(calculerCoutUniforme("40.00", 4_000).toFixed(8)).toBe("0.01000000");
  });

  it("refuse un lot vide", () => {
    expect(() => calculerCoutUniforme("40.00", 0)).toThrow("aucune carte");
  });
});

describe("calculerNouveauStock", () => {
  it("calcule le coût moyen pondéré d'une entrée", () => {
    const stock = calculerNouveauStock({
      physicalQuantity: 10,
      reservedQuantity: 2,
      averageAcquisitionCost: "0.10000000",
      physicalDelta: 5,
      reservedDelta: 0,
      acquisitionUnitCost: "0.40000000",
    });

    expect(stock.physicalQuantity).toBe(15);
    expect(stock.availableQuantity).toBe(13);
    expect(stock.averageAcquisitionCost.toFixed(8)).toBe("0.20000000");
  });

  it("refuse un stock physique négatif", () => {
    expect(() => calculerNouveauStock({
      physicalQuantity: 2,
      reservedQuantity: 0,
      averageAcquisitionCost: "0",
      physicalDelta: -3,
      reservedDelta: 0,
    })).toThrow("Stock physique insuffisant");
  });

  it("refuse de réserver plus que le stock physique", () => {
    expect(() => calculerNouveauStock({
      physicalQuantity: 2,
      reservedQuantity: 1,
      averageAcquisitionCost: "0",
      physicalDelta: 0,
      reservedDelta: 2,
    })).toThrow("Stock disponible insuffisant");
  });

  it("refuse un delta décimal", () => {
    expect(() => calculerNouveauStock({ physicalQuantity: 2, reservedQuantity: 0, averageAcquisitionCost: "0", physicalDelta: 0.5, reservedDelta: 0 })).toThrow("entiers");
  });

  it("refuse un coût d'acquisition négatif", () => {
    expect(() => calculerNouveauStock({ physicalQuantity: 2, reservedQuantity: 0, averageAcquisitionCost: "0", physicalDelta: 1, reservedDelta: 0, acquisitionUnitCost: "-1" })).toThrow("négatif");
  });
});

describe("appliquerMouvement", () => {
  it("écrit le solde avant le mouvement dans le même client transactionnel", async () => {
    const appels: string[] = [];
    const tx = {
      bulkInventory: {
        findUnique: async () => null,
        upsert: async () => { appels.push("stock"); return { id: "inventory-1" }; },
      },
      bulkInventoryMovement: {
        create: async () => { appels.push("movement"); return { id: "movement-1" }; },
      },
    };

    await appliquerMouvement(tx as never, {
      cardId: "card-1",
      languageId: "language-1",
      condition: "NM",
      finish: "NORMAL",
      storageLocationId: "location-1",
      physicalDelta: 3,
      type: "INTAKE",
      source: "Entrée test",
      acquisitionUnitCost: "0.10",
      adminUserId: null,
      adminLabel: "password-admin",
    });

    expect(appels).toEqual(["stock", "movement"]);
  });
});
