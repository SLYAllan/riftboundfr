import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/app/deckbuilder/components/import-modal.tsx", "utf8");

describe("fenêtre d'import", () => {
  it("nomme le champ et expose l'onglet choisi", () => {
    expect(source).toMatch(/aria-label=\{t\("Contenu à importer"\)\}/g);
    expect(source).toMatch(/aria-pressed=\{activeTab === tab\.key\}/);
  });
});
