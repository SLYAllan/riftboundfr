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

  // La panne « aucun bouton ne réagit » : l'état stocké datait d'une version plus
  // ancienne, il repartait tel quel dans la sauvegarde de l'état entier, et le serveur
  // refusait TOUT. Ce qui sort de applyStateUpdate doit toujours passer la validation.
  it("remet en forme un état écrit par une version plus ancienne", () => {
    const ancien = {
      event: { title: "Coupe", round: "T8", vitrine: true },
      format: "BO7",
      maxPoints: 12,
      points: { a: 99, b: null },
      players: [
        { name: "Alice", deck: "vieux champ", gamesWon: 42, battlefields: ["a", "b", "c", "d"] },
        { name: "Bob", legendId: 7 },
      ],
      // La forme d'avant : `auto` en tableau, aucun `mode`.
      cards: { lists: [["Fireball"], []], auto: [true, false], seconds: 900 },
    } as never;

    const remis = applyStateUpdate(ancien, {});

    expect(remis.cards.auto).toBe(false);
    expect(remis.cards.mode).toBe("none");
    expect(remis.format).toBe("BO3");
    expect(remis.maxPoints).toBe(10);
    expect(remis.points).toEqual({ a: 10, b: 0 });
    expect(remis.players[0].battlefields).toHaveLength(3);
    expect(remis.players[0].gamesWon).toBe(5);
    expect(remis.players[1].legendId).toBeNull();
    expect(remis.players[0]).not.toHaveProperty("deck");
    expect(remis.event).not.toHaveProperty("vitrine");
    expect(validerPatchOverlay(JSON.parse(JSON.stringify(remis)))).toMatchObject({ ok: true });
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
