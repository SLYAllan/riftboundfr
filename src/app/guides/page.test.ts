import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

describe("liste des guides", () => {
  it("indique par quel guide commencer", () => {
    expect(source).toContain('guide.href === "/guides/debuter"');
    expect(source).toContain('{t("Commencer ici")}');
  });

  it("ouvre la page méta depuis le guide dédié", () => {
    expect(source).toContain('href: "/meta"');
    expect(source).not.toContain('href: "/guides/meta"');
  });
});
