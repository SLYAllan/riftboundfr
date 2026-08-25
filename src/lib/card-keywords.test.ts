import { describe, expect, it } from "vitest";
import { filtrerParMotCle, listerMotsCles, rechercherMotsCles } from "./card-keywords";

const cartes = [
  { nom: "A", textPlain: "[Hunt 2] When you play me, gain 1 XP." },
  { nom: "B", textPlain: "[Action][>] When I attack or defend, draw 1." },
  { nom: "C", textPlain: null },
];

describe("filtres de mots-clés du deckbuilder", () => {
  it("liste les mots-clés, l'XP et les déclencheurs présents dans le texte", () => {
    expect(listerMotsCles(cartes)).toEqual([
      { value: "action", label: "Action", labelEn: "Action", categorie: "mot-cle", count: 1 },
      { value: "hunt", label: "Chasse", labelEn: "Hunt", categorie: "mot-cle", count: 1 },
      { value: "when-i-attack", label: "Quand j’attaque", labelEn: "When I attack", categorie: "declencheur", count: 1 },
      { value: "when-i-defend", label: "Quand je défends", labelEn: "When I defend", categorie: "declencheur", count: 1 },
      { value: "when-you-play", label: "Quand vous jouez", labelEn: "When you play", categorie: "declencheur", count: 1 },
      { value: "xp", label: "XP", labelEn: "XP", categorie: "ressource", count: 1 },
    ]);
  });

  it("filtre sur la mécanique choisie et non sur les tags de carte", () => {
    expect(filtrerParMotCle(cartes, "hunt").map((carte) => carte.nom)).toEqual(["A"]);
    expect(filtrerParMotCle(cartes, "when-i-defend").map((carte) => carte.nom)).toEqual(["B"]);
    expect(filtrerParMotCle(cartes, "xp").map((carte) => carte.nom)).toEqual(["A"]);
    expect(filtrerParMotCle(cartes, "")).toEqual(cartes);
  });

  it("recherche les libellés français et anglais sans tenir compte des accents", () => {
    const options = listerMotsCles(cartes);
    expect(rechercherMotsCles(options, "chasse").map(({ value }) => value)).toEqual(["hunt"]);
    expect(rechercherMotsCles(options, "defend").map(({ value }) => value)).toEqual(["when-i-defend"]);
  });
});
