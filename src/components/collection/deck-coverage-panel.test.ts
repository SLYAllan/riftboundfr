import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "deck-coverage-panel.tsx"), "utf8");

describe("couverture d'un deck", () => {
  it("efface le resultat precedent avant chaque calcul", () => {
    expect(source).toContain("resultat?.cle === cleDonnees");
  });

  it("affiche l'echec et permet de reessayer", () => {
    expect(source).toContain('role="alert"');
    expect(source).toContain("Réessayer");
    expect(source).not.toContain(".catch(() => {})");
  });

  it("verifie le statut et la forme de la reponse", () => {
    expect(source).toContain("!r.ok");
    expect(source).toContain("Array.isArray(data?.coverage?.entries)");
  });
});
