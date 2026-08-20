import { describe, it, expect, beforeAll } from "vitest";
import { cleCompagnon, cleCompagnonValide } from "./overlay-compagnon";

beforeAll(() => {
  process.env.SESSION_SECRET = "secret-de-test-pour-le-compagnon";
});

describe("clé du lien compagnon", () => {
  it("rend la même clé pour le même jeton", () => {
    expect(cleCompagnon("abc123")).toBe(cleCompagnon("abc123"));
  });

  it("change avec le jeton : « Nouveau lien » tue l'ancien partage", () => {
    expect(cleCompagnon("abc123")).not.toBe(cleCompagnon("abc124"));
  });

  it("ne laisse pas deviner la clé depuis le jeton", () => {
    expect(cleCompagnon("abc123")).not.toContain("abc123");
    expect(cleCompagnon("abc123")).toHaveLength(32);
  });

  it("refuse une clé fausse, vide ou d'un autre jeton", () => {
    expect(cleCompagnonValide("abc123", cleCompagnon("abc123"))).toBe(true);
    expect(cleCompagnonValide("abc123", cleCompagnon("abc124"))).toBe(false);
    expect(cleCompagnonValide("abc123", "")).toBe(false);
    expect(cleCompagnonValide("abc123", null)).toBe(false);
    expect(cleCompagnonValide("abc123", "0".repeat(32))).toBe(false);
  });
});
