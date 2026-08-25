import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("classeur partagé", () => {
  test("ouvre la fiche d'une carte depuis sa tuile", () => {
    expect(source).toContain("riftboundId: true");
    expect(source).toContain('href={`/cartes/${it.card.riftboundId}`}');
    expect(source).toContain('aria-label={`${t("Voir la carte")} ${it.card.name}`}');
  });
});
