import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "binder-explorer.tsx"), "utf8");

it("sauvegarde chaque lot de quantités en une requête atomique", () => {
  expect(source).toContain('fetch("/api/collection/bulk"');
  expect(source).toContain("items: Object.entries(cartes)");
});
