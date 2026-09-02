import { describe, expect, it } from "vitest";
import { adopterEtatDistant, defaultOverlayState, type OverlayStateData } from "./overlay";

function etat(modif: (e: OverlayStateData) => void): OverlayStateData {
  const e = defaultOverlayState();
  modif(e);
  return e;
}

describe("adopterEtatDistant", () => {
  it("reprend le score et les manches du compagnon", () => {
    const local = etat((e) => { e.points = { a: 0, b: 0 }; });
    const distant = etat((e) => { e.points = { a: 2, b: 1 }; e.players[0].gamesWon = 1; });
    const r = adopterEtatDistant(local, distant);
    expect(r.points).toEqual({ a: 2, b: 1 });
    expect(r.players[0].gamesWon).toBe(1);
  });

  it("laisse au tableau de bord ce que le compagnon ne touche pas", () => {
    // Le titre, le chrono et le décor sont pilotés depuis le tableau de bord
    // seul : les écraser ferait revenir en arrière un réglage en cours.
    const local = etat((e) => { e.event.title = "Locale de Lyon"; e.event.round = "Ronde 4"; });
    const distant = etat((e) => { e.event.title = "vieux titre"; e.event.round = ""; });
    const r = adopterEtatDistant(local, distant);
    expect(r.event.title).toBe("Locale de Lyon");
    expect(r.event.round).toBe("Ronde 4");
  });

  it("garde le lien de caméra local, que le compagnon ne peut pas poser", () => {
    const local = etat((e) => { e.players[0].camUrl = "https://vdo.ninja/?view=moi"; });
    const distant = etat((e) => { e.players[0].camUrl = ""; });
    expect(adopterEtatDistant(local, distant).players[0].camUrl).toBe("https://vdo.ninja/?view=moi");
  });

  it("ne mélange pas les deux joueurs", () => {
    const local = defaultOverlayState();
    const distant = etat((e) => { e.players[1].name = "Allan"; e.players[1].gamesWon = 2; });
    const r = adopterEtatDistant(local, distant);
    expect(r.players[1]).toMatchObject({ name: "Allan", gamesWon: 2 });
    expect(r.players[0].name).toBe("Joueur 1");
  });
});
