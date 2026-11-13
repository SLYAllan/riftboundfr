import { describe, expect, it } from "vitest";
import { DERNIER_BAN, dernierBan, tournoisApresBan } from "./apres-ban";

const apres = "2099-01-01";

describe("tournoisApresBan", () => {
  it("garde un tournoi d'après le ban sans carte bannie", () => {
    const r = tournoisApresBan([{ tournoi: "propre", date: apres, cartes: ["Defy"] }], false);
    expect(r.garder("propre")).toBe(true);
  });

  it("écarte un tournoi d'après le ban où une liste joue encore une carte bannie", () => {
    const r = tournoisApresBan(
      [
        { tournoi: "propre", date: apres, cartes: ["Defy"] },
        { tournoi: "en retard", date: apres, cartes: ["Defy"] },
        { tournoi: "en retard", date: apres, cartes: ["Stacked Deck"] },
      ],
      false,
    );
    expect(r.garder("en retard")).toBe(false);
    expect(r.ecartes).toEqual(["en retard"]);
  });

  it("écarte un tournoi d'avant le ban", () => {
    const r = tournoisApresBan(
      [
        { tournoi: "propre", date: apres, cartes: ["Defy"] },
        { tournoi: "avant", date: "2000-01-01", cartes: ["Defy"] },
      ],
      false,
    );
    expect(r.garder("avant")).toBe(false);
  });

  it("set en cours sans tournoi d'après le ban : ne garde rien", () => {
    const r = tournoisApresBan([{ tournoi: "avant", date: "2000-01-01", cartes: ["Stacked Deck"] }], false);
    expect(r.garder("avant")).toBe(false);
  });

  it("ancien set : garde tout", () => {
    const r = tournoisApresBan([{ tournoi: "ancien set", date: "2000-01-01", cartes: ["Stacked Deck"] }], true);
    expect(r.garder("ancien set")).toBe(true);
    expect(r.depuisBan).toBe(false);
  });

  it("ancien set joué après le ban : ne garde que l'après-ban", () => {
    const r = tournoisApresBan(
      [
        { tournoi: "avant", date: "2000-01-01", cartes: ["Stacked Deck"] },
        { tournoi: "après", date: apres, cartes: ["Defy"] },
      ],
      true,
    );
    expect(r.garder("avant")).toBe(false);
    expect(r.garder("après")).toBe(true);
    expect(r.depuisBan).toBe(true);
  });

  it("date le dernier ban sur la plus récente des annonces", () => {
    expect(DERNIER_BAN >= "2026-09-15").toBe(true);
  });

  // Annoncé le 13 novembre 2026, en vigueur le 23 : entre les deux, les stats
  // comptent encore les listes qui jouent ces cartes.
  it("ignore un ban annoncé tant qu'il n'est pas en vigueur", () => {
    expect(dernierBan("2026-11-22")).toBe("2026-09-15");
    expect(dernierBan("2026-11-23")).toBe("2026-11-23");
    const stuttgart = [{ tournoi: "Stuttgart", date: "2026-11-08", cartes: ["Star Spring"] }];
    expect(tournoisApresBan(stuttgart, false, "2026-11-22").garder("Stuttgart")).toBe(true);
    expect(tournoisApresBan(stuttgart, false, "2026-11-23").garder("Stuttgart")).toBe(false);
  });
});
