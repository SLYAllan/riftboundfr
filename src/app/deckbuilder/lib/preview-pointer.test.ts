import { describe, expect, it } from "vitest";
import { peutAfficherApercuCarte } from "./preview-pointer";

describe("peutAfficherApercuCarte", () => {
  it("réserve l’aperçu aux pointeurs fins qui gèrent le survol", () => {
    expect(peutAfficherApercuCarte(true, true)).toBe(true);
    expect(peutAfficherApercuCarte(true, false)).toBe(false);
    expect(peutAfficherApercuCarte(false, true)).toBe(false);
  });
});
