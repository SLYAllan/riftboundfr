import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("page d'un deck", () => {
  it("ouvre la comparaison avec ce deck déjà sélectionné", () => {
    expect(source).toContain('href={`/decks/compare?a=${encodeURIComponent(deckbuilderCode)}`}');
    expect(source).toContain('{t("Comparer ce deck")}');
  });
});
