import { describe, it, expect } from "vitest";
import { buildCardLookup } from "./card-printing";

const card = (riftboundId: string, name: string, set: string, collectorNumber: number) =>
  ({ riftboundId, name, set, collectorNumber });

describe("buildCardLookup", () => {
  // Même règle que le deckbuilder : set croissant, puis numéro de collection.
  it("choisit la même impression quel que soit l'ordre de la base", () => {
    const cards = [card("opp-183", "Stacked Deck", "OPP", 183), card("ogn-183", "Stacked Deck", "OGN", 183)];
    expect(buildCardLookup(cards).get("Stacked Deck")!.riftboundId).toBe("ogn-183");
    expect(buildCardLookup([...cards].reverse()).get("Stacked Deck")!.riftboundId).toBe("ogn-183");
  });

  it("départage deux impressions du même set par le numéro", () => {
    const cards = [card("ven-171", "Riven, Shattered", "VEN", 171), card("ven-041", "Riven, Shattered", "VEN", 41)];
    expect(buildCardLookup(cards).get("Riven, Shattered")!.riftboundId).toBe("ven-041");
  });

  it("indexe toujours par identifiant exact et en minuscules", () => {
    const map = buildCardLookup([card("ogn-183", "Stacked Deck", "OGN", 183)]);
    expect(map.get("ogn-183")!.name).toBe("Stacked Deck");
    expect(map.get("stacked deck")!.riftboundId).toBe("ogn-183");
  });
});
