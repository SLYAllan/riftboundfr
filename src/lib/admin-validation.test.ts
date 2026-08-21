import { describe, expect, it } from "vitest";
import {
  validerArticle,
  validerDeck,
  validerEvenement,
  validerImportDeck,
  validerTierList,
} from "./admin-validation";
import { normalizeCardName } from "./card-printing";

describe("validation des entrées admin", () => {
  it("normalise les apostrophes équivalentes d'un nom de carte", () => {
    expect(normalizeCardName("Kha'Zix")).toBe(normalizeCardName("Khazix"));
  });
  it("accepte un article éditorial valide et ses blocs connus", () => {
    const article = {
      title: "Le méta de la semaine",
      category: "meta",
      tags: ["méta"],
      blocks: [
        { type: "text", id: "a", content: "Bonjour" },
        { type: "separator", id: "b" },
        { type: "image", id: "c", src: "https://example.com/image.png", alt: "Une image" },
      ],
      published: true,
      featured: false,
      tournamentPlayerCount: 32,
    };

    expect(validerArticle(article)).toEqual({ ok: true, value: article });
  });

  it("refuse un article qui contient un champ ou un bloc inconnu", () => {
    expect(validerArticle({ title: "Titre", blocks: [], admin: true })).toEqual({
      ok: false,
      error: "Champ article inconnu : admin",
    });
    expect(validerArticle({ title: "Titre", blocks: [{ type: "podcast", id: "x" }] })).toEqual({
      ok: false,
      error: "blocks.0.type inconnu",
    });
  });

  it("accepte un bloc video et refuse celui qui n'a pas de fichier", () => {
    // La liste blanche de `validerBloc` refuse tout type absent : un bloc ajouté au
    // type `ArticleBlock` sans l'être ici fait échouer l'enregistrement en admin,
    // avec « type inconnu » pour seul message.
    const article = { title: "Titre", blocks: [{ type: "video", id: "v", src: "/video/demo.mp4", poster: "/img/a.webp", loop: false }] };
    expect(validerArticle(article)).toEqual({ ok: true, value: article });
    expect(validerArticle({ title: "Titre", blocks: [{ type: "video", id: "v" }] })).toEqual({
      ok: false,
      error: "blocks.0.src est requis",
    });
  });

  it("refuse les dates invalides et les longueurs excessives", () => {
    expect(validerEvenement({ title: "Tournoi", date: "pas une date" })).toEqual({
      ok: false,
      error: "date doit être une date ISO valide",
    });
    expect(validerArticle({ title: "x".repeat(201), blocks: [] })).toEqual({
      ok: false,
      error: "title dépasse 200 caractères",
    });
    expect(validerEvenement({ title: "Tournoi", date: "2026-02-30" })).toEqual({
      ok: false,
      error: "date doit être une date ISO valide",
    });
  });

  it("accepte une mise à jour partielle d'article", () => {
    expect(validerArticle({ published: true }, "mise à jour")).toEqual({ ok: true, value: { published: true } });
    expect(validerArticle({ title: null }, "mise à jour")).toEqual({ ok: false, error: "title doit être une chaîne" });
    expect(validerArticle({ category: null }, "mise à jour")).toEqual({ ok: false, error: "category doit être une chaîne" });
    expect(validerEvenement({ type: null }, "mise à jour")).toEqual({ ok: false, error: "type doit être une chaîne" });
    expect(validerEvenement({ title: null }, "mise à jour")).toEqual({ ok: false, error: "title doit être une chaîne" });
  });

  it("valide un événement et un deck avec tableaux contrôlés", () => {
    const evenement = { title: "Open Paris", date: "2026-08-14", type: "online", published: false };
    expect(validerEvenement(evenement)).toEqual({ ok: true, value: evenement });

    const deck = {
      title: "Poppy contrôle",
      legendId: "abc",
      legendName: "Poppy",
      tags: ["contrôle"],
      cards: [{ cardId: "card-1", quantity: 3, section: "main" }],
    };
    expect(validerDeck(deck)).toEqual({ ok: true, value: deck });
  });

  it("refuse les cartes de deck qui ne sont pas des objets valides", () => {
    expect(validerDeck({ title: "Deck", legendId: "l", legendName: "L", cards: [{ cardId: "x", quantity: 0 }] })).toEqual({
      ok: false,
      error: "cards.0.quantity doit être un entier entre 1 et 99",
    });
    expect(validerDeck({ title: "Deck", legendId: "l", legendName: "L", cards: [
      { cardId: "x", section: "invalid" },
    ] })).toEqual({ ok: false, error: "cards.0.section inconnu" });
    expect(validerDeck({ title: "Deck", legendId: "l", legendName: "L", cards: [
      { cardId: "x", section: "main" }, { cardId: "x", section: "main" },
    ] })).toEqual({ ok: false, error: "cards.1.cardId est déjà présent dans la section main" });
    expect(validerDeck({ legendId: null }, "mise à jour")).toEqual({ ok: false, error: "legendId doit être une chaîne" });
    expect(validerDeck({ format: null }, "mise à jour")).toEqual({ ok: false, error: "format doit être une chaîne" });
    expect(validerTierList({ id: "tier-1", title: null }, "mise à jour")).toEqual({ ok: false, error: "title doit être une chaîne" });
    expect(validerTierList({ id: "tier-1", format: null }, "mise à jour")).toEqual({ ok: false, error: "format doit être une chaîne" });
  });

  it("exige les propriétés sponsor et leurs bons types", () => {
    expect(validerArticle({ title: "Article", blocks: [{ type: "sponsor_link", id: "s", title: "Lien", ctaText: "Voir", url: "https://example.com" }] })).toEqual({
      ok: false,
      error: "blocks.0.style est requis",
    });
    expect(validerArticle({ title: "Article", blocks: [{ type: "text", id: "t", content: true }] })).toEqual({
      ok: false,
      error: "blocks.0.content doit être une chaîne",
    });
    expect(validerArticle({ title: "Article", blocks: [{ type: "text", id: "t", content: "" }] })).toEqual({
      ok: false,
      error: "blocks.0.content est requis",
    });
    expect(validerArticle({ title: "Article", blocks: [{ type: "text", id: "t", content: null }] })).toEqual({
      ok: false,
      error: "blocks.0.content doit être une chaîne",
    });
    expect(validerArticle({ title: "Article", blocks: [{ type: "bracket", id: "b", rounds: [{ name: "", matches: [] }] }] })).toEqual({
      ok: false,
      error: "blocks.0.rounds.0.name est requis",
    });
    expect(validerArticle({ title: "Article", blocks: [{ type: "bracket", id: "b", rounds: [{ name: "Finale", matches: [{ a: { player: null }, b: { player: "B" } }] }] }] })).toEqual({
      ok: false,
      error: "a du match.player doit être une chaîne",
    });
  });

  it("valide les entrées de tier list et l'import de deck", () => {
    const tier = { id: "tier-1", entries: [{ id: "entry-1", tierListId: "tier-1", legendId: "l", legendName: "Poppy", tier: "S", position: 0 }] };
    expect(validerTierList(tier, "mise à jour")).toEqual({ ok: true, value: tier });
    expect(validerTierList({ id: "tier-1", entries: [{ legendId: "l", legendName: "Poppy", tier: "X" }] }, "mise à jour")).toEqual({
      ok: false,
      error: "entries.0.tier doit être S, A, B, C ou D",
    });
    expect(validerTierList({ id: "tier-1", entries: [
      { legendId: "l", legendName: "Poppy", tier: "S" },
      { legendId: "l", legendName: "Poppy", tier: "A" },
    ] }, "mise à jour")).toEqual({ ok: false, error: "entries.1.legendId est déjà présent" });

    const imported = { deckCode: "Legend:\n1 Poppy", title: "Poppy", date: "2026-08-14" };
    expect(validerImportDeck(imported)).toEqual({ ok: true, value: imported });
  });
});
