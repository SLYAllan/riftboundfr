import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("liste des articles", () => {
  test("ignore une catégorie inconnue", () => {
    expect(source).toContain("categories.includes(category)");
  });

  test("propose de retirer un filtre sans résultat", () => {
    expect(source).toContain('href="/articles"');
    expect(source).toContain('t("Voir tous les articles")');
  });

  test("ne charge pas les blocs des articles", () => {
    expect(source).not.toContain("blocks: true");
    expect(source).not.toContain("article.blocks");
  });

  test("formate les dates dans la langue de la page", () => {
    expect(source).toContain("etiquetteLocale");
    expect(source).toContain("langueCourante");
    expect(source).toContain("formatDate(article.publishedAt, locale)");
  });

  test("garde les filtres faciles à toucher sur mobile", () => {
    expect(source.match(/min-h-11/g)).toHaveLength(2);
  });
});
