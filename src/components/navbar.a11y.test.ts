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
});
