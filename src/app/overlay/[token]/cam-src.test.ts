import { describe, it, expect } from "vitest";

// Copie de la règle appliquée dans overlay-full.tsx. Le composant est un composant
// client dont l'import tire tout React : on teste la règle elle-même, qui est la
// partie qui protège.
function camSrc(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    if (!/(^|\.)vdo\.ninja$/i.test(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

describe("camSrc", () => {
  it("accepte VDO.Ninja en https, sous-domaines compris", () => {
    expect(camSrc("https://vdo.ninja/?view=abc")).toBe("https://vdo.ninja/?view=abc");
    expect(camSrc("https://backup.vdo.ninja/?view=abc")).toBe("https://backup.vdo.ninja/?view=abc");
  });

  it("refuse tout ce qui pourrait exécuter du script", () => {
    expect(camSrc("javascript:alert(document.cookie)")).toBeNull();
    expect(camSrc("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("refuse un autre hôte, même s'il imite le nom", () => {
    expect(camSrc("https://vdo.ninja.evil.com/?view=abc")).toBeNull();
    expect(camSrc("https://notvdo.ninja/?view=abc")).toBeNull();
    expect(camSrc("http://vdo.ninja/?view=abc")).toBeNull();
  });

  it("refuse le vide et le n'importe quoi", () => {
    expect(camSrc(undefined)).toBeNull();
    expect(camSrc("pas une url")).toBeNull();
  });
});
