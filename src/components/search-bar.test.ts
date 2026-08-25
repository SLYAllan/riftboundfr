import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./search-bar.tsx", import.meta.url), "utf8");

describe("recherche", () => {
  it("retire les espaces autour de la requête", () => {
    expect(source).toContain("const recherche = query.trim()");
    expect(source).toContain('params.set("q", recherche)');
  });
});
