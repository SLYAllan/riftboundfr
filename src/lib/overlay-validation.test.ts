import { describe, expect, it } from "vitest";
import { validerPatchOverlay } from "./overlay-validation";
import { applyStateUpdate, defaultOverlayState } from "./overlay";

describe("validerPatchOverlay", () => {
  // Le tableau de bord envoie l'état ENTIER à chaque sauvegarde. Si un champ d'état
  // n'est pas dans la liste des champs permis, tout le tableau de bord cesse de
  // sauver (400) au lieu de perdre juste ce champ.
  it("accepte l'état entier, y compris après un échange de joueurs", () => {
    const base = defaultOverlayState();
    base.players[0] = { ...base.players[0], name: "Alice", legendName: "Diana", gamesWon: 2, camUrl: "https://vdo.ninja/?view=a", camNonce: Date.now() };
    base.players[1] = { ...base.players[1], name: "Bob", legendName: "Jax", gamesWon: 1 };
    base.event = { ...base.event, round: "Finale", paused: 42 };
    base.points = { a: 5, b: 3 };

    const echange = applyStateUpdate(base, {
      players: [base.players[1], base.players[0]],
      points: { a: base.points.b, b: base.points.a },
    });

    expect(echange.players.map((p) => p.name)).toEqual(["Bob", "Alice"]);
    expect(validerPatchOverlay(JSON.parse(JSON.stringify(echange)))).toMatchObject({ ok: true });
  });


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
