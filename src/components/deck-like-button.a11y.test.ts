import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "deck-like-button.tsx"), "utf8");

describe("noms accessibles du bouton J'aime", () => {
  it("donne un nom explicite au bouton compact", () => {
    // La pastille compacte n'affiche que le cœur et le compteur : sans
    // aria-label, un lecteur d'écran annonce « 12 », pas l'action.
    expect(source).toContain("aria-label={title}");
  });

  it("expose l'état pressé du bouton", () => {
    expect(source).toContain("aria-pressed={liked === true}");
  });
});
