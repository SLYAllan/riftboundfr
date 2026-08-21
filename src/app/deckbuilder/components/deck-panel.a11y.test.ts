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
});
