import { describe, expect, it } from "vitest";
import { lireReponsePanier } from "./panier-achat";

describe("lireReponsePanier", () => {
  it("rend le lien affilié du Cart Wizard", () => {
    const url = "https://af.cardnexus.link/7595319/products/cn/151305.1.en";
    expect(lireReponsePanier(200, { url })).toEqual({ url });
  });

  it("refuse une adresse qui n'est pas le lien affilié", () => {
    expect(lireReponsePanier(200, { url: "https://cardnexus.com/en/cart-wizard" })).toHaveProperty("erreur");
    expect(lireReponsePanier(200, { url: "https://exemple.fr" })).toHaveProperty("erreur");
  });

  it("reprend le message de la route quand elle refuse", () => {
    expect(lireReponsePanier(404, { error: "Deck introuvable." })).toEqual({ erreur: "Deck introuvable." });
    expect(lireReponsePanier(429, { error: "Trop de requêtes" })).toEqual({ erreur: "Trop de requêtes" });
  });

  it("dit que le site ne répond pas sur un 502 du proxy, qui n'est pas du JSON", () => {
    expect(lireReponsePanier(502, null)).toEqual({
      erreur: "Le site ne répond pas pour le moment. Réessayez dans un instant.",
    });
  });

  it("nomme le statut d'une réponse inattendue", () => {
    expect(lireReponsePanier(200, null)).toEqual({ erreur: "Réponse inattendue du serveur (200)." });
  });
});
