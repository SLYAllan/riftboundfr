import { describe, it, expect } from "vitest";
import { defaultOverlayState, fusionnerEtatOverlay } from "./overlay";

describe("fusionnerEtatOverlay", () => {
  // Deux écritures (tableau de bord et compagnon) lisaient le même ancien état puis
  // le réécrivaient chacune de leur côté : le dernier arrivé écrasait le changement
  // de l'autre. La fusion appliquée en séquence doit garder les deux champs distincts.
  it("conserve deux patchs sur des champs distincts", () => {
    const premier = fusionnerEtatOverlay(defaultOverlayState(), { points: { a: 1 } });
    const second = fusionnerEtatOverlay(premier, { points: { b: 2 } });
    expect(second.points.a).toBe(1);
    expect(second.points.b).toBe(2);
  });
});
