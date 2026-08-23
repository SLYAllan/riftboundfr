import { describe, expect, it } from "vitest";
import { dateAnalyseFiche } from "./fiche-date";

const reel =
  "Decklists de tournoi en base : 34 listes, 14 tournois. Relevé du 17 août 2026, calcul par scripts/fiches-stats.mts.";

describe("dateAnalyseFiche", () => {
  it("lit la date au milieu du texte réel d'une fiche", () => {
    expect(dateAnalyseFiche(reel)?.toISOString().slice(0, 10)).toBe("2026-08-17");
  });

  it("accepte « 1er » et les mois accentués", () => {
    expect(dateAnalyseFiche("Relevé du 1er février 2026")?.toISOString().slice(0, 10)).toBe("2026-02-01");
    expect(dateAnalyseFiche("Relevé du 9 décembre 2025")?.toISOString().slice(0, 10)).toBe("2025-12-09");
  });

  it("renvoie null plutôt que d'inventer une date", () => {
    // Les 14 fiches sans dataSource, et les 3 qui pointent meta-analysis.json.
    expect(dateAnalyseFiche(undefined)).toBeNull();
    expect(dateAnalyseFiche(null)).toBeNull();
    expect(dateAnalyseFiche("meta-analysis.json — 25 decklists (Xi'an + Atlanta + Sydney)")).toBeNull();
    expect(dateAnalyseFiche("Relevé du 40 brumaire 2026")).toBeNull();
  });
});
