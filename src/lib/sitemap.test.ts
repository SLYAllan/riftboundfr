import { describe, expect, it } from "vitest";
import { avecAnglais } from "./sitemap";

describe("avecAnglais", () => {
  it("ajoute la racine et les pages anglaises avec leurs alternates", () => {
    const pages = avecAnglais(
      [{ url: "https://riftboundfrance.fr" }, { url: "https://riftboundfrance.fr/decks/un-deck" }],
      "https://riftboundfrance.fr",
    );

    expect(pages.map((page) => page.url)).toEqual([
      "https://riftboundfrance.fr",
      "https://riftboundfrance.fr/en",
      "https://riftboundfrance.fr/decks/un-deck",
      "https://riftboundfrance.fr/en/decks/un-deck",
    ]);
    expect(pages[2].alternates?.languages).toEqual({
      fr: "https://riftboundfrance.fr/decks/un-deck",
      en: "https://riftboundfrance.fr/en/decks/un-deck",
    });
  });
});
