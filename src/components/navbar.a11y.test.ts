import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "navbar.tsx"), "utf8");

describe("accessibilité de la navigation", () => {
  it("rend le focus au bouton quand Échap ferme le menu mobile", () => {
    expect(source).toMatch(
      /if \(mobileOpen\) \{\s*setMobileOpen\(false\);\s*boutonMobileRef\.current\?\.focus\(\);\s*\}/,
    );
    expect(source).toContain("ref={boutonMobileRef}");
  });

  it("rend aussi le focus au bouton Outils et garde le menu mobile compact", () => {
    expect(source).toContain("outilsBoutonRef.current?.focus()");
    expect(source.match(/grid grid-cols-2/g)?.length).toBeGreaterThanOrEqual(2);
    expect(source.match(/"flex min-h-11 items-center rounded-lg px-3 text-sm font-medium"/g)).toHaveLength(2);
  });
});
