import { describe, it, expect } from "vitest";
import { splitChampion } from "./champion";
import type { DeckEntry } from "@/types";

const entry = (name: string, quantity: number, supertype: string | null = null) =>
  ({ cardId: name, name, imageUrl: null, type: "Unit", supertype, energy: 1, domains: [], quantity }) as unknown as DeckEntry;

describe("splitChampion", () => {
  it("ne détache qu'un exemplaire et laisse les copies dans le deck principal", () => {
    const main = [entry("Akali, Silent", 2, "Champion"), entry("Charm", 3)];
    const { champion, rest } = splitChampion(main, "Akali, Rogue Assassin");
    expect(champion?.quantity).toBe(1);
    expect(rest.find((e) => e.name === "Akali, Silent")?.quantity).toBe(1);
    // Aucune carte perdue : 2 + 3 en entrée, 1 + 1 + 3 en sortie.
    expect((champion?.quantity ?? 0) + rest.reduce((s, e) => s + e.quantity, 0)).toBe(5);
  });

  it("retire l'entrée du main quand le champion n'a qu'un exemplaire", () => {
    const main = [entry("Akali, Silent", 1, "Champion"), entry("Charm", 3)];
    const { champion, rest } = splitChampion(main, "Akali, Rogue Assassin");
    expect(champion?.quantity).toBe(1);
    expect(rest.some((e) => e.name === "Akali, Silent")).toBe(false);
  });

  it("ne décrémente que la ligne trouvée si la carte apparaît deux fois", () => {
    // Cas d'un code texte importé : le champion arrive sur sa propre ligne, ses copies
    // sur une autre. Décrémenter les deux perdait un exemplaire.
    const main = [entry("Akali, Silent", 1, "Champion"), entry("Akali, Silent", 2, "Champion")];
    const { champion, rest } = splitChampion(main, "Akali, Rogue Assassin");
    expect(champion?.quantity).toBe(1);
    expect((champion?.quantity ?? 0) + rest.reduce((s, e) => s + e.quantity, 0)).toBe(3);
  });

  it("laisse le deck intact sans champion correspondant", () => {
    const main = [entry("Charm", 3)];
    expect(splitChampion(main, "Akali, Rogue Assassin")).toEqual({ champion: undefined, rest: main });
  });
});
