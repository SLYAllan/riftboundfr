import { describe, expect, it } from "vitest";
import { bilanDuBan, decksPasChers, dernierBanAnnonce, listesApresBan, type ListeClassee } from "./listes-classees";

function liste(p: Partial<ListeClassee>): ListeClassee {
  return {
    slug: "s", legende: "Ahri", joueur: null, placement: "1st", tournoi: "T", date: "2099-01-01",
    joueurs: 100, noms: ["Defy"], cartes: [{ riftboundId: "x", name: "Defy", quantity: 3 }], ...p,
  };
}

describe("dernierBanAnnonce", () => {
  it("rend les cartes du dernier ban et son jour d'effet", () => {
    const ban = dernierBanAnnonce();
    expect(ban.effet).toBe("2026-11-23");
    expect(ban.cartes).toContain("Riven, Broken Blade");
    expect(ban.cartes).not.toContain("Stacked Deck");
  });
});

describe("listesApresBan", () => {
  it("ne garde rien avant le jour d'effet, même un tournoi d'après le ban précédent", () => {
    const l = [liste({ tournoi: "octobre", date: "2026-10-20" })];
    expect(listesApresBan(l, "2026-11-23", "2026-11-19")).toEqual([]);
  });

  it("garde un tournoi joué après l'effet sans carte visée, écarte celui qui en joue une", () => {
    const propre = liste({ tournoi: "propre", date: "2026-11-28" });
    const enRetard = liste({ tournoi: "en retard", date: "2026-11-28", noms: ["Riven, Broken Blade"] });
    expect(listesApresBan([propre, enRetard], "2026-11-23", "2026-12-01")).toEqual([propre]);
  });
});

describe("bilanDuBan", () => {
  it("compte une liste une fois, même si la carte est au principal et en réserve", () => {
    const b = bilanDuBan(
      [
        liste({ legende: "Riven", noms: ["Star Spring", "Star Spring", "Defy"] }),
        liste({ legende: "Riven", noms: ["Defy"] }),
        liste({ legende: "Ahri" }),
      ],
      ["Star Spring"],
    );
    expect(b[0]).toEqual({ legende: "Riven", listes: 2, touchees: 1, carte: "Star Spring" });
    expect(b[1]).toEqual({ legende: "Ahri", listes: 1, touchees: 0, carte: null });
  });
});

describe("decksPasChers", () => {
  const prix = (total: number, sans = 0) => () => ({ total, exemplairesSansPrix: sans });

  it("garde la moins chère de chaque Légende, la moins chère d'abord", () => {
    const chere = liste({ slug: "chere", legende: "Ahri" });
    const bon = liste({ slug: "bon", legende: "Ahri", cartes: [] });
    const autre = liste({ slug: "autre", legende: "Vex", cartes: [] });
    const r = decksPasChers([chere, bon, autre], (c) => ({ total: c.length ? 200 : 50, exemplairesSansPrix: 0 }));
    expect(r.map((x) => x.liste.slug)).toEqual(["bon", "autre"]);
  });

  it("écarte une liste hors des 16 premiers, une liste à carte interdite et un prix incomplet", () => {
    expect(decksPasChers([liste({ placement: "17th" })], prix(10))).toEqual([]);
    expect(decksPasChers([liste({ noms: ["Zhonya's Hourglass"] })], prix(10))).toEqual([]);
    expect(decksPasChers([liste({})], prix(10, 2))).toEqual([]);
  });
});
