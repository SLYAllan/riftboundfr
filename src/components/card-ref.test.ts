import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "card-ref.tsx"), "utf8");

describe("chargement de l'aperçu d'une carte", () => {
  it("ne met en cache que les absences confirmées", () => {
    expect(source).toContain("r.status === 404");
    expect(source).toContain("fetched.current = false");
    expect(source).not.toContain(".catch(() => {})");
  });
});
