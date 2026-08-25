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

  test("distingue une panne des listes vraiment vides", () => {
    expect(source).toContain("chargementEchoue");
    expect(source).toContain('t("Les données n’ont pas pu se charger.")');
    expect(source).toContain("cardCount > 0");
  });

  test("ouvre la page méta depuis la carte dédiée", () => {
    expect(source).toContain('href: "/meta"');
    expect(source).not.toContain('href: "/guides/meta"');
  });
});
