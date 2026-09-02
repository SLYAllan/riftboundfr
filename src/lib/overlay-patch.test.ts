import { describe, expect, it } from "vitest";
import { fusionnerPatchs } from "./overlay";

describe("fusionnerPatchs", () => {
  it("garde le champ que le second patch ne touche pas", () => {
    const f = fusionnerPatchs({ event: { title: "Locale" } }, { event: { round: "Ronde 3" } });
    expect(f.event).toEqual({ title: "Locale", round: "Ronde 3" });
  });

  it("le second l’emporte sur le même champ", () => {
    const f = fusionnerPatchs({ points: { a: 1 } }, { points: { a: 2 } });
    expect(f.points).toEqual({ a: 2 });
  });

  it("fusionne les joueurs par position, sans mélanger les deux", () => {
    const f = fusionnerPatchs(
      { players: [{ name: "Allan" }, {}] },
      { players: [{}, { gamesWon: 1 }] },
    );
    expect(f.players).toEqual([{ name: "Allan" }, { gamesWon: 1 }]);
  });

  it("remplace une liste de cartes au lieu de la concaténer", () => {
    const f = fusionnerPatchs({ cards: { lists: [["A"], []] } }, { cards: { lists: [["B"], []] } });
    expect(f.cards?.lists).toEqual([["B"], []]);
  });

  it("laisse absent ce qu’aucun des deux patchs ne porte", () => {
    expect(fusionnerPatchs({ format: "BO3" }, {})).toEqual({ format: "BO3" });
  });
});
