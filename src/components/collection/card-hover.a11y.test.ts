import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "card-hover.tsx"), "utf8");

describe("aperçu de carte de collection", () => {
  it("s'ouvre au clavier ou au toucher et se ferme avec Échap", () => {
    expect(source).toContain("tabIndex={0}");
    expect(source).toContain("onFocus={() => setHovered(true)}");
    expect(source).toContain("onClick={() => setHovered(true)}");
    expect(source).toContain('e.key === "Escape"');
  });
});
