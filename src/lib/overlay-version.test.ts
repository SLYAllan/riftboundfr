import { describe, expect, it } from "vitest";
import { avantBascule, BASCULE_OVERLAY, decorDuNouveauGabarit, versionOverlay } from "./overlay-version";

describe("versionOverlay", () => {
  it("garde l'ancienne version jusqu'à la dernière seconde de novembre, heure de Paris", () => {
    expect(versionOverlay(undefined, Date.parse("2026-11-15T12:00:00+01:00"))).toBe(1);
    expect(versionOverlay(undefined, Date.parse("2026-11-30T23:59:59+01:00"))).toBe(1);
  });

  it("passe à la nouvelle le 1er décembre à minuit, sans qu'on change de lien", () => {
    expect(versionOverlay(undefined, Date.parse("2026-12-01T00:00:00+01:00"))).toBe(2);
    // 23 h en temps universel la veille, c'est déjà minuit à Paris.
    expect(versionOverlay(undefined, Date.parse("2026-11-30T23:00:00Z"))).toBe(2);
  });

  it("montre la version demandée, avant comme après", () => {
    expect(versionOverlay("2", BASCULE_OVERLAY - 1)).toBe(2);
    expect(versionOverlay("1", BASCULE_OVERLAY + 1)).toBe(1);
    expect(versionOverlay("3", BASCULE_OVERLAY - 1)).toBe(1);
  });
});

describe("avantBascule", () => {
  it("s'arrête à la bascule", () => {
    expect(avantBascule(BASCULE_OVERLAY - 1)).toBe(true);
    expect(avantBascule(BASCULE_OVERLAY)).toBe(false);
  });
});

describe("decorDuNouveauGabarit", () => {
  it("écarte un décor envoyé avant la bascule : il part de l'ancien gabarit", () => {
    expect(decorDuNouveauGabarit(`/api/overlay/abc/media/background?v=${BASCULE_OVERLAY - 1}`)).toBe(false);
  });

  it("garde un décor envoyé depuis", () => {
    expect(decorDuNouveauGabarit(`/api/overlay/abc/media/background?v=${BASCULE_OVERLAY}`)).toBe(true);
  });

  it("écarte une adresse sans date d'envoi", () => {
    expect(decorDuNouveauGabarit("https://exemple.fr/decor.png")).toBe(false);
    expect(decorDuNouveauGabarit("/api/overlay/abc/media/background?v=abc")).toBe(false);
  });
});
