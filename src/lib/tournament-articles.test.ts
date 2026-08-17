import { describe, it, expect } from "vitest";
import { articleDuTournoi } from "./tournament-articles";

const article = (lieu: string | null, date: string | null) => ({
  tournamentLocation: lieu,
  tournamentDate: date ? new Date(date) : null,
});

describe("articleDuTournoi", () => {
  it("rattache l'article au tournoi de la même ville et du même jour", () => {
    expect(articleDuTournoi(article("Tianjin, Chine", "2026-06-07"), "Tianjin", new Date("2026-06-07"))).toBe(true);
  });

  it("refuse un autre tournoi de la même ville", () => {
    // Le cas qui a cassé : le Regional Open du 7 juin sur la page du City
    // Challenge du 16 août, avec sa date et ses 640 joueurs.
    expect(articleDuTournoi(article("Tianjin, Chine", "2026-06-07"), "Tianjin", new Date("2026-08-16"))).toBe(false);
  });

  it("tolère un jour d'écart, un tournoi peut tenir sur deux jours", () => {
    expect(articleDuTournoi(article("Utrecht, Pays-Bas", "2026-06-14"), "Utrecht", new Date("2026-06-13"))).toBe(true);
  });

  it("garde un article sans date, rattaché à sa ville", () => {
    expect(articleDuTournoi(article("Hartford, CT, USA", null), "Hartford", new Date("2026-06-20"))).toBe(true);
  });

  it("refuse une autre ville", () => {
    expect(articleDuTournoi(article("Lille, France", "2026-04-18"), "Tianjin", new Date("2026-04-18"))).toBe(false);
  });

  it("refuse un article sans lieu", () => {
    expect(articleDuTournoi(article(null, "2026-04-18"), "Lille", new Date("2026-04-18"))).toBe(false);
  });
});
