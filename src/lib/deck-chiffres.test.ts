import { describe, expect, it } from "vitest";
import { energieMoyenne } from "./deck-chiffres";

describe("energieMoyenne", () => {
  it("pondère le coût par le nombre d'exemplaires", () => {
    expect(energieMoyenne([{ energy: 1, quantity: 3 }, { energy: 5, quantity: 1 }])).toBe(2);
  });

  it("ignore les cartes sans coût et compte un coût de zéro", () => {
    expect(energieMoyenne([{ energy: 0, quantity: 2 }, { energy: 4, quantity: 2 }, { energy: null, quantity: 12 }])).toBe(2);
  });

  it("rend null quand aucune carte n'a de coût", () => {
    expect(energieMoyenne([{ energy: null, quantity: 6 }, { quantity: 3 }])).toBeNull();
    expect(energieMoyenne([])).toBeNull();
  });
});
