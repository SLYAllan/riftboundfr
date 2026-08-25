import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("le JSON-LD suit la langue de la page", () => {
  const source = readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");
  expect(source).toContain("jsonLd(langue)");
  expect(source).toContain('inLanguage: langue');
  expect(source).toContain('langue === "fr"');
  expect(source).toContain('${langue === "fr" ? "" : "/en"}/cartes?q={search_term_string}');
});
