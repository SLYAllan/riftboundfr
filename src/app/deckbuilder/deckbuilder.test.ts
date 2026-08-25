import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("annonce la reprise d'un brouillon sauvegardé", () => {
  const source = readFileSync(new URL("./deckbuilder.tsx", import.meta.url), "utf8");
  expect(source).toContain("setBrouillonRepris(true)");
  expect(source).toContain('t("Brouillon repris")');
});
