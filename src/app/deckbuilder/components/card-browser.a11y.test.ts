import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "card-browser.tsx"), "utf8");

describe("accessibilité du navigateur de cartes", () => {
  it("nomme les deux bornes de chaque curseur", () => {
    // Deux <input type="range"> superposés : sans aria-label, chacun est
    // annoncé « curseur » sans dire quelle valeur il règle.
    expect(source).toContain("aria-label={`${label} minimum`}");
    expect(source).toContain("aria-label={`${label} maximum`}");
  });

  it("expose l'état du bouton qui ouvre les curseurs", () => {
    expect(source).toContain("aria-expanded={showSliders}");
  });

  it("expose l'état des filtres de domaine", () => {
    expect(source).toContain("aria-pressed={active}");
  });
});
