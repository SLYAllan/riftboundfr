import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/app/deckbuilder/components/import-modal.tsx", "utf8");
const anglais = readFileSync("src/lib/i18n-en.ts", "utf8");

describe("fenêtre d'import", () => {
  it("nomme le champ et expose l'onglet choisi", () => {
    expect(source.match(/aria-label=\{t\("Contenu à importer"\)\}/g)).toHaveLength(2);
    expect(source).toMatch(/aria-pressed=\{activeTab === tab\.key\}/);
    expect(anglais).toContain('"Contenu à importer":');
  });
});
