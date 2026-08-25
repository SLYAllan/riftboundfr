import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("traduit les états de la grille de cartes", () => {
  const source = readFileSync(new URL("./card-grid.tsx", import.meta.url), "utf8");
  expect(source).toContain("const t = await tr()");
  expect(source).toContain('t("Aucune carte ne correspond à votre recherche. Modifiez vos filtres.")');
  expect(source).toContain('t("Pas d’image")');
});
