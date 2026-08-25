import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("ordre des sets de la collection", () => {
  it("place Vendetta en premier", () => {
    expect(source).toContain('const SET_ORDER = ["VEN", "OGN"');
  });
});
