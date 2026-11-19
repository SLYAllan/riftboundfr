import { describe, expect, it } from "vitest";
import { cartesAAcheter, meilleureMontee, type DeckDeDepart } from "./decks-de-depart";
import type { ListeClassee } from "./listes-classees";

const deck: DeckDeDepart = {
  set: "RAD",
  produit: "Showdown Deck",
  source: "",
  legende: { riftboundId: "rad-1", name: "Seraphine, Starry-Eyed Songstress" },
  principal: [
    { riftboundId: "rad-sp5-005", name: "Seraphine, Not Alone", quantity: 1 },
    { riftboundId: "rad-2", name: "High Note", quantity: 2 },
  ],
  champsDeBataille: [],
  runes: [{ riftboundId: "ogn-1", name: "Mind Rune", quantity: 6 }],
  inconnues: [],
};

const liste = (slug: string, legende: string, placement: string, cartes: ListeClassee["cartes"]): ListeClassee => ({
  slug, legende, placement, cartes, joueur: null, tournoi: "T", date: "2026-11-01", joueurs: 100, noms: cartes.map((c) => c.name),
});

describe("cartesAAcheter", () => {
  it("compte par nom : une autre impression du deck de départ ne s'achète pas", () => {
    const manquantes = cartesAAcheter(deck, [
      { riftboundId: "rad-090-167", name: "Seraphine, Not Alone", quantity: 3 },
      { riftboundId: "rad-2", name: "High Note", quantity: 2 },
      { riftboundId: "ogn-1", name: "Mind Rune", quantity: 7 },
    ]);
    expect(manquantes).toEqual([
      { riftboundId: "rad-090-167", name: "Seraphine, Not Alone", quantity: 2 },
      { riftboundId: "ogn-1", name: "Mind Rune", quantity: 1 },
    ]);
  });
});

describe("meilleureMontee", () => {
  const chiffrer = (cartes: { quantity: number }[]) => ({
    total: cartes.reduce((s, c) => s + c.quantity, 0),
    exemplairesSansPrix: 0,
  });

  it("retient la liste de la même Légende qui demande le moins d'achats", () => {
    const listes = [
      liste("chere", deck.legende.name, "1st", [{ riftboundId: "x", name: "Supernova", quantity: 3 }]),
      liste("proche", deck.legende.name, "9th", [{ riftboundId: "rad-2", name: "High Note", quantity: 3 }]),
      liste("autre", "Evelynn, Agony's Embrace", "1st", [{ riftboundId: "y", name: "Hush", quantity: 1 }]),
    ];
    const m = meilleureMontee(deck, listes, chiffrer);
    expect(m?.liste.slug).toBe("proche");
    expect(m?.prix).toBe(1);
    expect(m?.manquantes).toEqual([{ riftboundId: "rad-2", name: "High Note", quantity: 1 }]);
  });

  it("rend null quand la Légende n'a aucune liste dans les 16 premiers", () => {
    const listes = [liste("loin", deck.legende.name, "40th", [{ riftboundId: "x", name: "Supernova", quantity: 1 }])];
    expect(meilleureMontee(deck, listes, chiffrer)).toBeNull();
  });
});
