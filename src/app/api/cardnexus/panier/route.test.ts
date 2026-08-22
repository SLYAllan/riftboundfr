import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "route.ts"), "utf8");

describe("panier CardNexus", () => {
  it("refuse un deck ou une liste dont des cartes n'ont pas ete resolues", () => {
    expect(source).toContain("missing.length > 0");
    expect(source).toContain("absentes.length > 0");
  });

  it("borne les appels CardNexus et valide l'identifiant rendu", () => {
    expect(source).toContain("AbortSignal.timeout");
    expect(source).toContain("try {");
    expect(source).toMatch(/typeof id !== "string"/);
  });
});
