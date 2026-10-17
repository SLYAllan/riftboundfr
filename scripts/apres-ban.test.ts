import { describe, expect, it } from "vitest";
import { DERNIER_BAN, tournoisApresBan } from "./apres-ban";

const apres = "2099-01-01";

describe("tournoisApresBan", () => {
  it("garde un tournoi d'après le ban sans carte bannie", () => {
    const r = tournoisApresBan([{ tournoi: "propre", date: apres, cartes: ["Defy"] }]);
    expect(r.garder("propre")).toBe(true);
  });

  it("écarte un tournoi d'après le ban où une liste joue encore une carte bannie", () => {
    const r = tournoisApresBan([
      { tournoi: "propre", date: apres, cartes: ["Defy"] },
      { tournoi: "en retard", date: apres, cartes: ["Defy"] },
      { tournoi: "en retard", date: apres, cartes: ["Stacked Deck"] },
    ]);
    expect(r.garder("en retard")).toBe(false);
    expect(r.ecartes).toEqual(["en retard"]);
  });

  it("écarte un tournoi d'avant le ban", () => {
    const r = tournoisApresBan([
      { tournoi: "propre", date: apres, cartes: ["Defy"] },
      { tournoi: "avant", date: "2000-01-01", cartes: ["Defy"] },
    ]);
    expect(r.garder("avant")).toBe(false);
  });

  it("garde tout quand aucun tournoi n'est d'après le ban", () => {
    const r = tournoisApresBan([{ tournoi: "ancien set", date: "2000-01-01", cartes: ["Stacked Deck"] }]);
    expect(r.garder("ancien set")).toBe(true);
  });

  it("date le dernier ban sur la plus récente des annonces", () => {
    expect(DERNIER_BAN >= "2026-09-15").toBe(true);
  });
});
