import { describe, expect, it } from "vitest";
import { lireReferenceCollection } from "./bulking-card-search";

describe("lireReferenceCollection", () => {
  it("lit un set et un numéro séparés par une espace", () => {
    expect(lireReferenceCollection("OGN 042")).toEqual({ set: "OGN", collectorNumber: 42 });
  });

  it("lit un numéro seul quand le set par défaut est connu", () => {
    expect(lireReferenceCollection("042", "OGN")).toEqual({ set: "OGN", collectorNumber: 42 });
  });

  it("garde un numéro seul pour afficher les choix de tous les sets", () => {
    expect(lireReferenceCollection("042")).toEqual({ set: null, collectorNumber: 42 });
  });

  it("ne transforme pas un nom de carte", () => {
    expect(lireReferenceCollection("Demacian Diplomat", "OGN")).toBeNull();
  });
});
