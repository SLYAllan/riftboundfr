import { describe, expect, it } from "vitest";
import { normaliserLienCamera } from "./overlay-cam";

describe("normaliserLienCamera", () => {
  it("accepte VDO.Ninja en https, sous-domaines compris, et coupe le son", () => {
    expect(normaliserLienCamera("https://vdo.ninja/?view=abc")).toBe("https://vdo.ninja/?view=abc&muted=1");
    expect(normaliserLienCamera("https://backup.vdo.ninja/?view=abc")).toBe("https://backup.vdo.ninja/?view=abc&muted=1");
  });

  it("laisse le son tel quel si le lien le règle déjà", () => {
    expect(normaliserLienCamera("https://vdo.ninja/?view=abc&muted=0")).toBe("https://vdo.ninja/?view=abc&muted=0");
  });

  it("refuse tout ce qui pourrait exécuter du script", () => {
    expect(normaliserLienCamera("javascript:alert(document.cookie)")).toBeNull();
    expect(normaliserLienCamera("data:text/html,<script>alert(1)</script>")).toBeNull();
  });

  it("refuse un autre hôte, même s'il imite le nom", () => {
    expect(normaliserLienCamera("https://vdo.ninja.evil.com/?view=abc")).toBeNull();
    expect(normaliserLienCamera("https://notvdo.ninja/?view=abc")).toBeNull();
    expect(normaliserLienCamera("http://vdo.ninja/?view=abc")).toBeNull();
  });

  it("refuse le vide et le n'importe quoi", () => {
    expect(normaliserLienCamera(undefined)).toBeNull();
    expect(normaliserLienCamera("")).toBeNull();
    expect(normaliserLienCamera("pas une url")).toBeNull();
  });
});
