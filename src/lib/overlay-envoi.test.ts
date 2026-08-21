import { describe, expect, it } from "vitest";
import { creerFileEnvoi } from "./overlay-envoi";

describe("file d’envoi vers l’habillage", () => {
  it("attend la réponse avant d’envoyer le suivant", async () => {
    let finirPremier: (() => void) | undefined;
    const recus: number[] = [];
    const file = creerFileEnvoi<number>(async (v) => {
      recus.push(v);
      if (recus.length === 1) await new Promise<void>((resolve) => { finirPremier = resolve; });
    });

    file.ajouter(1);
    file.ajouter(2);
    file.ajouter(3);
    await Promise.resolve();
    expect(recus).toEqual([1]);

    finirPremier?.();
    await file.quandVide();
    // Sans combinateur, le dernier écrase : c'est ce que veut le tableau de bord,
    // qui poste l'état entier.
    expect(recus).toEqual([1, 3]);
  });

  it("fusionne les envois en attente quand on lui donne un combinateur", async () => {
    let finirPremier: (() => void) | undefined;
    const recus: Record<string, number>[] = [];
    const file = creerFileEnvoi<Record<string, number>>(
      async (v) => {
        recus.push(v);
        if (recus.length === 1) await new Promise<void>((resolve) => { finirPremier = resolve; });
      },
      { combiner: (a, b) => ({ ...a, ...b }) },
    );

    file.ajouter({ a: 1 });
    file.ajouter({ b: 2 });
    file.ajouter({ c: 3 });
    finirPremier?.();
    await file.quandVide();
    // Le compagnon poste des patchs : rien ne doit tomber entre deux envois.
    expect(recus).toEqual([{ a: 1 }, { b: 2, c: 3 }]);
  });

  it("garde la valeur refusée et n’insiste pas tout seul", async () => {
    let echoue = true;
    const recus: number[] = [];
    const file = creerFileEnvoi<number>(async (v) => {
      recus.push(v);
      if (echoue) throw new Error("hors ligne");
    });

    file.ajouter(4);
    await file.quandCalme();
    expect(recus).toEqual([4]);
    expect(file.aDesChangements()).toBe(true);

    echoue = false;
    file.renvoyer();
    await file.quandVide();
    expect(recus).toEqual([4, 4]);
    expect(file.aDesChangements()).toBe(false);
  });

  it("repart au geste suivant après un refus", async () => {
    let echoue = true;
    const recus: number[] = [];
    const file = creerFileEnvoi<number>(async (v) => {
      recus.push(v);
      if (echoue) throw new Error("hors ligne");
    });

    file.ajouter(1);
    await file.quandCalme();
    echoue = false;
    // Marquer le point suivant suffit : personne n'a à lire la bannière pour que
    // l'écran du stream reparte.
    file.ajouter(2);
    await file.quandVide();
    expect(recus).toEqual([1, 2]);
  });

  it("ne perd pas ce qui arrive pendant un envoi refusé", async () => {
    const recus: Record<string, number>[] = [];
    let finir: (() => void) | undefined;
    // Seul le premier envoi attend, puis échoue. Les suivants passent tout de suite.
    const file = creerFileEnvoi<Record<string, number>>(
      async (v) => {
        recus.push(v);
        if (recus.length === 1) {
          await new Promise<void>((resolve) => { finir = resolve; });
          throw new Error("hors ligne");
        }
      },
      { combiner: (a, b) => ({ ...a, ...b }) },
    );

    file.ajouter({ a: 1 });
    await Promise.resolve();
    file.ajouter({ b: 2 });
    finir?.();
    await file.quandCalme();

    file.renvoyer();
    await file.quandVide();
    // Le patch refusé revient dans la file AVEC celui arrivé entre-temps, et dans
    // le bon ordre : le refusé est le plus ancien.
    expect(recus).toEqual([{ a: 1 }, { a: 1, b: 2 }]);
  });

  it("annonce l’état de l’envoi", async () => {
    const etats: string[] = [];
    let echoue = true;
    const file = creerFileEnvoi<number>(
      async () => { if (echoue) throw new Error("hors ligne"); },
      { surEtat: (e) => etats.push(e) },
    );

    file.ajouter(1);
    await file.quandCalme();
    expect(etats).toEqual(["envoi", "hors-ligne"]);

    echoue = false;
    file.renvoyer();
    await file.quandVide();
    expect(etats).toEqual(["envoi", "hors-ligne", "envoi", "a-jour"]);
  });

  it("ne sort pas la valeur en attente pendant un envoi", async () => {
    let finir: (() => void) | undefined;
    let appels = 0;
    const file = creerFileEnvoi<number>(async () => {
      appels += 1;
      if (appels === 1) await new Promise<void>((resolve) => { finir = resolve; });
    });
    file.ajouter(1);
    file.ajouter(2);
    expect(file.prendreEnAttente()).toBeNull();
    finir?.();
    await file.quandCalme();
  });

  it("rend la valeur en attente au départ de la page", async () => {
    const file = creerFileEnvoi<number>(async () => {});
    await file.quandVide();
    file.ajouter(7);
    await file.quandVide();
    // Tout est parti : il ne reste rien à emporter.
    expect(file.prendreEnAttente()).toBeNull();
  });
});
