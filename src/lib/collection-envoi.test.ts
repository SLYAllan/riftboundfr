import { describe, expect, it } from "vitest";
import { creerFileCollection } from "./collection-envoi";

describe("file d’envoi de la collection", () => {
  it("n’envoie qu’une requête à la fois et garde la dernière quantité absolue", async () => {
    let finirPremier: (() => void) | undefined;
    const recus: Record<string, number>[] = [];
    const file = creerFileCollection(async (cartes) => {
      recus.push(cartes);
      if (recus.length === 1) await new Promise<void>((resolve) => { finirPremier = resolve; });
    });

    file.ajouter({ cardId: "c1", quantity: 1 });
    file.ajouter({ cardId: "c1", quantity: 2 });
    file.ajouter({ cardId: "c1", quantity: 3 });
    await Promise.resolve();
    // Un seul POST en vol : les suivants attendent.
    expect(recus).toEqual([{ c1: 1 }]);

    finirPremier?.();
    await file.quandVide();
    // La dernière quantité absolue gagne, jamais une addition ni l'ancienne.
    expect(recus).toEqual([{ c1: 1 }, { c1: 3 }]);
  });

  it("fusionne deux cartes distinctes sans en perdre une", async () => {
    let finirPremier: (() => void) | undefined;
    const recus: Record<string, number>[] = [];
    const file = creerFileCollection(async (cartes) => {
      recus.push(cartes);
      if (recus.length === 1) await new Promise<void>((resolve) => { finirPremier = resolve; });
    });

    file.ajouter({ cardId: "a", quantity: 1 });
    file.ajouter({ cardId: "b", quantity: 2 });
    finirPremier?.();
    await file.quandVide();
    expect(recus).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("garde la quantité refusée en attente jusqu’à renvoyer()", async () => {
    let echoue = true;
    const recus: Record<string, number>[] = [];
    const file = creerFileCollection(async (cartes) => {
      recus.push(cartes);
      if (echoue) throw new Error("hors ligne");
    });

    file.ajouter({ cardId: "c1", quantity: 4 });
    await file.quandCalme();
    expect(recus).toEqual([{ c1: 4 }]);

    // Toujours refusé : la file n'insiste pas toute seule, le changement attend
    // un geste explicite.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(recus).toEqual([{ c1: 4 }]);

    echoue = false;
    file.renvoyer();
    await file.quandVide();
    expect(recus).toEqual([{ c1: 4 }, { c1: 4 }]);
  });
});
