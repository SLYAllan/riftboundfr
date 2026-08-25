import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/app/tier-list/tier-list-tabs.tsx", "utf8");

describe("infobulles de la tier-list", () => {
  it("montre le commentaire au survol et au focus clavier", () => {
    expect(source).toContain('role="tooltip"');
    expect(source).toContain("group-hover:visible");
    expect(source).toContain("group-focus-visible:visible");
    expect(source).toContain("aria-describedby=");
  });

  it("garde les onglets assez grands pour le tactile et visibles au focus", () => {
    expect(source).toContain("min-h-11");
    expect(source).toContain("focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane");
  });

  it("montre d'abord le commentaire au doigt avant de suivre le lien", () => {
    expect(source).toContain('window.matchMedia("(hover: none)").matches');
    expect(source).toContain("event.preventDefault()");
    expect(source).toContain("toucheEntry === entry.id");
  });
});
