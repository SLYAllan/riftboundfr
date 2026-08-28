import { describe, expect, it } from "vitest";
import { imageChinoise, nomChinois } from "./cards-zh";

describe("imageChinoise", () => {
  it("rend l’image officielle d’une carte de base", () => {
    // L'adresse sort du CDN de l'éditeur chinois, jamais d'un dépôt tiers.
    expect(imageChinoise("unl-001-219")).toMatch(/^https:\/\/cdn\.playloltcg\.com\//);
    expect(imageChinoise("ven-001-166")).toMatch(/^https:\/\/cdn\.playloltcg\.com\//);
  });

  it("suit le suffixe de la carte", () => {
    // Art alternatif et carte de base ont chacun leur image chez l'éditeur : le
    // suffixe fait partie du numéro imprimé, il doit rester dans la clé.
    expect(imageChinoise("unl-116a-219")).not.toBe(imageChinoise("unl-116-219"));
  });

  it("rend null quand le figurier n’a pas la carte", () => {
    // Deck de départ Vendetta : son « numéro 4 » n'est pas la VEN-004 imprimée.
    expect(imageChinoise("ven-sp4-006")).toBeNull();
    expect(imageChinoise("unl-999-219")).toBeNull();
    expect(imageChinoise(null)).toBeNull();
    expect(imageChinoise("")).toBeNull();
  });
});

describe("nomChinois", () => {
  it("rend le nom imprimé, Légende comprise", () => {
    // Une Légende porte son champion et son titre sur deux lignes : la routine les
    // joint, elle n'en invente aucune moitié.
    expect(nomChinois("Rumble, Mechanized Menace")).toBe("兰博，机械公敌");
    // Vendetta et Unleashed sont couverts depuis le passage au figurier officiel.
    expect(nomChinois("Baccai Sandspinner")).toBe("巴凯旋沙者");
  });

  it("garde le nom d’origine quand il manque", () => {
    expect(nomChinois("Carte qui n’existe pas")).toBe("Carte qui n’existe pas");
  });
});
