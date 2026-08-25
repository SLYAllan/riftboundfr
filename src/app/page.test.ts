import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("actions principales de l'accueil", () => {
  test("présente les trois entrées dans le hero", () => {
    expect(source).toContain('href="/decks"');
    expect(source).toContain('href="/cartes"');
    expect(source).toContain('href="/guides/debuter"');
    expect(source).toContain('t("Trouver un deck")');
    expect(source).toContain('t("Voir les cartes")');
    expect(source).toContain('t("Débuter")');
  });
});
