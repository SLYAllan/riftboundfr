import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "deck-panel.tsx"), "utf8");

describe("sections repliables du panneau de deck", () => {
  it("expose aria-expanded sur les sections repliables", () => {
    // Le bouton plie/déplie chaque section du deck ; sans aria-expanded,
    // un lecteur d'écran ne sait pas si « Légende » est ouvert ou fermé.
    expect(source).toContain("aria-expanded={open}");
  });

  it("guide l’ajout de cartes quand une Légende existe dans un deck vide", () => {
    expect(source).toMatch(
      /\{sortedMain\.length > 0 \?[\s\S]*?\) : deck\.legend \? \([\s\S]*?Ajoutez des cartes depuis l’onglet Deck[\s\S]*?\) : EMPTY_HINT\}/,
    );
  });

  it("garde les actions des cartes tactiles sur mobile", () => {
    expect(source).toContain('"flex h-11 w-11 sm:h-8 sm:w-8');
  });
});
