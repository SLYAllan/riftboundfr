import { describe, expect, it } from "vitest";
import { grouperTournoisParSet, voisinsDuTournoi } from "./tournament-order";

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
