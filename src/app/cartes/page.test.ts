import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "page.tsx"), "utf8");

describe("liste des cartes", () => {
  it("charge 24 cartes et resserre le haut sur mobile", () => {
    expect(source).toContain("const PER_PAGE = 24");
    expect(source).toContain("py-5");
    expect(source).toContain("sm:py-8");
    expect(source).toContain("text-3xl");
    expect(source).toContain("sm:text-4xl");
  });
});
