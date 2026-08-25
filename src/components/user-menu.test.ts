import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/user-menu.tsx", "utf8");

describe("menu utilisateur", () => {
  it("refuse les réponses de session invalides et permet de réessayer", () => {
    expect(source).toMatch(/if \(!r\.ok\) throw/);
    expect(source).toMatch(/data !== null/);
    expect(source).toMatch(/typeof data\.username !== "string"/);
    expect(source).toMatch(/role="alert"/);
    expect(source).toMatch(/Réessayer/);
  });

  it("ne masque le compte qu'après une déconnexion réussie", () => {
    expect(source).toMatch(/if \(!r\.ok\) throw/);
    expect(source).toMatch(/setUser\(null\)/);
    expect(source).toMatch(/disabled=\{logoutLoading\}/);
  });

  it("rend le focus au déclencheur après Échap", () => {
    expect(source).toMatch(/triggerRef\.current\?\.focus\(\)/);
  });
});
