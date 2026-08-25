import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "deckbuilder.tsx"), "utf8");

describe("mise en page du deckbuilder", () => {
  it("retire la hauteur réelle de la barre de navigation", () => {
    expect(source).toContain("h-[calc(100dvh-69px)]");
  });
});
