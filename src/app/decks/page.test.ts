import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("traduit les textes explicatifs et les états des decks", () => {
  const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
  expect(source).toContain('t("On garde ici le meilleur deck de chaque Légende par tournoi, les decks avec guide et ceux de la communauté.")');
  expect(source).toContain('t(ownedOnly ? "Voir tous les decks"');
  expect(source).toContain('t("Jouable avec votre collection")');
  expect(source).toContain('t("par")');
  expect(source).toContain("etiquetteLocale");
  expect(source).toContain("formatDate(deck.createdAt, locale)");
  expect(source).toContain("TAG_OPTIONS.map((tag)");
  expect(source).toContain("{t(tag)}");
  expect(source).toContain("{t(tagFilter)}");
});

test("garde les traductions des styles communautaires courts", () => {
  const page = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
  const dictionnaire = readFileSync(new URL("../../lib/i18n-en.ts", import.meta.url), "utf8");
  expect(page).toContain("{t(tag)}");
  expect(dictionnaire).toContain('"contrôle": "control"');
  expect(dictionnaire).toContain('"compétitif": "competitive"');
});
