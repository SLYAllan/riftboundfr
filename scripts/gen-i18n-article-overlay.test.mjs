import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("./gen-i18n-article-overlay.mts", import.meta.url), "utf8");

describe("générateur des traductions d’articles", () => {
  test("relit le titre et le chapô de chaque article publié", () => {
    expect(source).toContain("TRADUCTIONS_ARTICLES");
    expect(source).toContain("published: true");
    expect(source).toContain("select: { slug: true, title: true, excerpt: true }");
    expect(source).toContain("traduction d’article manquante");
  });

  test("conserve la génération des blocs de l’article overlay", () => {
    expect(source).toContain("articleOverlay.blocks");
    expect(source).toContain("traduction de bloc manquante");
  });
});
