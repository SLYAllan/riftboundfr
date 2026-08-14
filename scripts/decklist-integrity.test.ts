import { describe, expect, it } from "vitest";
import { decklistVendettaComplete, reserveVendettaComplete } from "./decklist-integrity";

describe("reserveVendettaComplete", () => {
  it("accepte exactement dix cartes pour Vendetta", () => {
    expect(reserveVendettaComplete("Vendetta", [
      { quantity: 3 },
      { quantity: 7 },
    ])).toBe(true);
  });

  it("rejette une réserve Vendetta incomplète", () => {
    expect(reserveVendettaComplete("Vendetta", [{ quantity: 9 }])).toBe(false);
  });

  it("ne s'applique pas aux anciens sets", () => {
    expect(reserveVendettaComplete("Unleashed", [])).toBe(true);
  });

  it("accepte une composition Vendetta complète", () => {
    expect(decklistVendettaComplete({
      set: "Vendetta",
      mainDeck: [{ quantity: 39 }],
      champion: "Akali, Deadly Weapon",
      runes: { Calm: 6, Fury: 6 },
      battlefields: ["A", "B", "C"],
      sideDeck: [{ quantity: 10 }],
    })).toEqual({ complete: true, missing: [] });
  });

  it("rejette une liste dont le champion ou les champs de bataille manquent", () => {
    expect(decklistVendettaComplete({
      set: "Vendetta",
      mainDeck: [{ quantity: 39 }],
      champion: null,
      runes: { Calm: 6, Fury: 6 },
      battlefields: [],
      sideDeck: [{ quantity: 10 }],
    })).toEqual({ complete: false, missing: ["champion 0/1", "champs de bataille 0/3"] });
  });

  it("laisse les anciens sets hors de cette règle Vendetta", () => {
    expect(decklistVendettaComplete({
      set: "Unleashed",
      mainDeck: [],
      champion: null,
      runes: {},
      battlefields: [],
      sideDeck: [],
    })).toEqual({ complete: true, missing: [] });
  });
});
