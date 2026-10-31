import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIp, rateLimit } from "./rate-limit";

const requete = (entetes: Record<string, string>) =>
  new Request("https://riftboundfrance.fr/api/comments", { method: "POST", headers: entetes });

// Ce que Traefik transmet à la maison : x-real-ip vaut l'adresse de cloudflared,
// la même pour tous les visiteurs.
const CLOUDFLARED = "172.18.0.5";

afterEach(() => vi.unstubAllEnvs());

describe("clientIp", () => {
  it("ignore cf-connecting-ip hors de la maison, où le visiteur l'écrit lui-même", () => {
    expect(clientIp(requete({ "cf-connecting-ip": "203.0.113.7", "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
  });

  it("lit cf-connecting-ip avant x-real-ip derrière le tunnel Cloudflare", () => {
    vi.stubEnv("DERRIERE_CLOUDFLARE", "1");
    expect(clientIp(requete({ "cf-connecting-ip": "203.0.113.7", "x-real-ip": CLOUDFLARED }))).toBe("203.0.113.7");
  });

  it("garde x-real-ip quand l'en-tête de Cloudflare manque", () => {
    vi.stubEnv("DERRIERE_CLOUDFLARE", "1");
    expect(clientIp(requete({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
  });

  it("retombe sur le dernier élément de x-forwarded-for, jamais le premier", () => {
    expect(clientIp(requete({ "x-forwarded-for": "6.6.6.6, 198.51.100.2" }))).toBe("198.51.100.2");
  });
});

describe("rateLimit derrière le tunnel", () => {
  it("ne fait pas payer à un visiteur les essais d'un autre", () => {
    vi.stubEnv("DERRIERE_CLOUDFLARE", "1");
    const opts = { bucket: "essai-tunnel", limit: 5 };
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(requete({ "cf-connecting-ip": "203.0.113.7", "x-real-ip": CLOUDFLARED }), opts)).toBe(true);
    }
    expect(rateLimit(requete({ "cf-connecting-ip": "203.0.113.7", "x-real-ip": CLOUDFLARED }), opts)).toBe(false);
    expect(rateLimit(requete({ "cf-connecting-ip": "203.0.113.8", "x-real-ip": CLOUDFLARED }), opts)).toBe(true);
  });
});
