import { describe, expect, it } from "vitest";
import { construireWhere, lireFiltresDecks, type FiltresDecks } from "./deck-listing-params";

const base: FiltresDecks = { q: "", owned: false, offset: 0 };

describe("construireWhere", () => {
  it('"Tous" écarte les listes de tournoi non best-of', () => {
    expect(construireWhere(base).OR).toEqual([{ tournamentContext: null }, { featured: true }]);
  });

  it('"Toutes les listes" ne filtre ni sur featured ni sur le contexte', () => {
    const where = construireWhere({ ...base, cat: "all" });
    expect(where.OR).toBeUndefined();
    expect(where.featured).toBeUndefined();
    expect(where.published).toBe(true);
  });

  it('"Toutes les listes" montre un tournoi en entier, best-of ou pas', () => {
    const where = construireWhere({ ...base, cat: "all", tournament: "RQ Lille" });
    expect(where.featured).toBeUndefined();
    expect(where.tournamentContext).toBe("RQ Lille");
  });

  it("le filtre tournoi seul reste sur les best-of", () => {
    const where = construireWhere({ ...base, tournament: "RQ Lille" });
    expect(where.featured).toBe(true);
    expect(where.tournamentContext).toBe("RQ Lille");
  });

  it("le filtre tournoi survit à la catégorie guide", () => {
    const where = construireWhere({ ...base, cat: "guide", tournament: "RQ Lille" });
    expect(where.tournamentContext).toBe("RQ Lille");
    expect(where.guide).toEqual({ not: null });
  });

  it('lireFiltresDecks accepte "all" et rejette le reste', () => {
    expect(lireFiltresDecks({ cat: "all" }).cat).toBe("all");
    expect(lireFiltresDecks({ cat: "nimporte" }).cat).toBeUndefined();
  });
});
