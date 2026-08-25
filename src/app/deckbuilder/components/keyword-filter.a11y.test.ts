import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "../../../components/keyword-filter.tsx"), "utf8");

describe("accessibilité du filtre de mécaniques", () => {
  it("borne le panneau à l'écran et expose ses états", () => {
    expect(source).toContain("var(--available-height)");
    expect(source).toContain("aria-pressed={active}");
    expect(source).toContain('aria-label={t("Rechercher une mécanique")}');
    expect(source).toContain("min-h-11");
  });
});
