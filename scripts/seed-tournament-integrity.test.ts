import { describe, expect, it } from "vitest";
import { sourceDuDeck, slugsDuLot } from "./seed-tournament-integrity";

describe("slugsDuLot", () => {
  it("utilise les identifiants exacts des JSON plutôt qu'un préfixe supposé", () => {
    expect(slugsDuLot([
      { id: "deck-kai-nan-226535" },
      { id: "deck-fei-dao-226407" },
      { id: "deck-kai-nan-226535" },
    ])).toEqual(["deck-kai-nan-226535", "deck-fei-dao-226407"]);
  });

  it("conserve les deux noms historiques du champ source", () => {
    expect(sourceDuDeck({ sourceUrl: "https://riftdecks.com/deck-new" })).toBe("https://riftdecks.com/deck-new");
    expect(sourceDuDeck({ source: "https://riftdecks.com/deck-old" })).toBe("https://riftdecks.com/deck-old");
    expect(sourceDuDeck({})).toBeNull();
  });
});
