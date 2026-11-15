import { describe, expect, it } from "vitest";
import { caseOverlay, decoupeCss, placementCartes, SOCLE_COMPACT } from "./overlay-decor";
import { empreinteDecor } from "./overlay-decor-empreinte";
import releve from "./overlay-decor.empreinte.json";

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

describe("images de public/stream", () => {
  it("sortent du dessin actuel", () => {
    expect(empreinteDecor(), "Le dessin a changé sans ses images : lancer `npm run gen:decor`.").toBe(releve.sha256);
  });
});

describe("placementCartes", () => {
  // Boîte du dessin dans cartes_gauche.webp, relevée sur son canal alpha.
  const DESSIN = { x0: 41, x1: 316, y0: 682, y1: 1045 };

  it("pose le cadre sur des pixels entiers, et le compact à la taille du dessin", () => {
    for (const cote of ["left", "right"] as const) {
      for (const compact of [false, true]) {
        const { e, dx, dy } = placementCartes(cote, compact);
        expect([Number.isInteger(dx), Number.isInteger(dy)]).toEqual([true, true]);
        // Toute autre échelle étale le trait doré : à 0,9775 le compact était flou.
        if (compact) expect(e).toBe(1);
      }
    }
  });

  it("garde le cadre agrandi dans sa colonne et dans l'écran", () => {
    const { e, dx, dy } = placementCartes("left");
    expect(e).toBeGreaterThan(1);
    expect(DESSIN.x0 * e + dx).toBeGreaterThanOrEqual(0);
    // 346 px : le premier filet de la colonne.
    expect(DESSIN.x1 * e + dx).toBeLessThanOrEqual(346);
    expect(DESSIN.y1 * e + dy).toBeLessThanOrEqual(1080);
  });

  it("pose le cadre de droite en miroir de celui de gauche, au pixel près", () => {
    for (const compact of [false, true]) {
      const g = placementCartes("left", compact);
      const d = placementCartes("right", compact);
      const bordGauche = DESSIN.x0 * g.e + g.dx;
      // Dans cartes_droite.webp le dessin va de x = 1604 à 1879.
      const bordDroit = 1879 * d.e + d.dx;
      expect(Math.abs(1920 - bordDroit - bordGauche)).toBeLessThanOrEqual(1);
      expect(d.dy).toBe(g.dy);
    }
  });
});
