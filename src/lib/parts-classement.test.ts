import { describe, expect, it } from "vitest";
import { classerParts, ecartEnPoints, type PartClassement } from "./parts-classement";

const part = (legendName: string, tournament: string, set: string, joueurs: number, coupe: number): PartClassement =>
  ({ legendName, tournament, set, joueurs, coupe });

const PARTS = [
  part("Riven, The Exile", "A", "Radiance", 60, 12),
  part("Riven, The Exile", "B", "Radiance", 40, 8),
  part("Rek'sai, Void Burrower", "A", "Radiance", 30, 0),
  part("Rek'Sai, Void Burrower", "B", "Radiance", 70, 0),
  part("Kennen, Heart of the Tempest", "C", "Vendetta", 500, 90),
];

describe("classerParts", () => {
  it("ne compte que le set demandé et classe par joueurs", () => {
    const { lignes, total, tournois } = classerParts(PARTS, "Radiance");
    expect(total).toBe(200);
    expect(tournois).toBe(2);
    expect(lignes.map((l) => [l.slug, l.rang, l.joueurs])).toEqual([
      ["riven-the-exile", 1, 100],
      ["reksai-void-burrower", 2, 100],
    ]);
  });

  it("réunit deux écritures de la même Légende", () => {
    const { lignes } = classerParts(PARTS, "Radiance");
    expect(lignes.filter((l) => l.slug === "reksai-void-burrower")).toHaveLength(1);
  });

  it("calcule la part du champ, la conversion et celle du format", () => {
    const { lignes, conversionFormat } = classerParts(PARTS, "Radiance");
    expect(lignes[0].part).toBe(0.5);
    expect(lignes[0].conversion).toBe(0.2);
    expect(lignes[1].conversion).toBe(0);
    expect(conversionFormat).toBe(0.1);
  });

  it("rend un classement vide pour un set sans joueur", () => {
    expect(classerParts(PARTS, "Origins")).toEqual({ lignes: [], total: 0, tournois: 0, conversionFormat: 0 });
  });
});

describe("ecartEnPoints", () => {
  it("écrit l'écart en points, signe compris", () => {
    expect(ecartEnPoints(0.183, 0.099)).toBe("+8,4 pts");
    expect(ecartEnPoints(0.074, 0.099)).toBe("−2,5 pts");
    expect(ecartEnPoints(0.1, 0.1)).toBe("+0 pts");
  });
});
