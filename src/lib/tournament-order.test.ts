import { describe, expect, it } from "vitest";
import { comparerCartesParSet, grouperTournoisParSet, voisinsDuTournoi } from "./tournament-order";

const tournois = [
  { slug: "origins", name: "Origins", set: "Origins", tier: "S" as const, date: "2025-11-09" },
  { slug: "vendetta-b", name: "Vendetta B", set: "Vendetta", tier: "A" as const, date: "2026-08-16" },
  { slug: "vendetta-a", name: "Vendetta A", set: "Vendetta", tier: "A" as const, date: "2026-08-16" },
  { slug: "vendetta-s", name: "Vendetta S", set: "Vendetta", tier: "S" as const, date: "2026-08-08" },
  { slug: "unleashed", name: "Unleashed", set: "Unleashed", tier: "A" as const, date: "2026-07-19" },
  { slug: "spiritforged", name: "Spiritforged", set: "Spiritforged", tier: "A" as const, date: "2026-03-15" },
  { slug: "sans-set", name: "Sans set", set: null, tier: "A" as const, date: null },
];

describe("grouperTournoisParSet", () => {
  it("classe les sets récents en premier, puis le tier et la date", () => {
    const groupes = grouperTournoisParSet(tournois);

    expect(groupes.map((g) => g.set)).toEqual(["Vendetta", "Unleashed", "Spiritforged", "Origins", "Autres"]);
    expect(groupes[0].tournois.map((t) => t.slug)).toEqual(["vendetta-s", "vendetta-a", "vendetta-b"]);
  });
});

describe("voisinsDuTournoi", () => {
  it("reste dans le même set et suit la date", () => {
    const voisins = voisinsDuTournoi(tournois, "vendetta-a");

    expect(voisins.precedent?.slug).toBe("vendetta-b");
    expect(voisins.suivant).toBeNull();
  });
});

describe("comparerCartesParSet", () => {
  const carte = (set: string, setName: string, collectorNumber: number | null) => ({ set, setName, collectorNumber });

  it("ouvre sur le set en cours, finit par les promos, Proving Grounds suit Origins", () => {
    const cartes = [
      carte("JDG", "Riftbound Judge Promotional Cards", 1),
      carte("OGN", "Origins", 1),
      carte("OGS", "Proving Grounds", 1),
      carte("RAD", "Radiance", 2),
      carte("PR", "Riftbound Promotional Cards", 1),
      carte("RAD", "Radiance", 1),
      carte("VEN", "Vendetta", 1),
    ];
    expect([...cartes].sort(comparerCartesParSet).map((c) => `${c.set}-${c.collectorNumber}`)).toEqual([
      "RAD-1", "RAD-2", "VEN-1", "OGN-1", "OGS-1", "JDG-1", "PR-1",
    ]);
  });

  it("range une carte sans numéro après les numérotées de son set", () => {
    expect(comparerCartesParSet(carte("RAD", "Radiance", null), carte("RAD", "Radiance", 300))).toBeGreaterThan(0);
  });
});
