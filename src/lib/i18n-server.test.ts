import { describe, expect, it } from "vitest";
import { traduireMeta } from "./i18n-server";

describe("traduireMeta", () => {
  it("ne pose aucune clé que la page n'a pas donnée", () => {
    // Une clé vide efface celle du layout : l'accueil /en sortait sans titre.
    const res = traduireMeta({ alternates: { canonical: "/" } }, "en");
    expect(Object.keys(res).sort()).toEqual(["alternates"]);
    expect(res.alternates?.canonical).toBe("/en");
  });

  it("laisse le français tel quel", () => {
    const m = { title: "Guides" };
    expect(traduireMeta(m, "fr")).toBe(m);
  });

  it("traduit les clés présentes", () => {
    const res = traduireMeta(
      { title: { absolute: "Titre | Riftbound France" }, description: "d", openGraph: { title: "o" } },
      "en",
    );
    expect(res.title).toHaveProperty("absolute");
    expect(res.openGraph).toMatchObject({ locale: "en_GB" });
    expect("twitter" in res).toBe(false);
  });
});
