import { describe, expect, it } from "vitest";
import { resoudreLegende } from "./tier-list-integrity";

const cartes = [
  { id: "yi-bladesman", name: "Master Yi, Wuju Bladesman" },
  { id: "yi-master", name: "Master Yi, Wuju Master" },
  { id: "akali", name: "Akali - Rogue Assassin" },
];

describe("resoudreLegende", () => {
  it("résout le nom complet exact avec virgule ou tiret", () => {
    expect(resoudreLegende("Master Yi, Wuju Master", cartes)).toBe("yi-master");
    expect(resoudreLegende("Akali, Rogue Assassin", cartes)).toBe("akali");
  });

  it("refuse un simple prénom ambigu", () => {
    expect(resoudreLegende("Master Yi", cartes)).toBeNull();
  });

  it("refuse une légende absente au lieu d'en choisir une autre", () => {
    expect(resoudreLegende("Master Yi, Inconnue", cartes)).toBeNull();
  });
});
