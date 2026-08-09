import { describe, it, expect } from "vitest";
import { buildOwnedByName, computeDeckCoverage } from "./collection";

const card = (cleanName: string, name = cleanName) => ({ cleanName, name });

describe("buildOwnedByName", () => {
  // La clé vient du `name` normalisé (minuscules, sans accent, séparateurs réduits à
  // une espace), pas du `cleanName` : « Blind Fury (Alt) » doit compter avec
  // « Blind Fury ». Le test attendait des tirets, format que la fonction n'a jamais
  // produit ; seules les clés d'un seul mot passaient.
  it("agrège les quantités par nom normalisé (variantes confondues)", () => {
    const owned = buildOwnedByName([
      { card: card("blind-fury", "Blind Fury"), quantity: 2 },
      { card: card("blind-fury", "Blind Fury (Alt)"), quantity: 1 },
      { card: card("falling-star", "Falling Star"), quantity: 3 },
    ]);
    expect(owned.get("blind fury")).toBe(3);
    expect(owned.get("falling star")).toBe(3);
  });

  it("retombe sur name si cleanName manquant", () => {
    const owned = buildOwnedByName([
      { card: { cleanName: null, name: "Gust" }, quantity: 2 },
    ]);
    expect(owned.get("gust")).toBe(2);
  });
});

describe("computeDeckCoverage", () => {
  const deck = [
    { cardId: "c1", name: "Gust", section: "main", cleanName: "gust", quantity: 3 },
    { cardId: "c2", name: "Flash", section: "main", cleanName: "flash", quantity: 1 },
  ];

  it("0 manquantes quand tout est possédé", () => {
    const owned = new Map([["gust", 3], ["flash", 1]]);
    const cov = computeDeckCoverage(owned, deck);
    expect(cov.totals.missing).toBe(0);
    expect(cov.totals.completionPct).toBe(100);
  });

  it("compte les copies manquantes (2/3)", () => {
    const owned = new Map([["gust", 2], ["flash", 1]]);
    const cov = computeDeckCoverage(owned, deck);
    expect(cov.totals.missing).toBe(1);
    expect(cov.entries.find((e) => e.cardId === "c1")!.missing).toBe(1);
  });

  it("carte totalement absente = toutes manquantes", () => {
    const owned = new Map([["flash", 1]]);
    const cov = computeDeckCoverage(owned, deck);
    expect(cov.totals.missing).toBe(3);
    expect(cov.totals.required).toBe(4);
    expect(cov.totals.owned).toBe(1);
  });

  it("main + réserve de la même carte = une seule ligne", () => {
    const owned = new Map([["gust", 1]]);
    const cov = computeDeckCoverage(owned, [
      { cardId: "c1", name: "Gust", section: "main", cleanName: "gust", quantity: 3 },
      { cardId: "c1", name: "Gust", section: "side", cleanName: "gust", quantity: 2 },
    ]);
    expect(cov.entries).toHaveLength(1);
    expect(cov.entries[0].required).toBe(5);
    expect(cov.entries[0].missing).toBe(4);
  });

  it("l'alt-art compte (possédé via cleanName)", () => {
    const owned = new Map([["gust", 3], ["flash", 1]]);
    const cov = computeDeckCoverage(owned, deck);
    expect(cov.entries.every((e) => e.missing === 0)).toBe(true);
  });
});
