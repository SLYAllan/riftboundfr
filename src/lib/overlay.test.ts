import { describe, it, expect } from "vitest";
import { defaultOverlayState, clampPoints, applyStateUpdate, makeToken, typeReel } from "./overlay";

describe("overlay logic", () => {
  it("default state has two players, BO3, maxPoints 8, points 0", () => {
    const s = defaultOverlayState();
    expect(s.players).toHaveLength(2);
    expect(s.format).toBe("BO3");
    expect(s.maxPoints).toBe(8);
    expect(s.points).toEqual({ a: 0, b: 0 });
    expect(s.players[0].camBackground).toBe(false);
  });

  it("clampPoints bornes 0..max", () => {
    expect(clampPoints(-3, 8)).toBe(0);
    expect(clampPoints(12, 8)).toBe(8);
    expect(clampPoints(9, 9)).toBe(9);
    expect(clampPoints(4, 8)).toBe(4);
  });

  it("applyStateUpdate merge en profondeur et re-clampe les points sur maxPoints", () => {
    const base = defaultOverlayState();
    const next = applyStateUpdate(base, { maxPoints: 9, points: { a: 9, b: 0 }, players: [{ name: "Squirtle" }, {}] });
    expect(next.maxPoints).toBe(9);
    expect(next.points.a).toBe(9);
    expect(next.players[0].name).toBe("Squirtle");
    const back = applyStateUpdate(next, { maxPoints: 8 });
    expect(back.points.a).toBe(8);
  });

  // Le décor est un choix de l'état : un habillage sauvé AVANT ce champ n'en a pas,
  // et il doit rester celui d'origine plutôt que de perdre ses cadres en direct.
  it("le décor retombe sur « cams » quand il manque ou qu'il est faux", () => {
    const base = defaultOverlayState();
    expect(base.event.layout).toBe("cams");
    const ancien = applyStateUpdate({ ...base, event: { title: "", round: "" } }, {});
    expect(ancien.event.layout).toBe("cams");
    expect(applyStateUpdate(base, { event: { layout: "nocam" } }).event.layout).toBe("nocam");
    expect(applyStateUpdate(base, { event: { layout: "peu importe" } as never }).event.layout).toBe("cams");
  });

  // L'en-tête d'un envoi est écrit par celui qui envoie : un SVG annoncé « image/png »
  // ne doit pas entrer en base sous ce nom-là.
  it("typeReel lit le format dans les octets, pas dans ce qu'on lui annonce", () => {
    const oct = (...n: number[]) => new Uint8Array(n);
    expect(typeReel(oct(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(typeReel(oct(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(typeReel(oct(0x47, 0x49, 0x46, 0x38, 0x39, 0x61))).toBe("image/gif");
    expect(typeReel(oct(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50))).toBe("image/webp");
    // Un SVG, un fichier vide, un début de RIFF sans WEBP : rien de reconnu.
    expect(typeReel(new TextEncoder().encode("<svg xmlns=\"http://www.w3.org/2000/svg\">"))).toBeNull();
    expect(typeReel(oct())).toBeNull();
    expect(typeReel(oct(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x41, 0x56, 0x49, 0x20))).toBeNull();
  });

  it("makeToken génère un slug url-safe de 16+ chars, unique", () => {
    const a = makeToken();
    const b = makeToken();
    expect(a).toMatch(/^[a-z0-9]{16,}$/);
    expect(a).not.toBe(b);
  });

  // Reclic sur la carte à l'écran = cadre vidé. L'état porte -1, et il doit y rester :
  // un plancher à 0 le ramènerait sur la première carte, donc l'affiche ne partirait
  // jamais. Le décor par mode se garde aussi des deux côtés.
  it("garde un index à -1 (cadre vidé) et un décor par mode", () => {
    const base = defaultOverlayState();
    const apres = applyStateUpdate(base, { cards: { ...base.cards, index: [-1, 3] } });
    expect(apres.cards.index).toEqual([-1, 3]);
    // Plus bas que -1, on retombe à -1 : il n'y a rien de moins que « rien ».
    expect(applyStateUpdate(base, { cards: { ...base.cards, index: [-9, 0] } }).cards.index[0]).toBe(-1);

    const fonds = applyStateUpdate(base, { event: { backgroundUrl: "/a.png", backgroundNocamUrl: "/b.png" } });
    expect(fonds.event.backgroundUrl).toBe("/a.png");
    expect(fonds.event.backgroundNocamUrl).toBe("/b.png");
  });
});
