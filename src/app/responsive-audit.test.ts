import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const lire = (chemin: string) => readFileSync(new URL(chemin, import.meta.url), "utf8");

describe("correctifs de l’audit responsive", () => {
  it("garde les actions isolées assez hautes pour le toucher", () => {
    expect(lire("./page.tsx")).toContain("min-h-11 sm:min-h-6");
    expect(lire("../components/home-tier-list.tsx")).toContain("min-h-11 sm:min-h-6");
    expect(lire("../components/card-filters.tsx")).toMatch(/onClick=\{effacerTout\}[\s\S]{0,120}min-h-11/);
    expect(lire("../components/breadcrumbs.tsx")).toContain("inline-flex min-h-6 items-center");
  });

  it("laisse les domaines du deckbuilder revenir à la ligne", () => {
    expect(lire("./deckbuilder/components/card-browser.tsx")).toContain(
      'className="flex flex-wrap items-center gap-1.5"',
    );
  });

  it("donne 44 px aux contrôles compacts du deckbuilder", () => {
    expect(lire("./deckbuilder/components/import-modal.tsx")).toMatch(/aria-label=\{t\("Fermer"\)\}[\s\S]{0,100}min-h-11/);
    expect(lire("./deckbuilder/components/deck-stats.tsx")).toContain("min-h-11");
  });
});
