import { beforeEach, describe, expect, it, vi } from "vitest";
import { creerJetonAdmin, creerJetonMembre, jetonAdminValide, membreDuJeton } from "./jeton-signe";

const JOUR = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 9, 31, 12);

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "secret-de-test");
});

describe("session admin", () => {
  it("accepte un jeton admin frais", () => {
    expect(jetonAdminValide(creerJetonAdmin(T0), T0 + 1000)).toBe(true);
  });

  it("refuse la session d'un membre posée dans le cookie admin", () => {
    // La faille du 31 octobre : même secret, même format, aucun préfixe vérifié.
    expect(jetonAdminValide(creerJetonMembre("cmvwlqbu50000vscg0trg5y6d", T0), T0 + 1000)).toBe(false);
  });

  it("refuse un jeton dont la signature a changé d'un caractère", () => {
    const jeton = creerJetonAdmin(T0);
    const dernier = jeton.at(-1) === "0" ? "1" : "0";
    expect(jetonAdminValide(jeton.slice(0, -1) + dernier, T0 + 1000)).toBe(false);
  });

  it("refuse sans lever une signature d'une autre longueur", () => {
    expect(jetonAdminValide(`${creerJetonAdmin(T0)}00`, T0 + 1000)).toBe(false);
    expect(jetonAdminValide("admin:1:2", T0)).toBe(false);
  });

  it("expire au bout de 7 jours, comme le cookie", () => {
    const jeton = creerJetonAdmin(T0);
    expect(jetonAdminValide(jeton, T0 + 6 * JOUR)).toBe(true);
    expect(jetonAdminValide(jeton, T0 + 8 * JOUR)).toBe(false);
  });

  it("refuse un jeton daté dans le futur", () => {
    expect(jetonAdminValide(creerJetonAdmin(T0 + 10 * JOUR), T0)).toBe(false);
  });

  it("refuse un jeton signé avec un autre secret", () => {
    const jeton = creerJetonAdmin(T0);
    vi.stubEnv("SESSION_SECRET", "un-autre-secret");
    expect(jetonAdminValide(jeton, T0 + 1000)).toBe(false);
  });
});

describe("session membre", () => {
  it("rend l'identifiant du membre", () => {
    expect(membreDuJeton(creerJetonMembre("cmvwlqbu50000vscg0trg5y6d", T0), T0 + 1000)).toBe("cmvwlqbu50000vscg0trg5y6d");
  });

  it("n'ouvre pas de session membre avec un jeton admin", () => {
    expect(membreDuJeton(creerJetonAdmin(T0), T0 + 1000)).toBeNull();
  });

  it("expire au bout de 30 jours", () => {
    const jeton = creerJetonMembre("cmvwlqbu50000vscg0trg5y6d", T0);
    expect(membreDuJeton(jeton, T0 + 29 * JOUR)).not.toBeNull();
    expect(membreDuJeton(jeton, T0 + 31 * JOUR)).toBeNull();
  });

  it("lève si le secret manque, sans repli", () => {
    vi.stubEnv("SESSION_SECRET", "");
    expect(() => creerJetonMembre("x", T0)).toThrow("SESSION_SECRET");
  });
});
