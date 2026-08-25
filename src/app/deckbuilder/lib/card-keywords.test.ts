import { describe, expect, it } from "vitest";
import { filtrerParMotCle, listerMotsCles } from "./card-keywords";

const cartes = [
  { nom: "A", tags: ["Accelerate", "Demacia"] },
  { nom: "B", tags: ["Accelerate", "Piltover"] },
  { nom: "C", tags: [] },
];

describe("filtres de mots-clés du deckbuilder", () => {
  it("liste chaque mot-clé une fois dans l'ordre alphabétique", () => {
    expect(listerMotsCles(cartes)).toEqual(["Accelerate", "Demacia", "Piltover"]);
  });

  it("garde les cartes qui portent le mot-clé choisi sans tenir compte de la casse", () => {
    expect(filtrerParMotCle(cartes, "accelerate").map((carte) => carte.nom)).toEqual(["A", "B"]);
    expect(filtrerParMotCle(cartes, "")).toEqual(cartes);
  });
});
