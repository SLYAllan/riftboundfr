import { describe, expect, it } from "vitest";
import { getErrata } from "./errata";

describe("getErrata", () => {
  it("rend la date de l'annonce de chaque vague", () => {
    expect(getErrata("Neeko, Blending In")?.date).toBe("9 octobre 2026");
    expect(getErrata("Draven, Vanquisher")?.date).toBe("23 juillet 2026");
  });

  it("retrouve l'errata d'une variante d'impression", () => {
    expect(getErrata("Elnuk Herd (Metal)")?.name).toBe("Elnuk Herd");
  });

  it("ne rend rien pour une carte sans errata", () => {
    expect(getErrata("Elnuk Herder")).toBeUndefined();
  });
});
