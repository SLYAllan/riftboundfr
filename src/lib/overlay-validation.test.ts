import { describe, expect, it } from "vitest";
import { validerPatchOverlay } from "./overlay-validation";

describe("validerPatchOverlay", () => {
  it("accepte une mise à jour partielle conforme au tableau de bord", () => {
    const patch = {
      event: { round: "Finale", timerVisible: true },
      format: "BO3",
      points: { a: 4 },
      players: [{ name: "Allan", battlefields: ["The Grand Plaza"] }, {}],
      cards: { lists: [["Fireball"], []], shown: "Fireball" },
    } as const;

    expect(validerPatchOverlay(patch)).toEqual({ ok: true, value: patch });
  });

  it("refuse les propriétés inconnues et les chaînes démesurées", () => {
    expect(validerPatchOverlay({ admin: true })).toEqual({ ok: false, error: "Champ overlay inconnu : admin" });
    expect(validerPatchOverlay({ event: { title: "x".repeat(121) } })).toEqual({
      ok: false,
      error: "event.title dépasse 120 caractères",
    });
  });
});
