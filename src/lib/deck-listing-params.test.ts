import { describe, expect, it } from "vitest";
import { construireWhere, lireFiltresDecks, modifierParametresDecks, palierAccessibilite, PALIERS_ACCESSIBILITE, type FiltresDecks } from "./deck-listing-params";

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

describe("modifierParametresDecks garde le set affiché", () => {
  it("fige Vendetta quand on choisit une Légende depuis la vue de départ", () => {
    const suivants = modifierParametresDecks(new URLSearchParams(), { legend: "Ahri" });
    expect(suivants.get("legend")).toBe("Ahri");
    // Sans ce report, `setParDefaut` voyait l'« intention » Légende et rendait
    // undefined : le menu des sets sautait de Vendetta à « Tous les sets ».
    expect(suivants.get("set")).toBe("Vendetta");
  });

  it("ne pose pas de set quand la vue n'en affichait aucun", () => {
    const courants = new URLSearchParams({ legend: "Ahri" });
    expect(modifierParametresDecks(courants, { legend: "Jinx" }).get("set")).toBeNull();
  });

  it("laisse un changement de set explicite décider", () => {
    const suivants = modifierParametresDecks(new URLSearchParams(), { set: "all" });
    expect(suivants.get("set")).toBe("all");
  });

  it("laisse « Best of » vider le set, comme avant", () => {
    const suivants = modifierParametresDecks(new URLSearchParams(), { cat: "bestof", set: null });
    expect(suivants.get("set")).toBeNull();
    expect(suivants.get("cat")).toBe("bestof");
  });
});

describe("palierAccessibilite", () => {
  it("range un deck complet en tête", () => {
    expect(palierAccessibilite(0, 0)).toBe(0);
  });

  it("met une à trois cartes manquantes avant le prix", () => {
    // Trois cartes chères passent devant quinze cartes bon marché : une commande
    // contre un projet.
    expect(palierAccessibilite(3, 90)).toBe(1);
    expect(palierAccessibilite(15, 8)).toBe(2);
  });

  it("sépare moins de 10 EUR, moins de 25 EUR, et le reste", () => {
    expect(palierAccessibilite(6, 9.99)).toBe(2);
    expect(palierAccessibilite(6, 10)).toBe(3);
    expect(palierAccessibilite(6, 24.99)).toBe(3);
    expect(palierAccessibilite(6, 25)).toBe(4);
  });

  it("renvoie un prix inconnu au dernier palier", () => {
    // Une carte hors catalogue n'est pas une carte gratuite : le deck ne doit pas
    // passer devant ceux qu'on sait vraiment compléter.
    expect(palierAccessibilite(6, null)).toBe(4);
  });

  it("a un libellé par palier", () => {
    expect(PALIERS_ACCESSIBILITE).toHaveLength(5);
  });
});
