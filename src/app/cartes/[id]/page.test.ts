import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("navigation de la fiche carte vers les decks", () => {
  test("propose tous les decks qui utilisent la carte", () => {
    expect(source).toContain('t("Voir tous les decks avec cette carte")');
    expect(source).toContain('href={`/decks?q=${encodeURIComponent(card.name)}`}');

    const blocDecks = source.indexOf("{relatedDecks.length > 0 && (");
    const finBlocDecks = source.indexOf("\n            )}", blocDecks);
    const action = source.indexOf('t("Voir tous les decks avec cette carte")');
    expect(blocDecks).toBeGreaterThanOrEqual(0);
    expect(finBlocDecks).toBeGreaterThan(blocDecks);
    expect(action).toBeGreaterThan(finBlocDecks);
  });

  test("permet de régler la quantité possédée", () => {
    expect(source).toContain('import { CardCollectionQuantity } from "@/components/collection/card-collection-quantity"');
    expect(source).toContain("<CardCollectionQuantity cardId={card.id} />");
  });
});
