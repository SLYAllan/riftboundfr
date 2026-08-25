import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("traduit les états de la grille de cartes", () => {
  const source = readFileSync(new URL("./card-grid.tsx", import.meta.url), "utf8");
  expect(source).toContain("const t = await tr()");
  expect(source).toContain('t("Aucune carte ne correspond à votre recherche. Modifiez vos filtres.")');
  expect(source).toContain('t("Pas d’image")');
});

test("contient un nom de set long dans sa tuile", () => {
  const source = readFileSync(new URL("./card-grid.tsx", import.meta.url), "utf8");
  expect(source).toContain('className="mt-1 flex min-w-0 items-center gap-2"');
  expect(source).toContain('className="min-w-0 truncate text-xs text-ink-muted"');
  expect(source).toContain('<RarityBadge rarity={card.rarity} className="shrink-0" />');
  expect(source).toContain('title={card.setName}');
});
