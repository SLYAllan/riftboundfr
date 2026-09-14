import { describe, expect, it } from "vitest";
import { cleAbonnement, estAbonne, sujetValide } from "./abonnements";

describe("sujetValide", () => {
  it("accepte un sujet ciblé avec sa cible", () => {
    expect(sujetValide("legende", "Ahri, Nine-Tailed Fox")).toBe(true);
    expect(sujetValide("deck", "abc123")).toBe(true);
  });

  it("refuse un sujet ciblé sans cible", () => {
    // Une ligne « suivre une Légende » sans dire laquelle ne serait jamais relue.
    expect(sujetValide("legende", "")).toBe(false);
    expect(sujetValide("deck", "   ")).toBe(false);
  });

  it("accepte un sujet global sans cible, et le refuse avec", () => {
    expect(sujetValide("tournois-fr", "")).toBe(true);
    expect(sujetValide("regles", "")).toBe(true);
    expect(sujetValide("regles", "quelque chose")).toBe(false);
  });

  it("refuse un genre inconnu", () => {
    expect(sujetValide("nimporte-quoi", "x")).toBe(false);
  });

  it("refuse une cible trop longue", () => {
    expect(sujetValide("legende", "a".repeat(201))).toBe(false);
  });
});

describe("estAbonne", () => {
  const abonnements = [
    { genre: "legende", cible: "Ahri, Nine-Tailed Fox" },
    { genre: "regles", cible: "" },
  ];

  it("reconnaît un abonnement quelle que soit la casse", () => {
    // La base n'écrit pas toujours un nom pareil des deux côtés.
    expect(estAbonne(abonnements, "legende", "ahri, nine-tailed fox")).toBe(true);
  });

  it("reconnaît un abonnement global", () => {
    expect(estAbonne(abonnements, "regles")).toBe(true);
  });

  it("ne confond pas deux genres sur la même cible", () => {
    expect(estAbonne(abonnements, "deck", "Ahri, Nine-Tailed Fox")).toBe(false);
    expect(estAbonne(abonnements, "tournois-fr")).toBe(false);
  });
});

describe("cleAbonnement", () => {
  it("range la casse et les espaces", () => {
    expect(cleAbonnement("legende", "  Ahri  ")).toBe(cleAbonnement("legende", "ahri"));
  });
});
