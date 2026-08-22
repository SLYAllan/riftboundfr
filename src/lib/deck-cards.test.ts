import { describe, it, expect } from "vitest";
import { queryKeys, deckCoverageItems } from "./deck-cards";
import { buildCardLookup, findCard, normalizeCardName, looksLikeRiftboundId } from "./card-printing";

// Une carte doit être retrouvée quelle que soit la façon dont un joueur a collé
// son nom. Chaque écart ci-dessous la faisait disparaître de la liste affichée.

const carte = (riftboundId: string, name: string, opts: Partial<{ set: string; collectorNumber: number; alternateArt: boolean }> = {}) => ({
  riftboundId,
  name,
  set: opts.set ?? "UNL",
  collectorNumber: opts.collectorNumber ?? 60,
  alternateArt: opts.alternateArt ?? false,
});

describe("looksLikeRiftboundId", () => {
  it("reconnaît un identifiant", () => {
    for (const id of ["unl-060-219", "ogn-183", "ven-040-166"]) {
      expect(looksLikeRiftboundId(id)).toBe(true);
    }
  });

  // C'était le piège : « Defy » et « Vilemaw » n'ont ni espace ni virgule, donc
  // l'ancienne heuristique les prenait pour des identifiants et cherchait un
  // riftboundId nommé « Defy ». Aucune correspondance, carte perdue.
  it("ne prend pas un nom court pour un identifiant", () => {
    for (const nom of ["Defy", "Vilemaw", "Charm", "Master Yi"]) {
      expect(looksLikeRiftboundId(nom)).toBe(false);
    }
  });
});

describe("normalizeCardName", () => {
  it("ramène toutes les apostrophes à la même clé", () => {
    const attendu = normalizeCardName("Zhonya's Hourglass");
    expect(normalizeCardName("Zhonya’s Hourglass")).toBe(attendu);
    expect(normalizeCardName("Zhonyas Hourglass")).toBe(attendu);
    expect(normalizeCardName("ZHONYA'S HOURGLASS")).toBe(attendu);
  });

  it("ignore virgules, espaces multiples et suffixe de variante", () => {
    const attendu = normalizeCardName("Kai'Sa, Survivor");
    expect(normalizeCardName("KaiSa Survivor")).toBe(attendu);
    expect(normalizeCardName("Kai'Sa,   Survivor")).toBe(attendu);
    expect(normalizeCardName("Kai'Sa, Survivor (Alternate Art)")).toBe(attendu);
    for (const suffixe of ["Alt", "Alt Art", "Metal", "Overnumbered", "Signature", "Starter", "Ultimate"]) {
      expect(normalizeCardName(`Kai'Sa, Survivor (${suffixe})`)).toBe(attendu);
    }
  });
});

describe("queryKeys", () => {
  it("propose la forme sans apostrophe et sans ponctuation", () => {
    // cleanName stocke « Kai'Sa, Survivor » sous « KaiSa Survivor » : sans cette
    // forme, la requête ne ramenait pas la ligne et la carte était perdue.
    expect(queryKeys("Kai’Sa, Survivor")).toContain("KaiSa Survivor");
    expect(queryKeys("Kai'Sa, Survivor")).toContain("KaiSa Survivor");
  });

  it("retire le suffixe de variante avant de chercher", () => {
    expect(queryKeys("Vilemaw (Alternate Art)")).toContain("Vilemaw");
  });

  it("garde l'identifiant d'origine", () => {
    expect(queryKeys("unl-060-219")).toContain("unl-060-219");
  });
});

describe("findCard", () => {
  const map = buildCardLookup([
    carte("unl-060-219", "Vilemaw"),
    carte("ven-021-166", "Kai'Sa, Survivor", { set: "VEN", collectorNumber: 21 }),
  ]);

  it("retrouve par identifiant, nom exact, casse et forme normalisée", () => {
    for (const cle of ["unl-060-219", "Vilemaw", "vilemaw", "VILEMAW"]) {
      expect(findCard(map, cle)?.riftboundId).toBe("unl-060-219");
    }
  });

  it("retrouve malgré l'apostrophe et le suffixe de variante", () => {
    for (const cle of ["Kai'Sa, Survivor", "Kai’Sa, Survivor", "KaiSa Survivor", "Kai'Sa, Survivor (Alternate Art)"]) {
      expect(findCard(map, cle)?.riftboundId).toBe("ven-021-166");
    }
  });

  it("renvoie undefined sur une carte inconnue, pour qu'elle soit signalée", () => {
    expect(findCard(map, "Carte Qui N'Existe Pas")).toBeUndefined();
  });
});

describe("préférence d'impression", () => {
  // Une carte qui n'existe QU'en alt-art restait introuvable à cause du filtre
  // `alternateArt: false` de l'ancienne requête.
  it("trouve une carte qui n'existe qu'en alt-art", () => {
    const map = buildCardLookup([carte("unl-999-219", "Carte Rare", { alternateArt: true })]);
    expect(findCard(map, "Carte Rare")?.riftboundId).toBe("unl-999-219");
  });

  it("préfère l'impression normale quand les deux existent", () => {
    const map = buildCardLookup([
      carte("unl-060-219", "Vilemaw", { alternateArt: true, collectorNumber: 1 }),
      carte("unl-060-220", "Vilemaw", { alternateArt: false, collectorNumber: 99 }),
    ]);
    expect(findCard(map, "Vilemaw")?.riftboundId).toBe("unl-060-220");
  });
});

describe("deckCoverageItems", () => {
  const deck = {
    legend: { cardId: "ogs-019-024", quantity: 1 },
    champion: { cardId: "ogs-009-024", quantity: 2 },
    main: [{ cardId: "ogn-091-298", quantity: 3 }],
    rune: [{ cardId: "opp-042b-298", quantity: 6 }],
    battlefield: [{ cardId: "ogn-284-298", quantity: 1 }],
    side: [{ cardId: "ogn-156-298", quantity: 1 }],
  };

  // C'était le bug : la réserve était oubliée par le deckbuilder et par la liste
  // des decks communautaires, qui annonçaient donc moins de cartes manquantes
  // que la page du deck lui-même.
  it("compte la réserve, qu'il faut posséder pour jouer en tournoi", () => {
    const items = deckCoverageItems(deck);
    expect(items.find((i) => i.section === "side")).toEqual({
      cardId: "ogn-156-298",
      quantity: 1,
      section: "side",
    });
    expect(items.reduce((s, i) => s + i.quantity, 0)).toBe(14);
  });

  it("range la Légende et le champion dans la même section", () => {
    const legend = deckCoverageItems(deck).filter((i) => i.section === "legend");
    expect(legend.map((i) => i.cardId)).toEqual(["ogs-019-024", "ogs-009-024"]);
  });

  it("accepte un deck sans Légende ni champion", () => {
    const items = deckCoverageItems({ ...deck, legend: null, champion: null });
    expect(items.some((i) => i.section === "legend")).toBe(false);
    expect(items).toHaveLength(4);
  });
});
