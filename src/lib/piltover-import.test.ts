import { describe, it, expect } from "vitest";
import { parsePiltoverCsv, aggregateByCard, validerLotCollection } from "./piltover-import";

const HEADER =
  "Variant Number,Card Name,Set,Set Prefix,Rarity,Variant Type,Variant Label,Foil,Quantity,Language,Condition,Grading Company,Grading Value,Grading Label,Notes";

describe("parsePiltoverCsv", () => {
  it("parse une ligne simple", () => {
    const rows = parsePiltoverCsv(
      `${HEADER}\nOGN-025,Blind Fury,Origins,OGN,Rare,Standard,Standard,true,2,English,Near Mint,,,,Allan`,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      setPrefix: "OGN",
      collectorNumber: 25,
      cardName: "Blind Fury",
      variantType: "Standard",
      quantity: 2,
    });
  });

  it("gère les virgules dans un nom entre guillemets", () => {
    const rows = parsePiltoverCsv(
      `${HEADER}\nOGN-027,"Darius, Trifarian",Origins,OGN,Rare,Standard,Standard,true,1,English,Near Mint,,,,Allan`,
    );
    expect(rows[0].cardName).toBe("Darius, Trifarian");
    expect(rows[0].collectorNumber).toBe(27);
    expect(rows[0].quantity).toBe(1);
  });

  it("gère un numéro de variante à suffixe (UNL-169-PreRelease)", () => {
    const rows = parsePiltoverCsv(
      `${HEADER}\nUNL-169-PreRelease,"Ashe, Focused",Unleashed,UNL,Rare,Promo,Pre-Rift Promo,true,2,English,Near Mint,,,,SLY`,
    );
    expect(rows[0].setPrefix).toBe("UNL");
    expect(rows[0].collectorNumber).toBe(169);
    expect(rows[0].variantType).toBe("Promo");
    expect(rows[0].variantLabel).toBe("Pre-Rift Promo");
  });

  it("ignore les lignes vides", () => {
    const rows = parsePiltoverCsv(`${HEADER}\n\n`);
    expect(rows).toHaveLength(0);
  });

  it.each(["", "0", "-1", "2 cartes", "10000"])(
    "refuse la quantité Piltover invalide %j",
    (quantity) => {
      expect(() =>
        parsePiltoverCsv(
          `${HEADER}\nOGN-025,Blind Fury,Origins,OGN,Rare,Standard,Standard,true,${quantity},English,Near Mint,,,,Allan`,
        ),
      ).toThrow("quantite invalide");
    },
  );
});

describe("aggregateByCard", () => {
  it("somme les quantités pour une même carte (lignes par binder)", () => {
    const agg = aggregateByCard([
      { cardId: "ash", quantity: 1 },
      { cardId: "ash", quantity: 2 },
      { cardId: "gust", quantity: 3 },
    ]);
    expect(agg).toHaveLength(2);
    expect(agg.find((a) => a.cardId === "ash")!.quantity).toBe(3);
    expect(agg.find((a) => a.cardId === "gust")!.quantity).toBe(3);
  });

  it("refuse une somme qui dépasse la limite d'une carte", () => {
    expect(() =>
      aggregateByCard([
        { cardId: "ash", quantity: 6000 },
        { cardId: "ash", quantity: 4000 },
      ]),
    ).toThrow("quantite invalide");
  });
});

describe("validerLotCollection", () => {
  it("refuse tout le lot si une entrée est invalide", () => {
    expect(
      validerLotCollection([
        { cardId: "carte-valide", quantity: 2 },
        { cardId: "carte-invalide", quantity: -1 },
      ]),
    ).toBeNull();
  });

  it("refuse les cartes en double dans un lot", () => {
    expect(
      validerLotCollection([
        { cardId: "meme-carte", quantity: 1 },
        { cardId: "meme-carte", quantity: 2 },
      ]),
    ).toBeNull();
  });

  it("rend le lot valide sans le modifier", () => {
    const items = [
      { cardId: "carte-a", quantity: 0 },
      { cardId: "carte-b", quantity: 9999 },
    ];
    expect(validerLotCollection(items)).toEqual(items);
  });
});
