import { describe, it, expect } from "vitest";
import { defaultOverlayState, clampPoints, applyStateUpdate, makeToken, typeReel, recalerMedias, echelleOverlay, secondesChrono } from "./overlay";

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

  // Tableau de bord et compagnon écrivent en même temps. Les deux patchs sont
  // appliqués en séquence sur la ligne verrouillée par `saveState` : chacun doit
  // garder son champ, là où deux écritures concurrentes s'écrasaient l'une l'autre.
  it("applyStateUpdate garde deux patchs sur des champs distincts", () => {
    const premier = applyStateUpdate(defaultOverlayState(), { points: { a: 1 } });
    const second = applyStateUpdate(premier, { points: { b: 2 } });
    expect(second.points.a).toBe(1);
    expect(second.points.b).toBe(2);
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

  // « Nouveau lien » change le jeton, et les images sont servies SOUS le jeton. Sans
  // recalage, leurs adresses pointaient dans le vide et l'habillage perdait son logo
  // et son décor sans rien dire.
  it("recalerMedias suit le jeton, et ne touche à rien d'autre", () => {
    const event = {
      ...defaultOverlayState().event,
      logoUrl: "/api/overlay/vieux/media/logo?v=1",
      backgroundUrl: "/api/overlay/vieux/media/background?v=2",
      backgroundNocamUrl: "https://exemple.test/decor.png",
    };
    const apres = recalerMedias(event, "vieux", "neuf");
    expect(apres.logoUrl).toBe("/api/overlay/neuf/media/logo?v=1");
    expect(apres.backgroundUrl).toBe("/api/overlay/neuf/media/background?v=2");
    // Une image hébergée ailleurs n'a rien à voir avec le jeton : on n'y touche pas.
    expect(apres.backgroundNocamUrl).toBe("https://exemple.test/decor.png");
  });

  // Une source OBS réglée ailleurs qu'à 1920x1080 laissait la toile ancrée en haut à
  // gauche : le décor débordait à droite et tout paraissait poussé de ce côté.
  it("echelleOverlay tient dans la source sans déformer", () => {
    expect(echelleOverlay(1920, 1080)).toBe(1);
    expect(echelleOverlay(1600, 900)).toBeCloseTo(0.8333, 4);
    // Source plus large que haute : c'est la hauteur qui borne, sinon on déborde en bas.
    expect(echelleOverlay(1920, 720)).toBeCloseTo(2 / 3, 4);
    // Source plus grande : on remplit, on ne laisse pas une toile perdue dans un coin.
    expect(echelleOverlay(3840, 2160)).toBe(2);
    // Une taille absurde ne doit pas faire disparaître l'habillage.
    expect(echelleOverlay(0, 0)).toBe(1);
  });
});

describe("secondesChrono", () => {
  const T0 = Date.parse("2026-08-21T12:00:00.000Z");
  const dans = (secondes: number) => new Date(T0 + secondes * 1000).toISOString();

  it("rend null sans chrono lancé", () => {
    expect(secondesChrono({}, T0)).toBeNull();
    expect(secondesChrono({ endsAt: null }, T0)).toBeNull();
  });

  it("décompte jusqu'à zéro et s'y arrête", () => {
    expect(secondesChrono({ endsAt: dans(90) }, T0)).toBe(90);
    expect(secondesChrono({ endsAt: dans(-40) }, T0)).toBe(0);
  });

  it("passe sous zéro quand le dépassement est demandé", () => {
    expect(secondesChrono({ endsAt: dans(-40), timerDepassement: true }, T0)).toBe(-40);
    // Lancé sur zéro : le chrono monte au lieu de descendre.
    expect(secondesChrono({ endsAt: dans(-125), timerDepassement: true }, T0)).toBe(-125);
  });

  it("laisse le chrono qui monte passer sous zéro", () => {
    // Lancé maintenant, il vaut zéro puis file en négatif : c'est l'affichage qui
    // en fait un temps écoulé, sans plus ni rouge.
    expect(secondesChrono({ endsAt: dans(0), timerMonte: true }, T0)).toBe(0);
    expect(secondesChrono({ endsAt: dans(-75), timerMonte: true }, T0)).toBe(-75);
    // Sans l'option, le même état resterait collé à zéro.
    expect(secondesChrono({ endsAt: dans(-75) }, T0)).toBe(0);
  });

  it("fige le temps en pause, dépassement compris", () => {
    expect(secondesChrono({ endsAt: dans(999), paused: 42 }, T0)).toBe(42);
    // Sans l'option, une pause prise en prolongation reste à zéro.
    expect(secondesChrono({ paused: -30 }, T0)).toBe(0);
    expect(secondesChrono({ paused: -30, timerDepassement: true }, T0)).toBe(-30);
  });
});
