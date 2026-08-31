import { describe, expect, it } from "vitest";
import { descripteurExistant, role, roleChampion } from "./fiches-roles";

describe("descripteurExistant", () => {
  it("prend le mot d'un rôle écrit à la main", () => {
    expect(descripteurExistant("Core — protection, 100% à 2.9x.")).toBe("protection");
    expect(descripteurExistant("Champion principal — résilience en combat.")).toBe("Champion principal");
  });

  it("le retrouve dans un rôle déjà engendré", () => {
    expect(descripteurExistant("Cœur du deck, protection, 100 % des listes, 3 exemplaires")).toBe("protection");
    expect(descripteurExistant("Champion principal, 1 exemplaire en moyenne")).toBe("Champion principal");
  });

  it("ne rend rien quand le rôle n'est que des chiffres", () => {
    expect(descripteurExistant("Cœur du deck, 100 % des listes, 3 exemplaires")).toBeNull();
    expect(descripteurExistant("1 exemplaire en moyenne")).toBeNull();
    expect(descripteurExistant(undefined)).toBeNull();
  });
});

describe("role", () => {
  it("garde le mot d'un passage à l'autre", () => {
    // Le défaut réparé : au deuxième passage, « protection » disparaissait.
    const un = role(100, 3, "Core — protection, 100% à 2.9x.");
    expect(un).toBe("Cœur du deck, protection, 100 % des listes, 3 exemplaires");
    expect(role(100, 3, un)).toBe(un);
  });

  it("laisse le rang suivre la part", () => {
    expect(role(75, 2)).toBe("Standard, 75 % des listes, 2 exemplaires");
    expect(role(50, 1)).toBe("Souple, 50 % des listes, 1 exemplaire");
  });
});

describe("roleChampion", () => {
  it("garde le mot d'un passage à l'autre", () => {
    const un = roleChampion(1, "Variante agressive — pression plus directe.");
    expect(un).toBe("Variante agressive, 1 exemplaire en moyenne");
    expect(roleChampion(1, un)).toBe(un);
  });
});
