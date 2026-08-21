import { describe, expect, it } from "vitest";
import { applyStateUpdate, defaultOverlayState } from "./overlay";
import {
  bornerEtape,
  fusionnerPatchs,
  memoriserManche,
  patchPourRestaurerManche,
} from "./overlay-compagnon-client";

describe("file d’envoi du compagnon", () => {
  it("fusionne les changements imbriqués sans perdre un joueur", () => {
    expect(
      fusionnerPatchs(
        { players: [{ name: "A" }, {}] },
        { points: { a: 3 }, players: [{}, { name: "B" }] },
      ),
    ).toMatchObject({ players: [{ name: "A" }, { name: "B" }], points: { a: 3 } });
  });



  it("borne le parcours entre les trois étapes", () => {
    expect(bornerEtape(-1)).toBe(0);
    expect(bornerEtape(1)).toBe(1);
    expect(bornerEtape(8)).toBe(2);
  });

  it("restaure les points et les manches précédant la fin de manche", () => {
    const state = applyStateUpdate(defaultOverlayState(), {
      points: { a: 7, b: 5 },
      players: [{ gamesWon: 1 }, { gamesWon: 0 }],
    });
    const memoire = memoriserManche(state);
    expect(patchPourRestaurerManche(memoire)).toEqual({
      points: { a: 7, b: 5 },
      players: [{ gamesWon: 1 }, { gamesWon: 0 }],
    });
  });
});
