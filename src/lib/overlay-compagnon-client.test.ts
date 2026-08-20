import { describe, expect, it } from "vitest";
import { applyStateUpdate, defaultOverlayState } from "./overlay";
import {
  bornerEtape,
  creerFilePatchs,
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

  it("attend la réponse avant d’envoyer le patch suivant", async () => {
    let finirPremier: (() => void) | undefined;
    const recus: unknown[] = [];
    const file = creerFilePatchs(async (patch) => {
      recus.push(patch);
      if (recus.length === 1) await new Promise<void>((resolve) => { finirPremier = resolve; });
    });

    file.ajouter({ points: { a: 1 } });
    file.ajouter({ points: { a: 2 } });
    await Promise.resolve();
    expect(recus).toEqual([{ points: { a: 1 } }]);

    finirPremier?.();
    await file.quandVide();
    expect(recus).toEqual([{ points: { a: 1 } }, { points: { a: 2 } }]);
  });

  it("ne sort pas le patch en attente pendant un envoi", async () => {
    let finir: (() => void) | undefined;
    let appels = 0;
    const file = creerFilePatchs(async () => {
      appels += 1;
      if (appels === 1) await new Promise<void>((resolve) => { finir = resolve; });
    });
    file.ajouter({ points: { a: 1 } });
    file.ajouter({ points: { a: 2 } });
    expect(file.prendreEnAttente()).toBeNull();
    finir?.();
    await file.quandCalme();
  });

  it("remet un patch refusé dans la file jusqu’au nouvel essai", async () => {
    let echoue = true;
    const recus: unknown[] = [];
    const file = creerFilePatchs(async (patch) => {
      recus.push(patch);
      if (echoue) throw new Error("hors ligne");
    });

    file.ajouter({ points: { a: 4 } });
    await file.quandCalme();
    expect(file.aDesChangements()).toBe(true);

    echoue = false;
    file.renvoyer();
    await file.quandVide();
    expect(recus).toEqual([{ points: { a: 4 } }, { points: { a: 4 } }]);
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
