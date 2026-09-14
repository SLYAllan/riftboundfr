import { describe, it, expect } from "vitest";
import { diffDecks, resumerVersion } from "./deck-diff";
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

describe("resumerVersion", () => {
  const infos = new Map([
    ["a", { energie: 3, eur: 2 }],
    ["b", { energie: 5, eur: 10 }],
    ["c", { energie: 3, eur: null }],
    ["r", { energie: null, eur: 0.1 }],
  ]);

  it("compte les entrées et les sorties sans les annuler", () => {
    // 2 dedans et 2 dehors, c'est quatre cartes changées de place, pas zéro.
    const r = resumerVersion(
      [
        { cardId: "a", section: "main", avant: 0, apres: 2 },
        { cardId: "b", section: "main", avant: 2, apres: 0 },
      ],
      infos,
    );
    expect(r.ajoutees).toBe(2);
    expect(r.retirees).toBe(2);
  });

  it("chiffre ce que la mise à jour coûte", () => {
    const r = resumerVersion([{ cardId: "a", section: "main", avant: 1, apres: 3 }], infos);
    expect(r.deltaEur).toBe(4);
  });

  it("rend ce qu'une carte retirée valait", () => {
    const r = resumerVersion([{ cardId: "b", section: "main", avant: 2, apres: 0 }], infos);
    expect(r.deltaEur).toBe(-20);
  });

  it("refuse l'addition dès qu'un prix manque", () => {
    const r = resumerVersion(
      [
        { cardId: "a", section: "main", avant: 0, apres: 1 },
        { cardId: "c", section: "main", avant: 0, apres: 1 },
      ],
      infos,
    );
    expect(r.deltaEur).toBeNull();
  });

  it("groupe la courbe par coût d'énergie et masque les compensations", () => {
    const r = resumerVersion(
      [
        { cardId: "a", section: "main", avant: 0, apres: 2 },
        { cardId: "c", section: "main", avant: 2, apres: 0 },
        { cardId: "b", section: "main", avant: 3, apres: 1 },
      ],
      infos,
    );
    // a et c coûtent 3 tous les deux : +2 et -2 s'annulent, la courbe ne bouge pas là.
    expect(r.courbe).toEqual([{ energie: 5, delta: -2 }]);
  });

  it("laisse les runes hors de la courbe", () => {
    // Une rune n'a pas de coût d'énergie : la compter ferait une barre à zéro.
    const r = resumerVersion([{ cardId: "r", section: "rune", avant: 0, apres: 3 }], infos);
    expect(r.courbe).toEqual([]);
    expect(r.ajoutees).toBe(3);
  });
});
