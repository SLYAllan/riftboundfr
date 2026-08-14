import { describe, expect, it } from "vitest";
import { sortiesObsoletes } from "./parse-riftdecks-integrity";

describe("sortiesObsoletes", () => {
  it("supprime les anciens JSON absents du fragment courant", () => {
    const precedent = [
      { id: "deck-1", file: "kennen/s4-test-1.json" },
      { id: "deck-2", file: "akali/s4-test-2.json" },
    ];
    const courant = [{ id: "deck-1", file: "kennen/s4-test-1.json" }];

    expect(sortiesObsoletes(precedent, courant)).toEqual(["akali/s4-test-2.json"]);
  });

  it("ne supprime pas un fichier encore accepté sous le même chemin", () => {
    const entree = { id: "deck-1", file: "kennen/s4-test-1.json" };

    expect(sortiesObsoletes([entree], [entree])).toEqual([]);
  });
});
