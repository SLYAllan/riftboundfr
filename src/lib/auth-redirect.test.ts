import { describe, expect, it } from "vitest";
import { destinationConnexion } from "./auth-redirect";

describe("destinationConnexion", () => {
  it("accepte un chemin local", () => {
    expect(destinationConnexion("/profil/overlay")).toBe("/profil/overlay");
    expect(destinationConnexion("/en/profil/overlay?compact=1")).toBe("/en/profil/overlay?compact=1");
  });

  it("refuse les destinations externes ou ambiguës", () => {
    expect(destinationConnexion("https://evil.example/path")).toBe("/");
    expect(destinationConnexion("//evil.example/path")).toBe("/");
    expect(destinationConnexion("profil/overlay")).toBe("/");
    expect(destinationConnexion(null)).toBe("/");
  });
});
