import { describe, expect, it } from "vitest";
import { calculerMeta } from "./meta-stats";

const tranches = [
  { legendName: "Kennen, Heart of the Tempest", tournament: "Beijing", set: "Vendetta", count: 30 },
  { legendName: "Kai'Sa, Daughter of the Void", tournament: "Beijing", set: "Vendetta", count: 20 },
  { legendName: "Kai'Sa, Daughter of the Void", tournament: "Hartford", set: "Unleashed", count: 50 },
];

describe("calculerMeta", () => {
  it("recalcule rangs et popularité sur la sélection", () => {
    const meta = calculerMeta(tranches, { tournoi: "Beijing", set: "Vendetta" });

    expect(meta.totalDecks).toBe(50);
    expect(meta.legendes.map((l) => [l.legendName, l.deckCount, l.popularity])).toEqual([
      ["Kennen, Heart of the Tempest", 30, 60],
      ["Kai'Sa, Daughter of the Void", 20, 40],
    ]);
  });

  it("agrège plusieurs tournois sans conserver le total historique", () => {
    const meta = calculerMeta(tranches, { tournoi: "all", set: "all" });

    expect(meta.totalDecks).toBe(100);
    expect(meta.legendes[0]).toMatchObject({
      legendName: "Kai'Sa, Daughter of the Void",
      deckCount: 70,
      popularity: 70,
    });
  });
});
