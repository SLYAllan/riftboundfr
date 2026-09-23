import { describe, expect, it } from "vitest";
import { evenementClic, typeClicAchat } from "./suivi-clics";
import { lienBoutique, lienPanier, lienProduit } from "./cardnexus";

const O = "https://riftboundfrance.fr";

describe("typeClicAchat", () => {
  it("reconnaît les trois liens fabriqués par cardnexus.ts", () => {
    expect(typeClicAchat(lienProduit(151340, "Jinx - Rebel"), O)).toBe("produit");
    expect(typeClicAchat(lienPanier("abc"), O)).toBe("panier");
    expect(typeClicAchat(lienBoutique(), O)).toBe("boutique");
    expect(typeClicAchat(lienBoutique("Jinx"), O)).toBe("boutique");
  });

  it("reconnaît la route panier, avec ou sans préfixe de langue", () => {
    expect(typeClicAchat("/api/cardnexus/panier?slug=x", O)).toBe("panier");
    expect(typeClicAchat("/en/api/cardnexus/panier?code=y", O)).toBe("panier");
    expect(typeClicAchat("/api/cardnexus/panier?slug=x&manquantes=1", O)).toBe("manquantes");
  });

  it("evenementClic : achat, connexion, data-suivi, rien", () => {
    expect(evenementClic(lienPanier("a"), null, O)?.nom).toBe("clic_cardnexus");
    expect(evenementClic("/en/api/auth/discord", null, O)?.nom).toBe("connexion_discord");
    expect(evenementClic(null, "copie_code_deck", O)?.nom).toBe("copie_code_deck");
    expect(evenementClic("/decks/x", "export_image_deck", O)?.nom).toBe("export_image_deck");
    expect(evenementClic("/decks/x", null, O)).toBeNull();
  });

  it("ignore le reste", () => {
    expect(typeClicAchat("/decks/x", O)).toBeNull();
    expect(typeClicAchat("https://cardnexus.com/", O)).toBeNull();
    expect(typeClicAchat("mailto:contact@riftboundfrance.fr", O)).toBeNull();
  });
});
