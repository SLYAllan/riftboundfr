import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "card-browser.tsx"), "utf8");
const recherche = readFileSync(resolve(__dirname, "search-bar.tsx"), "utf8");

describe("accessibilité du navigateur de cartes", () => {
  it("nomme les deux bornes de chaque curseur", () => {
    // Deux <input type="range"> superposés : sans aria-label, chacun est
    // annoncé « curseur » sans dire quelle valeur il règle.
    expect(source).toContain("aria-label={`${label} minimum`}");
    expect(source).toContain("aria-label={`${label} maximum`}");
  });

  it("donne une cible tactile de 24 px aux poignées", () => {
    expect(source.match(/\[&::-webkit-slider-thumb\]:h-6/g)).toHaveLength(2);
    expect(source.match(/\[&::-webkit-slider-thumb\]:w-6/g)).toHaveLength(2);
    expect(source.match(/\[&::-moz-range-thumb\]:pointer-events-auto/g)).toHaveLength(2);
    expect(source.match(/\[&::-moz-range-thumb\]:h-6/g)).toHaveLength(2);
    expect(source.match(/\[&::-moz-range-thumb\]:w-6/g)).toHaveLength(2);
  });

  it("expose l'état du bouton qui ouvre les curseurs", () => {
    expect(source).toContain("aria-expanded={showSliders}");
  });

  it("expose l'état des filtres de domaine", () => {
    expect(source).toContain("aria-pressed={active}");
  });

  it("garde la recherche tactile et borne les résultats rendus", () => {
    expect(recherche).toMatch(/<input[\s\S]{0,400}className="[^"]*h-11[^"]*sm:h-7/);
    expect(source).toContain('const selectClass = "min-h-11 sm:h-8');
    expect(source).toContain("filtered.slice(0, 120).map");
    expect(source).toContain("filtered.length > 120");
  });
});
