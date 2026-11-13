import { describe, expect, it } from "vitest";
import { validateDeck, type DeckCardInfo } from "./deck-rules";

const carte = (name: string): DeckCardInfo => ({ cardId: name, name, type: "Gear", supertype: null, domains: [], quantity: 1 });
const compte = { legend: false, legendFirstName: null, mainTotal: 0, runeTotal: 0, battlefieldTotal: 0, sideTotal: 0 };
const bans = (noms: string[], jour: string) =>
  validateDeck(compte, noms.map(carte), [], [], [], jour)
    .filter((p) => p.id.startsWith("banned-"))
    .map((p) => `${p.severity} : ${p.message}`);

describe("cartes bannies dans le deckbuilder", () => {
  // Annoncé le 13 novembre 2026, en vigueur le 23 : d'ici là la carte se joue en
  // tournoi, le deckbuilder prévient et laisse publier.
  it("prévient sans bloquer tant que le ban n'est pas en vigueur", () => {
    expect(bans(["Zhonya's Hourglass"], "2026-11-22")).toEqual(["warning : Zhonya's Hourglass sera bannie le 23 novembre 2026"]);
    expect(bans(["Zhonya's Hourglass"], "2026-11-23")).toEqual(["error : Zhonya's Hourglass est bannie"]);
  });

  it("refuse une carte déjà bannie, et laisse passer les autres", () => {
    expect(bans(["Stacked Deck", "Defy"], "2026-11-22")).toEqual(["error : Stacked Deck est bannie"]);
  });
});
