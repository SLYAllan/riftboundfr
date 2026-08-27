import { describe, expect, it } from "vitest";
import { sansHomoglyphes, sortiesObsoletes } from "./parse-riftdecks-integrity";

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

describe("sansHomoglyphes", () => {
  it("rend son « a » latin à un pseudo marqué par riftdecks", () => {
    expect(sansHomoglyphes("ASC H\u0430ruK\u0430ze")).toBe("ASC HaruKaze");
  });

  it("laisse un pseudo déjà propre tel quel", () => {
    expect(sansHomoglyphes("MICE TheManLand")).toBe("MICE TheManLand");
  });

  it("ne touche pas à un nom chinois", () => {
    expect(sansHomoglyphes("神切.i开TV")).toBe("神切.i开TV");
  });

  it("laisse intact un vrai pseudo cyrillique", () => {
    expect(sansHomoglyphes("Дмитрий")).toBe("Дмитрий");
  });
});
