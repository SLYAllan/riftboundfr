import { describe, expect, it } from "vitest";
import { construireWhere, lireFiltresDecks, type FiltresDecks } from "./deck-listing-params";

const base: FiltresDecks = { q: "", owned: false, offset: 0 };

describe("construireWhere", () => {
  it("filtre Vendetta quand aucun set n'est demandé", () => {
    const filtres = lireFiltresDecks({});
    expect(filtres.set).toBe("Vendetta");
    expect(construireWhere(filtres).setTag).toBe("Vendetta");
  });

  it("garde un autre set demandé", () => {
    const filtres = lireFiltresDecks({ set: "Unleashed" });
    expect(filtres.set).toBe("Unleashed");
    expect(construireWhere(filtres).setTag).toBe("Unleashed");
  });

  it('ne filtre aucun set avec "all"', () => {
    const filtres = lireFiltresDecks({ set: "all" });
    expect(filtres.set).toBeUndefined();
    expect(construireWhere(filtres).setTag).toBeUndefined();
  });

  it("ne donne pas de set par défaut aux decks communautaires", () => {
    expect(lireFiltresDecks({ cat: "community" }).set).toBeUndefined();
  });

  // Aucun des 431 decks best-of n'est en Vendetta : le défaut rendait « Aucun deck ».
  it("ne donne pas de set par défaut au best-of", () => {
    expect(lireFiltresDecks({ cat: "bestof" }).set).toBeUndefined();
    expect(construireWhere(lireFiltresDecks({ cat: "bestof" })).setTag).toBeUndefined();
  });

  // Liens venus de /legendes, de la tier list et des pages de tournoi.
  it("ne donne pas de set par défaut quand le lien porte déjà une intention", () => {
    expect(lireFiltresDecks({ legend: "Garen, Might of Demacia" }).set).toBeUndefined();
    expect(lireFiltresDecks({ tournament: "hartford-rq" }).set).toBeUndefined();
    expect(lireFiltresDecks({ q: "Draven" }).set).toBeUndefined();
  });

  it("garde un set demandé même sur un lien qui porte une intention", () => {
    expect(lireFiltresDecks({ cat: "bestof", set: "Unleashed" }).set).toBe("Unleashed");
    expect(lireFiltresDecks({ legend: "Annie", set: "Vendetta" }).set).toBe("Vendetta");
  });

  it('"Tous" montre tous les decks publiés', () => {
    const where = construireWhere(base);
    expect(where.OR).toBeUndefined();
    expect(where.featured).toBeUndefined();
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

  it("le filtre tournoi seul montre toutes ses listes", () => {
    const where = construireWhere({ ...base, tournament: "RQ Lille" });
    expect(where.featured).toBeUndefined();
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
