import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const page = readFileSync(resolve(__dirname, "page.tsx"), "utf8");
const filtres = readFileSync(resolve(__dirname, "../../components/card-filters.tsx"), "utf8");

describe("filtre de mécaniques de la liste des cartes", () => {
  it("filtre côté serveur avec des options contextuelles", () => {
    expect(page).toContain("preparerFiltreMotCle");
    expect(page).toContain("params.mechanic");
    expect(page).toContain("mecaniques={mecaniques}");
  });

  it("conserve la mécanique dans les filtres partageables", () => {
    expect(filtres).toContain("<KeywordFilter");
    expect(filtres).toContain('set("mechanic"');
    expect(filtres).toContain('get("mechanic")');
  });
});
