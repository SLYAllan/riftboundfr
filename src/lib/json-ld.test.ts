import { describe, expect, it } from "vitest";
import { jsonLdHtml } from "./json-ld";

describe("jsonLdHtml", () => {
  it("neutralise une balise fermante venue du contenu", () => {
    const sortie = jsonLdHtml({ headline: "</script><img onerror=x>" });
    // Le test porte sur la chaîne RENDUE : c'est elle qui part dans la page.
    expect(sortie.includes("<")).toBe(false);
    expect(JSON.parse(sortie).headline).toBe("</script><img onerror=x>");
  });
});
