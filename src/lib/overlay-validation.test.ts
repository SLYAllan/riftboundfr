import { describe, expect, it } from "vitest";
import { validerPatchOverlay } from "./overlay-validation";

describe("validerPatchOverlay", () => {
  it("accepte une mise à jour partielle conforme au tableau de bord", () => {
    const patch = {
      event: { round: "Finale", timerVisible: true, pointsVisible: false },
      format: "BO3",
      points: { a: 4 },
      players: [{ name: "Allan", battlefields: ["The Grand Plaza"] }, {}],
      cards: { lists: [["Fireball"], []], ignored: [[], []], mode: "mixed", auto: false, index: [0, 0], seconds: 5 },
    } as const;

    expect(validerPatchOverlay(patch)).toEqual({ ok: true, value: patch });
  });

  it("refuse un interrupteur d'affichage qui n'est pas un booléen", () => {
    expect(validerPatchOverlay({ event: { pointsVisible: "oui" } })).toEqual({
      ok: false,
      error: "event.pointsVisible doit être un booléen",
    });
  });

  it("refuse les propriétés inconnues et les chaînes démesurées", () => {
    expect(validerPatchOverlay({ admin: true })).toEqual({ ok: false, error: "Champ overlay inconnu : admin" });
    expect(validerPatchOverlay({ event: { title: "x".repeat(121) } })).toEqual({
      ok: false,
      error: "event.title dépasse 120 caractères",
    });
  });
});
