import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "route.ts"), "utf8");

describe("panier CardNexus", () => {
  it("refuse un deck ou une liste dont des cartes n'ont pas ete resolues", () => {
    expect(source).toContain("missing.length > 0");
    expect(source).toContain("absentes.length > 0");
  });

  it("renvoie un GET vers l'adresse publique du site, pas celle du serveur", () => {
    // Derrière le proxy, `request.url` valait https://0.0.0.0:3000/… en production.
    expect(source).toContain("new URL(page, process.env.NEXT_PUBLIC_SITE_URL || request.url)");
  });
});
