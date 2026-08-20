import { describe, expect, it } from "vitest";
import { creerFileEtats, normaliserLienCamera } from "./overlay-dashboard-client";

describe("lien de caméra du tableau de bord", () => {
  it("accepte seulement une URL HTTPS VDO.Ninja et coupe son son", () => {
    expect(normaliserLienCamera("https://vdo.ninja/?view=abc")).toContain("muted=1");
    expect(normaliserLienCamera("http://vdo.ninja/?view=abc")).toBeNull();
    expect(normaliserLienCamera("https://example.com/?view=abc")).toBeNull();
    expect(normaliserLienCamera("pas une adresse")).toBeNull();
  });
});

describe("file de sauvegarde du tableau de bord", () => {
  it("attend la première sauvegarde puis n’envoie que le dernier état", async () => {
    let finirPremier: (() => void) | undefined;
    const recus: number[] = [];
    const file = creerFileEtats(async (etat: number) => {
      recus.push(etat);
      if (recus.length === 1) await new Promise<void>((resoudre) => { finirPremier = resoudre; });
    });

    file.ajouter(1);
    file.ajouter(2);
    file.ajouter(3);
    await Promise.resolve();
    expect(recus).toEqual([1]);

    finirPremier?.();
    await file.quandVide();
    expect(recus).toEqual([1, 3]);
  });

  it("garde le dernier état après un échec et repart au changement suivant", async () => {
    let echoue = true;
    const recus: number[] = [];
    const file = creerFileEtats(async (etat: number) => {
      recus.push(etat);
      if (echoue) throw new Error("hors ligne");
    });

    file.ajouter(1);
    await file.quandCalme();
    echoue = false;
    file.ajouter(2);
    await file.quandVide();

    expect(recus).toEqual([1, 2]);
  });

  it("renvoie le même état quand l’utilisateur demande un nouvel essai", async () => {
    let echoue = true;
    const recus: number[] = [];
    const file = creerFileEtats(async (etat: number) => {
      recus.push(etat);
      if (echoue) throw new Error("hors ligne");
    });

    file.ajouter(4);
    await file.quandCalme();
    echoue = false;
    file.relancer();
    await file.quandVide();

    expect(recus).toEqual([4, 4]);
  });
});
