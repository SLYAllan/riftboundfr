import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "route.ts"), "utf8");

it("refuse une couverture trop grande avant la requete en base", () => {
  expect(source).toContain("items.length > 200");
  expect(source).toContain("status: 413");
});

it("refuse le lot entier si une ligne est invalide", () => {
  expect(source).toContain("valid.length !== items.length");
  expect(source).toContain("Données de deck invalides");
});

it("refuse les identifiants de carte introuvables", () => {
  expect(source).toContain("missingIds.length > 0");
  expect(source).toContain("Cartes introuvables");
});
