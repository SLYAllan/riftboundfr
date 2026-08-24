import { describe, expect, it } from "vitest";
import { comparerPlacements, lireFiltresDecks, modifierParametresDecks, parametresDecks } from "./deck-listing-params";

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

describe("modifierParametresDecks", () => {
  it("change un filtre sans perdre les autres et repart du premier lot", () => {
    const courants = new URLSearchParams("cat=bestof&legend=Ahri&set=Vendetta&tournament=Paris&q=Fox-Fire&sort=popular&owned=1&offset=51");

    expect(modifierParametresDecks(courants, { set: "Origins" }).toString()).toBe(
      "cat=bestof&legend=Ahri&set=Origins&tournament=Paris&q=Fox-Fire&sort=popular&owned=1",
    );
  });

  it("retire seulement le filtre demandé", () => {
    expect(modifierParametresDecks(new URLSearchParams("cat=bestof&legend=Ahri"), { cat: null }).toString()).toBe("legend=Ahri");
  });

  it("accepte le tri par placement", () => {
    expect(lireFiltresDecks({ sort: "placement" }).sort).toBe("placement");
  });
});

describe("comparerPlacements", () => {
  it("trie les places comme des nombres et laisse les absentes à la fin", () => {
    const places = ["10th", null, "2nd", "1st"];
    expect(places.sort((a, b) => comparerPlacements(a, b))).toEqual(["1st", "2nd", "10th", null]);
  });
});
