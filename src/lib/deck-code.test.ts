import { describe, it, expect } from "vitest";
import { parseDeckCode } from "./deck-code";

// Toutes ces formes ont été observées ou sont produites par le site lui-même.
// Chacune faisait disparaître des cartes en silence : le deck /d/jshit35q
// affichait « Réserve (9) » au lieu de 10 parce que « 1 Vilemaw (Alternate Art) »
// n'était jamais retrouvé.

describe("parseDeckCode : parenthèses en fin de nom", () => {
  // « Vilemaw (Alternate Art) » est le vrai nom d'une carte en base
  // (unl-060a-219) : le parseur le garde entier pour que l'illustration choisie
  // soit retrouvée. C'est resolveDeckCards qui retombe sur l'impression de base
  // quand la variante n'existe pas, au lieu de perdre la carte.
  it("garde un marqueur de variante, qui fait partie du nom en base", () => {
    const { entries } = parseDeckCode("Sideboard:\n1 Vilemaw (Alternate Art)");
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Vilemaw (Alternate Art)");
    expect(entries[0].setCode).toBeUndefined();
    expect(entries[0].section).toBe("side");
  });

  it("garde les autres marqueurs cosmétiques dans le nom", () => {
    for (const marqueur of ["Overnumbered", "Signature", "Metal", "Starter", "Alt Art"]) {
      const { entries } = parseDeckCode(`MainDeck:\n1 Akali, Rogue Assassin (${marqueur})`);
      expect(entries[0].name).toBe(`Akali, Rogue Assassin (${marqueur})`);
    }
  });

  // Deux Légendes Master Yi existent : la parenthèse fait partie du nom et doit
  // survivre, sinon on ne sait plus laquelle est jouée.
  it("garde une parenthèse qui fait partie du nom", () => {
    const { entries } = parseDeckCode("MainDeck:\n1 Master Yi (Wuju Master)");
    expect(entries[0].name).toBe("Master Yi (Wuju Master)");
  });

  it("garde le code d'extension hors du nom", () => {
    const { entries } = parseDeckCode("MainDeck:\n2 Thermo Beam (OGN-022)");
    expect(entries[0].name).toBe("Thermo Beam");
    expect(entries[0].setCode).toBe("OGN-022");
    expect(entries[0].quantity).toBe(2);
  });
});

describe("parseDeckCode : en-têtes de section", () => {
  const cas: [string, string][] = [
    ["Sideboard:", "side"],
    ["Side Deck:", "side"],
    ["== Sideboard ==", "side"],
    ["Réserve:", "side"],
    ["Réserve :", "side"],
    ["reserve:", "side"],
    ["Sideboard (10):", "side"],
    ["Deck principal:", "main"],
    ["MainDeck:", "main"],
    ["Runes:", "rune"],
    ["Champs de bataille:", "battlefield"],
    ["Battlefields:", "battlefield"],
    ["Légende:", "legend"],
  ];

  for (const [entete, section] of cas) {
    it(`« ${entete} » range en ${section}`, () => {
      const { entries, errors } = parseDeckCode(`${entete}\n1 Vilemaw`);
      expect(errors).toEqual([]);
      expect(entries).toHaveLength(1);
      expect(entries[0].section).toBe(section);
    });
  }

  it("un en-tête inconnu retombe sur le deck principal sans perdre la carte", () => {
    const { entries } = parseDeckCode("Bazar:\n1 Vilemaw");
    expect(entries).toHaveLength(1);
    expect(entries[0].section).toBe("main");
  });
});

describe("parseDeckCode : formes de ligne", () => {
  it("accepte une ligne sans quantité, comptée pour 1", () => {
    const { entries, errors } = parseDeckCode("MainDeck:\nVilemaw\nThermo Beam");
    expect(errors).toEqual([]);
    expect(entries.map((e) => e.name)).toEqual(["Vilemaw", "Thermo Beam"]);
    expect(entries.every((e) => e.quantity === 1)).toBe(true);
  });

  it("accepte « 3x Nom » et « 3 Nom »", () => {
    expect(parseDeckCode("MainDeck:\n3x Defy").entries[0]).toMatchObject({ quantity: 3, name: "Defy" });
    expect(parseDeckCode("MainDeck:\n3 Defy").entries[0]).toMatchObject({ quantity: 3, name: "Defy" });
  });

  it("réduit les espaces multiples", () => {
    expect(parseDeckCode("MainDeck:\n1  Thermo   Beam").entries[0].name).toBe("Thermo Beam");
  });

  it("ignore les commentaires", () => {
    const { entries } = parseDeckCode("// note\n# autre\nMainDeck:\n1 Defy");
    expect(entries).toHaveLength(1);
  });
});

describe("parseDeckCode : le deck réel qui a révélé le défaut", () => {
  it("lit les 10 exemplaires de la réserve de /d/jshit35q", () => {
    const { entries } = parseDeckCode(
      [
        "Sideboard:",
        "1 Decree of Focus",
        "1 Decree of Rage",
        "1 Twilight Shroud",
        "2 Pyke, Dockside Butcher",
        "2 Void Seeker",
        "1 Helm of Suppression",
        "1 Thermo Beam",
        "1 Vilemaw (Alternate Art)",
      ].join("\n"),
    );
    expect(entries).toHaveLength(8);
    expect(entries.reduce((s, e) => s + e.quantity, 0)).toBe(10);
    expect(entries.every((e) => e.section === "side")).toBe(true);
    expect(entries.at(-1)!.name).toBe("Vilemaw (Alternate Art)");
  });
});
