import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "route.ts"), "utf8");

it("refuse tout l'import avant de choisir un classeur si une carte est inconnue", () => {
  expect(source.indexOf("unmatched.length > 0")).toBeLessThan(source.indexOf("binderId = (await getOrCreateDefaultBinder"));
  expect(source).toContain('error: "cards_not_found"');
});
