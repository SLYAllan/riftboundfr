import { describe, expect, it } from "vitest";
import { validerBrouillonEntree, validerCorrectionStock, validerRecette, validerTransfert } from "./bulking-validation";

const brouillon = {
  sellerSource: "Lot local",
  acquisitionDate: "2026-08-29",
  totalPrice: "40.00",
  costAllocationMethod: "UNIFORM",
  languageId: "language-1",
  defaultCondition: "NM",
  defaultFinish: "NORMAL",
  knownSet: "ORI",
  declaredCardCount: 500,
  notes: "",
  lines: [{
    cardId: "card-1",
    quantity: 1,
    condition: "NM",
    finish: "NORMAL",
    storageLocationId: "location-1",
    acquisitionUnitCost: null,
  }],
};

describe("validerBrouillonEntree", () => {
  it("accepte un coût de ligne absent pour une allocation uniforme", () => {
    expect(validerBrouillonEntree(brouillon).ok).toBe(true);
  });

  it("exige un coût de ligne pour une allocation manuelle", () => {
    const resultat = validerBrouillonEntree({ ...brouillon, costAllocationMethod: "MANUAL" });
    expect(resultat).toEqual({ ok: false, error: "Le coût unitaire manque sur une ligne" });
  });

  it("refuse une finition inconnue", () => {
    const resultat = validerBrouillonEntree({
      ...brouillon,
      lines: [{ ...brouillon.lines[0], finish: "ETCHED" }],
    });
    expect(resultat.ok).toBe(false);
  });

  it("refuse les champs inconnus", () => {
    expect(validerBrouillonEntree({ ...brouillon, published: true }).ok).toBe(false);
  });
});

const correction = {
  cardId: "card-1",
  languageId: "language-1",
  condition: "NM",
  finish: "NORMAL",
  storageLocationId: "location-1",
  physicalDelta: 3,
  reservedDelta: 0,
  acquisitionUnitCost: "0.1200",
  source: "Correction après comptage",
};

const transfert = {
  cardId: "card-1",
  languageId: "language-1",
  condition: "NM",
  finish: "NORMAL",
  fromLocationId: "location-1",
  toLocationId: "location-2",
  quantity: 20,
  source: "Rangement du bac A",
};

describe("validerCorrectionStock", () => {
  it("accepte une correction valide", () => {
    expect(validerCorrectionStock(correction).ok).toBe(true);
  });

  it("refuse un champ inconnu", () => {
    expect(validerCorrectionStock({ ...correction, published: true }).ok).toBe(false);
  });

  it("refuse un delta nul des deux côtés", () => {
    expect(validerCorrectionStock({ ...correction, physicalDelta: 0, reservedDelta: 0 })).toEqual({ ok: false, error: "Le mouvement ne change aucune quantité" });
  });

  it("refuse un delta décimal", () => {
    expect(validerCorrectionStock({ ...correction, physicalDelta: 1.5 }).ok).toBe(false);
  });

  it("exige un coût unitaire sur une entrée positive", () => {
    expect(validerCorrectionStock({ ...correction, acquisitionUnitCost: undefined })).toEqual({ ok: false, error: "Le coût unitaire manque" });
  });

  it("refuse un coût négatif", () => {
    expect(validerCorrectionStock({ ...correction, acquisitionUnitCost: "-1.00" }).ok).toBe(false);
  });
});

const recette = {
  name: "Origins EN C/U Playset x3",
  description: null,
  sourceDeckId: null,
  lines: [
    { cardId: "card-1", languageId: "language-1", quantity: 3 },
    { cardId: "card-2", languageId: "language-1", section: "SIDEBOARD", quantity: 1 },
  ],
};

describe("validerRecette", () => {
  it("accepte une recette valide", () => {
    expect(validerRecette(recette).ok).toBe(true);
  });

  it("refuse un nom vide", () => {
    expect(validerRecette({ ...recette, name: "  " })).toEqual({ ok: false, error: "Le nom est invalide" });
  });

  it("refuse un champ inconnu", () => {
    expect(validerRecette({ ...recette, published: true }).ok).toBe(false);
  });

  it("refuse une ligne vide", () => {
    expect(validerRecette({ ...recette, lines: [] }).ok).toBe(false);
  });

  it("refuse un champ inconnu dans une ligne", () => {
    expect(validerRecette({ ...recette, lines: [{ ...recette.lines[0], extra: true }] }).ok).toBe(false);
  });

  it("refuse une section inconnue", () => {
    expect(validerRecette({ ...recette, lines: [{ ...recette.lines[0], section: "SIDE" }] }).ok).toBe(false);
  });

  it("refuse une quantité nulle", () => {
    expect(validerRecette({ ...recette, lines: [{ ...recette.lines[0], quantity: 0 }] }).ok).toBe(false);
  });

  it("refuse une quantité décimale", () => {
    expect(validerRecette({ ...recette, lines: [{ ...recette.lines[0], quantity: 1.5 }] }).ok).toBe(false);
  });

  it("refuse un doublon cardId + languageId + section", () => {
    expect(validerRecette({
      ...recette,
      lines: [
        { cardId: "card-1", languageId: "language-1", quantity: 1 },
        { cardId: "card-1", languageId: "language-1", quantity: 2 },
      ],
    }).ok).toBe(false);
  });

  it("accepte la même carte dans deux langues distinctes", () => {
    expect(validerRecette({
      ...recette,
      lines: [
        { cardId: "card-1", languageId: "language-1", quantity: 1 },
        { cardId: "card-1", languageId: "language-2", quantity: 2 },
      ],
    }).ok).toBe(true);
  });
});

describe("validerTransfert", () => {
  it("accepte un transfert valide", () => {
    expect(validerTransfert(transfert).ok).toBe(true);
  });

  it("refuse un champ inconnu", () => {
    expect(validerTransfert({ ...transfert, published: true }).ok).toBe(false);
  });

  it("refuse des emplacements identiques", () => {
    expect(validerTransfert({ ...transfert, toLocationId: transfert.fromLocationId })).toEqual({ ok: false, error: "Les emplacements doivent différer" });
  });

  it("refuse une quantité nulle", () => {
    expect(validerTransfert({ ...transfert, quantity: 0 }).ok).toBe(false);
  });
});
