import { describe, expect, it } from "vitest";
import { applyStateUpdate, defaultOverlayState, type OverlayStateData } from "./overlay";
import * as compagnon from "./overlay-compagnon-client";
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

  it("termine un BO3 quand le vainqueur gagne sa deuxième manche", () => {
    const state = applyStateUpdate(defaultOverlayState(), {
      format: "BO3",
      points: { a: 8, b: 4 },
      players: [{ gamesWon: 1 }, { gamesWon: 1 }],
    });

    const resultat = (compagnon as typeof compagnon & {
      resultatFinDeManche?: (state: OverlayStateData, gagnant: 0 | 1) => unknown;
    }).resultatFinDeManche?.(state, 0);

    expect(resultat).toEqual({
      matchTermine: true,
      patch: {
        points: { a: 0, b: 0 },
        players: [{ gamesWon: 2 }, {}],
      },
    });
  });

  it("envoie le nouveau match d'un coup après sa préparation", () => {
    const state = applyStateUpdate(defaultOverlayState(), {
      format: "BO3",
      maxPoints: 8,
      players: [
        { name: "Nouveau A", legendId: "1", legendName: "Ahri", championName: "Ahri", battlefields: ["Arena"] },
        { name: "Nouveau B", legendId: "2", legendName: "Sett", championName: "Sett", battlefields: ["Mine"] },
      ],
    });
    const patch = (compagnon as typeof compagnon & {
      patchPourNouveauMatch?: (state: OverlayStateData) => unknown;
    }).patchPourNouveauMatch?.(state);

    expect(patch).toEqual({
      format: "BO3",
      maxPoints: 8,
      points: { a: 0, b: 0 },
      players: [
        { name: "Nouveau A", legendId: "1", legendName: "Ahri", championName: "Ahri", battlefields: ["Arena"], gamesWon: 0 },
        { name: "Nouveau B", legendId: "2", legendName: "Sett", championName: "Sett", battlefields: ["Mine"], gamesWon: 0 },
      ],
      cards: { lists: [[], []], ignored: [[], []], mode: "none", auto: false, index: [0, 0] },
    });
  });
});
