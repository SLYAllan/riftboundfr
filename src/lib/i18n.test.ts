import { describe, expect, it } from "vitest";
import { traduireCanonical } from "./i18n";

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
