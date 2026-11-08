import { describe, expect, it } from "vitest";
import { caseOverlay, decoupeCss, SOCLE_COMPACT } from "./overlay-decor";
import { encreSur, nomEtTitre } from "./overlay";

describe("caseOverlay", () => {
  it("rend à droite le miroir exact de la case de gauche", () => {
    const g = caseOverlay("camera", "left");
    const d = caseOverlay("camera", "right");
    expect(d.left).toBe(1920 - g.left - g.width);
    expect([d.top, d.width, d.height]).toEqual([g.top, g.width, g.height]);
  });

  it("colle le bas de colonne sous le panneau en compact, sans la place de la caméra", () => {
    const portrait = caseOverlay("portrait", "left", true);
    const pseudo = caseOverlay("pseudo", "left", true);
    expect(portrait.width).toBeCloseTo(118 * 0.85);
    // Dans le complet, 300 px de caméra séparent les deux.
    expect(pseudo.top - (portrait.top + portrait.height)).toBeLessThan(20);
  });

  it("garde les manches dans le socle du compact", () => {
    const manches = caseOverlay("manches", "left", true);
    expect(manches.top + manches.height).toBeLessThan(SOCLE_COMPACT.h - 6);
    expect(manches.left + manches.width).toBeLessThan(SOCLE_COMPACT.l - 6);
  });
});

describe("decoupeCss", () => {
  it("retourne le polygone en miroir pour la colonne de droite", () => {
    expect(decoupeCss("terrainArt", "left")).toBe("polygon(0.00% 0.00%,100.00% 0.00%,91.41% 100.00%,8.59% 100.00%)");
    expect(decoupeCss("terrainArt", "right")).toBe("polygon(100.00% 0.00%,0.00% 0.00%,8.59% 100.00%,91.41% 100.00%)");
  });
});

describe("nomEtTitre", () => {
  it("coupe à la virgule, chinoise comprise", () => {
    expect(nomEtTitre("Kai'Sa, Daughter of the Void")).toEqual(["Kai'Sa", "Daughter of the Void"]);
    expect(nomEtTitre("卡莎，虚空之女")).toEqual(["卡莎", "虚空之女"]);
    expect(nomEtTitre("Annie - Fiery")).toEqual(["Annie", "Fiery"]);
  });

  it("laisse entier un nom sans titre, tiret dans le mot compris", () => {
    expect(nomEtTitre("Légende")).toEqual(["Légende", ""]);
    expect(nomEtTitre("Jarvan-IV")).toEqual(["Jarvan-IV", ""]);
  });
});

describe("encreSur", () => {
  it("garde un chiffre lisible sur le fond choisi", () => {
    expect(encreSur("#d2a548")).toBe("#211a29");
    expect(encreSur("#1c60a6")).toBe("#ffffff");
  });
});
