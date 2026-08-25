import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("permet de copier l'URL des filtres actifs", () => {
  const source = readFileSync(new URL("./card-filters.tsx", import.meta.url), "utf8");
  expect(source).toContain("navigator.clipboard.writeText(window.location.href)");
  expect(source).toContain('t("Copier le lien")');
});
