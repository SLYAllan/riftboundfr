import { describe, it, expect } from "vitest";
import { cleCatalogue, prixRetenu, lienProduit, lienPanier, chiffrerDeck, lignesListe } from "./cardnexus";

describe("cleCatalogue", () => {
  it("propose le numéro avec et sans zéro de tête", () => {
    expect(cleCatalogue("ogn-091-298")).toEqual(["OGN-091", "OGN-91"]);
  });

  it("garde le suffixe de variante, qui distingue l'alt-art de la carte de base", () => {
    expect(cleCatalogue("unl-060a-219")).toEqual(["UNL-060A", "UNL-60A"]);
    expect(cleCatalogue("unl-237*-219")).toEqual(["UNL-237*"]);
  });

  it("complète à trois chiffres quand notre numéro est plus court", () => {
    expect(cleCatalogue("ven-3-166")).toEqual(["VEN-3", "VEN-003"]);
  });

  it("rend une liste vide sur une forme inattendue plutôt qu'une clé fausse", () => {
    expect(cleCatalogue("sfd-t03")).toEqual([]);
  });
});

describe("prixRetenu", () => {
  const cn = (low: number) => ({ cardnexus: { regions: { eu: { currency: "EUR", low } } } });

  it("préfère le plancher CardNexus européen, c'est ce que le visiteur paiera", () => {
    expect(prixRetenu({ Standard: { ...cn(3.5), cardmarket: { currency: "EUR", low: 9 } } })).toEqual({
      eur: 3.5,
      source: "cardnexus",
      finition: "Standard",
    });
  });

  it("retombe sur Cardmarket quand aucune annonce n'est en ligne", () => {
    expect(prixRetenu({ Standard: { cardmarket: { currency: "EUR", low: 2.4 } } })).toEqual({
      eur: 2.4,
      source: "cardmarket",
      finition: "Standard",
    });
  });

  it("ignore un prix en dollars : le convertir donnerait un chiffre inventé", () => {
    expect(prixRetenu({ Standard: { cardmarket: { currency: "USD", low: 2.4 } } })).toBeNull();
    expect(prixRetenu({})).toBeNull();
    expect(prixRetenu(undefined)).toBeNull();
  });

  it("retient la finition la moins chère", () => {
    expect(prixRetenu({ Standard: cn(1.2), Foil: cn(8) })?.eur).toBe(1.2);
  });
});

describe("liens", () => {
  it("porte l'identifiant de partenaire et encode le nom", () => {
    const l = lienProduit(151340, "Jinx - Rebel");
    expect(l).toContain("/7595319/cn/151340/");
    expect(l).toContain("Jinx%20-%20Rebel");
  });

  it("envoie le panier vers le Cart Wizard, destination encodée", () => {
    const l = lienPanier("abc123");
    expect(l).toContain("go.cardnexus.link/c/7595319/");
    expect(l).toContain(encodeURIComponent("https://cardnexus.com/cart-wizard?list=abc123"));
  });
});

describe("chiffrerDeck", () => {
  // ogs-009 et opp-009 sont la même carte sous deux préfixes, donc un seul produit.
  const prix = {
    fetchedAt: "2026-08-13T00:00:00.000Z",
    cards: {
      "ogn-091-298": { eur: 2, productId: 1, nom: "Pit Crew", source: "cardnexus", finition: "Standard" },
      "ogs-009-024": { eur: 1.5, productId: 9, nom: "Master Yi - Honed", source: "cardnexus", finition: "Standard" },
      "opp-009-024": { eur: 1.5, productId: 9, nom: "Master Yi - Honed", source: "cardnexus", finition: "Standard" },
      // Deux impressions de la même carte : l'ordinaire, et celle numérotée au-delà
      // du set. Même carte à la table, 90 EUR d'écart au marché.
      "unl-120-219": { eur: 15, productId: 20, nom: "Rengar - Trophy Hunter", source: "cardnexus", finition: "Foil" },
      "ven-179-166": { eur: 90, productId: 21, nom: "Rengar - Trophy Hunter", source: "cardnexus", finition: "Foil" },
    },
  };

  it("multiplie par la quantité", () => {
    const d = chiffrerDeck([{ riftboundId: "ogn-091-298", name: "Pit Crew", quantity: 3 }], prix);
    expect(d.total).toBe(6);
    expect(d.lignes[0].eur).toBe(6);
  });

  it("réunit en une ligne la carte jouée au deck principal et en réserve", () => {
    const d = chiffrerDeck(
      [
        { riftboundId: "ogn-091-298", name: "Pit Crew", quantity: 3 },
        { riftboundId: "ogn-091-298", name: "Pit Crew", quantity: 1 },
      ],
      prix,
    );
    expect(d.lignes).toHaveLength(1);
    expect(d.lignes[0].quantite).toBe(4);
    expect(d.total).toBe(8);
  });

  it("compte les exemplaires sans prix au lieu de les escamoter", () => {
    const d = chiffrerDeck(
      [
        { riftboundId: "ogn-091-298", name: "Pit Crew", quantity: 1 },
        { riftboundId: "inconnue", name: "Inconnue", quantity: 2 },
      ],
      prix,
    );
    expect(d.total).toBe(2);
    expect(d.exemplairesSansPrix).toBe(2);
    expect(d.lignes[1].eur).toBeNull();
    expect(d.lignes[1].lien).toBeNull();
  });

  it("réunit deux impressions du même produit, sinon le panier n'en reçoit qu'une", () => {
    const d = chiffrerDeck(
      [
        { riftboundId: "ogs-009-024", name: "Master Yi, Honed", quantity: 1 },
        { riftboundId: "opp-009-024", name: "Master Yi, Honed", quantity: 1 },
      ],
      prix,
    );
    expect(d.lignes).toHaveLength(1);
    expect(d.lignes[0].quantite).toBe(2);
    expect(lignesListe(
      [
        { riftboundId: "ogs-009-024", name: "Master Yi, Honed", quantity: 1 },
        { riftboundId: "opp-009-024", name: "Master Yi, Honed", quantity: 1 },
      ],
      prix,
    ).items).toEqual([{ productId: 9, finish: "Standard", language: "fr", quantity: 2 }]);
  });

  it("additionne une carte présente deux fois, sinon CardNexus remplace la quantité", () => {
    const { items, absentes } = lignesListe(
      [
        { riftboundId: "ogn-091-298", name: "Pit Crew", quantity: 3 },
        { riftboundId: "ogn-091-298", name: "Pit Crew", quantity: 2 },
        { riftboundId: "inconnue", name: "Inconnue", quantity: 1 },
      ],
      prix,
    );
    expect(items).toEqual([{ productId: 1, finish: "Standard", language: "fr", quantity: 5 }]);
    expect(absentes).toEqual(["Inconnue"]);
  });

  // Une decklist de tournoi note l'impression enregistrée par le joueur. Chiffrer
  // dessus affichait un prix que personne ne paie, et le panier envoyait acheter la
  // carte chère alors que la même carte existe à 15 EUR.
  it("chiffre la carte sur son impression la moins chère, pas sur celle notée", () => {
    const d = chiffrerDeck([{ riftboundId: "ven-179-166", name: "Rengar, Trophy Hunter", quantity: 3 }], prix);
    expect(d.total).toBe(45);
    expect(d.lignes[0].eurUnitaire).toBe(15);
  });

  it("met la moins chère au panier, pas celle de la decklist", () => {
    expect(lignesListe([{ riftboundId: "ven-179-166", name: "Rengar, Trophy Hunter", quantity: 3 }], prix).items).toEqual([
      { productId: 20, finish: "Foil", language: "fr", quantity: 3 },
    ]);
  });

  it("sans relevé, rend un total nul et tout en manquant plutôt que de planter", () => {
    const d = chiffrerDeck([{ riftboundId: "ogn-091-298", name: "Pit Crew", quantity: 4 }], null);
    expect(d.total).toBe(0);
    expect(d.exemplairesSansPrix).toBe(4);
    expect(d.releveLe).toBeNull();
  });
});
