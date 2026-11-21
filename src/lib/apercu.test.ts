import { describe, expect, it } from "vitest";
import { cartesCles, completerApercu, couperAuMot, datesEnFrancais, texteSansCodes } from "./apercu";

describe("completerApercu", () => {
  it("laisse intacte une page qui ne pose ni titre ni description", () => {
    // L'accueil /en ne pose que son canonical : il doit garder l'aperçu du layout.
    const m = { alternates: { canonical: "/" } };
    expect(completerApercu(m)).toBe(m);
  });

  it("tire l'aperçu du titre et de la description quand la page n'en pose pas", () => {
    const res = completerApercu({ title: "Guides Riftbound", description: "Tous les guides." });
    expect(res.openGraph).toMatchObject({
      type: "website",
      siteName: "Riftbound France",
      locale: "fr_FR",
      title: "Guides Riftbound",
      description: "Tous les guides.",
      images: ["/img/og-default.png"],
    });
    expect(res.twitter).toMatchObject({
      card: "summary_large_image",
      site: "@FRRiftbound",
      title: "Guides Riftbound",
      description: "Tous les guides.",
      images: ["/img/og-default.png"],
    });
  });

  it("lit un titre absolu", () => {
    const res = completerApercu({ title: { absolute: "Méta Riftbound Radiance" } });
    expect(res.openGraph?.title).toBe("Méta Riftbound Radiance");
  });

  it("garde ce que la page a posé et ajoute le nom du site", () => {
    const res = completerApercu({
      title: "Titre de recherche",
      openGraph: { type: "article", title: "Titre d'aperçu", description: "d", images: ["/api/decklist-image?share=abc"] },
    });
    expect(res.openGraph).toMatchObject({
      type: "article",
      siteName: "Riftbound France",
      locale: "fr_FR",
      title: "Titre d'aperçu",
      images: ["/api/decklist-image?share=abc"],
    });
    expect(res.twitter).toMatchObject({ site: "@FRRiftbound", title: "Titre d'aperçu", images: ["/api/decklist-image?share=abc"] });
  });

  it("n'ajoute pas d'image à une page qui pose un openGraph sans image", () => {
    // Les articles ont leur fichier opengraph-image : une image de plus sortirait en double.
    const res = completerApercu({ title: "Article", openGraph: { type: "article", title: "Article" } });
    expect(res.openGraph && "images" in res.openGraph).toBe(false);
    expect(res.twitter && "images" in res.twitter).toBe(false);
  });

  it("ne remplace pas le bloc twitter d'une page", () => {
    const res = completerApercu({ title: "t", twitter: { card: "summary", title: "Titre X" } });
    expect(res.twitter).toMatchObject({ card: "summary", title: "Titre X", site: "@FRRiftbound" });
  });
});

describe("datesEnFrancais", () => {
  it("écrit une date de machine en toutes lettres", () => {
    expect(datesEnFrancais("S5 Chengdu City Challenge (2026-11-07)")).toBe("S5 Chengdu City Challenge (7 novembre 2026)");
  });

  it("écrit « 1er » pour le premier du mois", () => {
    expect(datesEnFrancais("128 joueurs, 2026-11-01")).toBe("128 joueurs, 1er novembre 2026");
  });

  it("laisse un texte sans date, et une date impossible", () => {
    expect(datesEnFrancais("Riftbound Showdown Sacramento")).toBe("Riftbound Showdown Sacramento");
    expect(datesEnFrancais("le 2026-13-45")).toBe("le 2026-13-45");
  });
});

describe("texteSansCodes", () => {
  it("remplace les codes d'icône par des mots", () => {
    expect(texteSansCodes("[Accelerate] (You may pay :rb_energy_1::rb_rune_fury: as an additional cost to have me enter ready.)")).toBe(
      "[Accelerate] (You may pay 1 Fury as an additional cost to have me enter ready.)",
    );
  });

  it("garde la ponctuation collée au mot", () => {
    expect(texteSansCodes("Pay :rb_exhaust:: draw 1. Gain 2 :rb_might:.")).toBe("Pay exhaust: draw 1. Gain 2 might.");
  });
});

describe("cartesCles", () => {
  const carte = (name: string, quantity: number, type = "Unit", imageUrl: string | null = `${name}.png`) => ({ name, quantity, type, imageUrl });
  const rarete = new Map([["Epique", "Epic"], ["Rare A", "Rare"], ["Rare B", "Rare"], ["Commune", "Common"]]);

  it("range les plus rares d'abord, puis les plus jouées", () => {
    const cles = cartesCles([carte("Commune", 3), carte("Rare A", 1), carte("Rare B", 3), carte("Epique", 1)], rarete, 3);
    expect(cles.map((c) => c.name)).toEqual(["Epique", "Rare B", "Rare A"]);
  });

  it("écarte la Légende, les runes, les champs de bataille et les cartes sans image", () => {
    const cles = cartesCles(
      [carte("Légende", 1, "Legend"), carte("Rune", 6, "Rune"), carte("Terrain", 1, "Battlefield"), carte("Sans image", 3, "Unit", null), carte("Commune", 2)],
      rarete,
    );
    expect(cles.map((c) => c.name)).toEqual(["Commune"]);
  });

  it("ne montre pas deux fois la même carte", () => {
    const cles = cartesCles([carte("Epique", 2), carte("Epique", 1), carte("Commune", 3)], rarete);
    expect(cles.map((c) => c.name)).toEqual(["Epique", "Commune"]);
  });
});

describe("couperAuMot", () => {
  it("rend un texte court tel quel", () => {
    expect(couperAuMot("Texte court.", 50)).toBe("Texte court.");
  });

  it("coupe au dernier mot entier", () => {
    const res = couperAuMot("plan de jeu, cartes clés, forces et faiblesses", 40);
    expect(res).toBe("plan de jeu, cartes clés, forces et…");
    expect(res.length).toBeLessThanOrEqual(40);
  });
});
