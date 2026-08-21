import { describe, it, expect } from "vitest";
import { creerSlugPartage } from "./partage-slug";

describe("creerSlugPartage", () => {
  it("rend 24 caractères hexadécimaux minuscules", () => {
    for (let i = 0; i < 20; i++) {
      expect(creerSlugPartage()).toMatch(/^[0-9a-f]{24}$/);
    }
  });

  it("est unique sur 100 appels", () => {
    const slug = new Set(Array.from({ length: 100 }, () => creerSlugPartage()));
    expect(slug.size).toBe(100);
  });
});
