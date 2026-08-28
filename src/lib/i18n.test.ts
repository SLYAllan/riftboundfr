import { describe, expect, it } from "vitest";
import { prefixerLien, sansPrefixe, traduire, traduireCanonical } from "./i18n";

describe("traduireCanonical", () => {
  it("préfixe le canonical anglais une seule fois", () => {
    expect(traduireCanonical("/tier-list", "en")).toBe("/en/tier-list");
    expect(traduireCanonical("/en/tier-list", "en")).toBe("/en/tier-list");
    expect(traduireCanonical("/", "en")).toBe("/en");
  });

  it("garde le canonical français", () => {
    expect(traduireCanonical("/tier-list", "fr")).toBe("/tier-list");
  });

  it("préfixe aussi les formes absolues et les descripteurs Next", () => {
    expect(traduireCanonical("https://riftboundfrance.fr/tier-list", "en")).toBe(
      "https://riftboundfrance.fr/en/tier-list",
    );
    expect(traduireCanonical(new URL("https://riftboundfrance.fr/tier-list"), "en").toString()).toBe(
      "https://riftboundfrance.fr/en/tier-list",
    );
    expect(traduireCanonical({ url: "/tier-list", title: "Tier list" }, "en")).toEqual({
      url: "/en/tier-list",
      title: "Tier list",
    });
  });
});

describe("chinois traditionnel", () => {
  it("préfixe et dé-préfixe /zh comme /en", () => {
    expect(prefixerLien("/profil/overlay", "zh")).toBe("/zh/profil/overlay");
    expect(prefixerLien("/zh/profil/overlay", "zh")).toBe("/zh/profil/overlay");
    expect(prefixerLien("/", "zh")).toBe("/zh");
    expect(prefixerLien("/api/overlay/state", "zh")).toBe("/api/overlay/state");
    expect(sansPrefixe("/zh/profil/overlay")).toBe("/profil/overlay");
    expect(sansPrefixe("/zh")).toBe("/");
    expect(sansPrefixe("/en/decks")).toBe("/decks");
  });

  it("retombe sur le français hors de l’overlay", () => {
    expect(traduire("Compagnon de match", "zh")).toBe("對戰助手");
    // Une phrase du site non traduite doit sortir en français, pas en clé vide.
    expect(traduire("Phrase jamais traduite", "zh")).toBe("Phrase jamais traduite");
  });
});
