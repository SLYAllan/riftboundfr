import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("garde Tous les sets comme choix explicite", () => {
  const source = readFileSync(new URL("./deck-filtre-select.tsx", import.meta.url), "utf8");
  expect(source).toContain('const courant = params.get(nom) ?? valeurParDefaut;');
  expect(source).toContain('<option value="all">');
});
