import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const comparateur = readFileSync(new URL("./deck-compare.tsx", import.meta.url), "utf8");

describe("saisie du comparateur", () => {
  it("désactive la comparaison tant qu'un code manque", () => {
    expect(comparateur).toContain("disabled={!codeA.trim() || !codeB.trim()}");
  });

  it("indique précisément chaque code invalide", () => {
    expect(page).toContain("invalidA={Boolean(a && !deckA)}");
    expect(page).toContain("invalidB={Boolean(b && !deckB)}");
    expect(comparateur).toContain('Code du deck A invalide');
    expect(comparateur).toContain('Code du deck B invalide');
  });

  it("refuse une comparaison quand une carte du code manque en base", () => {
    expect(page).toContain("const { map: cardMap, missing }");
    expect(page).toContain("if (missing.length > 0) return null");
  });

  it("garde le code invalide dans le champ pour le corriger", () => {
    expect(page).toContain("codeAInitial={a ?? \"\"}");
    expect(comparateur).toContain("useState(codeAInitial)");
  });
});
