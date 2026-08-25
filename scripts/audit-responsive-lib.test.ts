import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { extraireCheminsSitemap, interactionAutorisee } from "./audit-responsive-lib.mjs";

describe("audit responsive", () => {
  it("inclut le contrôle mobile 320 x 568", () => {
    const script = readFileSync(new URL("./audit-responsive.mjs", import.meta.url), "utf8");

    expect(script).toMatch(/nom: "mobile-320x568", width: 320, height: 568, mobile: true/);
  });

  it("extrait et dédouble les chemins internes du sitemap", () => {
    const xml = `
      <urlset>
        <url><loc>http://localhost:3001/cartes</loc></url>
        <url><loc>http://localhost:3001/cartes</loc></url>
        <url><loc>https://example.com/dehors</loc></url>
        <url><loc>http://localhost:3001/decks/annie</loc></url>
      </urlset>`;

    expect(extraireCheminsSitemap(xml, "http://localhost:3001")).toEqual([
      "/cartes",
      "/decks/annie",
    ]);
  });

  it("refuse les actions qui peuvent modifier des données", () => {
    expect(interactionAutorisee("Ouvrir le menu")).toBe(true);
    expect(interactionAutorisee("Afficher toutes les decklists")).toBe(true);
    expect(interactionAutorisee("Supprimer le deck")).toBe(false);
    expect(interactionAutorisee("Lancer la partie")).toBe(false);
    expect(interactionAutorisee("Publier le deck")).toBe(false);
  });
});
