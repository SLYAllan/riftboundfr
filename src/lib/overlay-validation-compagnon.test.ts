import { describe, expect, it } from "vitest";
import { validerPatchCompagnon } from "./overlay-validation";

describe("validerPatchCompagnon", () => {
  it("accepte ce que le compagnon envoie vraiment", () => {
    const r = validerPatchCompagnon({
      format: "BO3",
      maxPoints: 8,
      points: { a: 2, b: 1 },
      players: [{ name: "Allan", gamesWon: 1, battlefields: ["Yasuo"] }, { gamesWon: 0 }],
    });
    expect(r.ok).toBe(true);
  });

  it("refuse le décor et le titre du tournoi", () => {
    expect(validerPatchCompagnon({ event: { title: "Pris" } }).ok).toBe(false);
  });

  it("refuse un lien de caméra", () => {
    expect(validerPatchCompagnon({ players: [{ camUrl: "https://vdo.ninja/?view=x" }, {}] }).ok).toBe(false);
  });
});
