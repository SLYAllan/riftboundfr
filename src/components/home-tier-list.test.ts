import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const lire = () => readFileSync(new URL("./home-tier-list.tsx", import.meta.url), "utf8");

describe("fraîcheur de la tier list d'accueil", () => {
  it("reçoit et affiche la date de la liste active dans sa locale", () => {
    const source = lire();

    expect(source).toContain("updatedAt: Date;");
    expect(source).toContain("useLangue");
    expect(source).toContain('t("Mis à jour le")');
    expect(source).toContain("formatDate(active.updatedAt, etiquetteLocale(langue))");
  });
});
