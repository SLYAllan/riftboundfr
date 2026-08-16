import { describe, expect, it } from "vitest";
import { lireFiltresDecks, parametresDecks } from "./deck-listing-params";

describe("lireFiltresDecks", () => {
  it("conserve tous les filtres publics et borne le décalage", () => {
    expect(lireFiltresDecks({
      cat: "bestof",
      legend: "Kai'Sa",
      set: "Vendetta",
      tournament: "S4 Paris",
      q: "  carte  ",
      sort: "popular",
      owned: "1",
      offset: "-4",
    })).toEqual({
      cat: "bestof",
      legend: "Kai'Sa",
      set: "Vendetta",
      tournament: "S4 Paris",
      q: "carte",
      sort: "popular",
      owned: true,
      offset: 0,
    });
  });

  it("ignore les valeurs de tri et de catégorie inconnues", () => {
    expect(lireFiltresDecks({ cat: "brut", sort: "alphabetique", offset: "abc" })).toEqual({
      cat: undefined,
      legend: undefined,
      set: undefined,
      tournament: undefined,
      q: "",
      sort: undefined,
      owned: false,
      offset: 0,
    });
  });
});

describe("parametresDecks", () => {
  it("transmet les filtres et le prochain décalage à l'API", () => {
    expect(parametresDecks({
      cat: "guide",
      legend: "Ahri",
      set: "Origins",
      tournament: undefined,
      q: "Fox-Fire",
      sort: "popular",
      owned: true,
      offset: 50,
    }).toString()).toBe("cat=guide&legend=Ahri&set=Origins&q=Fox-Fire&sort=popular&owned=1&offset=50");
  });
});
