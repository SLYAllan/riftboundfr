import { describe, expect, it, vi } from "vitest";
import {
  executerImportPiltover,
  lireEtatCollection,
  lireEtatLike,
  lirePublicationDeck,
} from "./reponses-utilisateur";

describe("réponses réseau visibles par l'utilisateur", () => {
  it("reprend l'erreur utile d'une publication refusée", async () => {
    const resultat = await lirePublicationDeck(
      new Response(JSON.stringify({ error: "Titre refusé" }), { status: 422 }),
      "https://riftboundfrance.fr",
    );
    expect(resultat).toBe("Titre refusé");
  });

  it("refuse une publication réussie sans code de partage", async () => {
    const resultat = await lirePublicationDeck(new Response(JSON.stringify({ ok: true })), "https://riftboundfrance.fr");
    expect(resultat).toBe("Réponse du serveur invalide. Réessayez.");
  });

  it("distingue un visiteur anonyme d'une panne de collection", async () => {
    await expect(lireEtatCollection(new Response(JSON.stringify({ anonymous: true })))).resolves.toEqual({ type: "anonyme" });
    await expect(lireEtatCollection(new Response("indisponible", { status: 503 }))).rejects.toThrow("chargement impossible");
  });

  it("refuse une réponse J'aime mal formée", async () => {
    await expect(lireEtatLike(new Response(JSON.stringify({ liked: "oui", likes: "4" })))).rejects.toThrow("réponse invalide");
  });

  it("distingue fichier, réseau et refus serveur pendant l'import", async () => {
    await expect(executerImportPiltover(
      { text: vi.fn().mockRejectedValue(new Error("lecture")) }, "/import", vi.fn(),
    )).rejects.toThrow("Fichier illisible.");

    await expect(executerImportPiltover(
      { text: vi.fn().mockResolvedValue("csv") }, "/import", vi.fn().mockRejectedValue(new Error("réseau")),
    )).rejects.toThrow("Connexion impossible. Vérifiez votre réseau puis réessayez.");

    await expect(executerImportPiltover(
      { text: vi.fn().mockResolvedValue("csv") }, "/import",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "invalid_quantity" }), { status: 400 })),
    )).rejects.toThrow("Le fichier contient une quantité invalide.");
  });
});
