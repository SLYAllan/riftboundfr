import { describe, it, expect } from "vitest";
import { diffDecks } from "./deck-diff";
import type { DeckCodeData } from "./deck-codec";

function deck(p: Partial<DeckCodeData>): DeckCodeData {
  return { legend: null, champion: null, main: [], rune: [], battlefield: [], side: [], ...p };
}

describe("diffDecks", () => {
  it("ne rend rien quand rien ne bouge", () => {
    const d = deck({ main: [{ cardId: "Boum", quantity: 3 }] });
    expect(diffDecks(d, d)).toEqual([]);
  });

  it("rend l'entrée, la sortie et la quantité changée", () => {
    const avant = deck({
      main: [
        { cardId: "Boum", quantity: 3 },
        { cardId: "Sortie", quantity: 2 },
      ],
    });
    const apres = deck({
      main: [
        { cardId: "Boum", quantity: 1 },
        { cardId: "Entrée", quantity: 2 },
      ],
    });
    expect(diffDecks(avant, apres)).toEqual([
      { cardId: "Entrée", section: "main", avant: 0, apres: 2 },
      { cardId: "Boum", section: "main", avant: 3, apres: 1 },
      { cardId: "Sortie", section: "main", avant: 2, apres: 0 },
    ]);
  });

  it("compte un passage du deck principal à la réserve comme deux mouvements", () => {
    const avant = deck({ main: [{ cardId: "Boum", quantity: 2 }] });
    const apres = deck({ side: [{ cardId: "Boum", quantity: 2 }] });
    expect(diffDecks(avant, apres)).toEqual([
      { cardId: "Boum", section: "main", avant: 2, apres: 0 },
      { cardId: "Boum", section: "side", avant: 0, apres: 2 },
    ]);
  });

  it("voit le changement de Légende", () => {
    const avant = deck({ legend: { cardId: "Diana", quantity: 1 } });
    const apres = deck({ legend: { cardId: "Jinx", quantity: 1 } });
    expect(diffDecks(avant, apres)).toEqual([
      { cardId: "Jinx", section: "legend", avant: 0, apres: 1 },
      { cardId: "Diana", section: "legend", avant: 1, apres: 0 },
    ]);
  });

  it("ignore la casse d'un même identifiant", () => {
    const avant = deck({ main: [{ cardId: "Boum", quantity: 2 }] });
    const apres = deck({ main: [{ cardId: "boum", quantity: 2 }] });
    expect(diffDecks(avant, apres)).toEqual([]);
  });
});
