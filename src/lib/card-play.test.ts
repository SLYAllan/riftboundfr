import { describe, expect, it } from "vitest";
import { comparerDecksJoues, moyenneExemplaires, nomEvenement, rangPlacement, type DeckQuiJoue } from "./card-play";

const deck = (p: Partial<DeckQuiJoue>): DeckQuiJoue => ({
  slug: "d", title: "T", legendName: "L", placement: null,
  tournamentContext: null, featured: false, date: null,
  quantite: 3, section: "main", ...p,
});

describe("rangPlacement", () => {
  it("lit le nombre dans un classement écrit en toutes lettres", () => {
    expect(rangPlacement("1st")).toBe(1);
    // Trié comme du texte, « 10th » passerait avant « 2nd ».
    expect(rangPlacement("10th")).toBe(10);
    expect(rangPlacement("1781th")).toBe(1781);
  });

  it("renvoie un deck sans classement à la fin", () => {
    expect(rangPlacement(null)).toBe(Number.POSITIVE_INFINITY);
    expect(rangPlacement("Top 8")).toBe(8);
    expect(rangPlacement("—")).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("comparerDecksJoues", () => {
  it("met le mieux classé devant", () => {
    const listes = [deck({ slug: "b", placement: "10th" }), deck({ slug: "a", placement: "2nd" })];
    expect(listes.sort(comparerDecksJoues).map((d) => d.slug)).toEqual(["a", "b"]);
  });

  it("place un deck classé avant un deck sans classement, même mis en avant", () => {
    const listes = [
      deck({ slug: "vedette", featured: true, placement: null }),
      deck({ slug: "quatrieme", placement: "4th" }),
    ];
    expect(listes.sort(comparerDecksJoues).map((d) => d.slug)).toEqual(["quatrieme", "vedette"]);
  });

  it("départage deux decks non classés par la date, le plus récent devant", () => {
    const listes = [
      deck({ slug: "vieux", date: "2025-08-24" }),
      deck({ slug: "neuf", date: "2026-07-12" }),
    ];
    expect(listes.sort(comparerDecksJoues).map((d) => d.slug)).toEqual(["neuf", "vieux"]);
  });
});

describe("moyenneExemplaires", () => {
  it("arrondit au dixième", () => {
    expect(moyenneExemplaires(7, 3)).toBe(2.3);
    expect(moyenneExemplaires(9, 3)).toBe(3);
  });

  it("ne divise pas par zéro", () => {
    // Une carte que personne ne joue n'a pas une moyenne de 0 exemplaire : elle
    // n'en a pas. Afficher « 0 » laisserait croire qu'on l'a mesurée.
    expect(moyenneExemplaires(0, 0)).toBeNull();
  });
});

describe("nomEvenement", () => {
  it("retire la date que le contexte traîne déjà", () => {
    // Sinon la ligne affichait « S3 National Open (2026-07-19) 19 juillet 2026 ».
    expect(nomEvenement("S3 National Open (2026-07-19)")).toBe("S3 National Open");
    expect(nomEvenement("S4 Wuhan Regional Open (2026-08-29)")).toBe("S4 Wuhan Regional Open");
  });

  it("laisse intact un nom qui ne porte pas de date", () => {
    expect(nomEvenement("RQ Hartford 2026")).toBe("RQ Hartford 2026");
    expect(nomEvenement("Barcelona Regional Qualifier")).toBe("Barcelona Regional Qualifier");
  });
});
