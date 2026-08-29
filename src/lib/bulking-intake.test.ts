import { describe, expect, it } from "vitest";
import { coutsPourComptabilisation, fusionnerLignesEntree } from "./bulking-intake";

const ligne = {
  cardId: "card-1",
  quantity: 1,
  condition: "NM" as const,
  finish: "NORMAL" as const,
  storageLocationId: "location-1",
  acquisitionUnitCost: null,
};

describe("fusionnerLignesEntree", () => {
  it("additionne les doublons de la même variante au même emplacement", () => {
    expect(fusionnerLignesEntree([ligne, { ...ligne, quantity: 3 }])).toEqual([{ ...ligne, quantity: 4 }]);
  });

  it("garde deux finitions séparées", () => {
    expect(fusionnerLignesEntree([ligne, { ...ligne, finish: "FOIL" }])).toHaveLength(2);
  });
});

describe("coutsPourComptabilisation", () => {
  it("alloue uniformément le prix total", () => {
    const couts = coutsPourComptabilisation("UNIFORM", "40.00", [{ ...ligne, quantity: 4_000 }]);
    expect(couts[0].toFixed(8)).toBe("0.01000000");
  });

  it("refuse un coût absent en allocation manuelle", () => {
    expect(() => coutsPourComptabilisation("MANUAL", "1.00", [ligne])).toThrow("coût unitaire manque");
  });

  it("refuse un total manuel incohérent", () => {
    expect(() => coutsPourComptabilisation("MANUAL", "1.00", [{ ...ligne, acquisitionUnitCost: "0.50" }])).toThrow("ne correspond pas");
  });

  it("compare le total manuel au centime", () => {
    expect(coutsPourComptabilisation("MANUAL", "1.00", [{ ...ligne, acquisitionUnitCost: "1.004" }])[0].toString()).toBe("1.004");
  });
});
