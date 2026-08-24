import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "binder-explorer.tsx"), "utf8");

describe("accessibilité de l'explorateur de classeur", () => {
  it("garde la recherche visible sans ouvrir les filtres", () => {
    expect(source).not.toContain('<details className="group mt-4');
    expect(source).toContain('type="search"');
  });

  it("nomme les boutons de quantité + et −", () => {
    // Les boutons « + » et « − » n'ont que leur symbole comme contenu :
    // un lecteur d'écran annonce « plus », pas ce que fait l'action.
    expect(source).toContain('aria-label={t("Ajouter une copie")}');
    expect(source).toContain('aria-label={t("Retirer une copie")}');
  });

  it("nomme les boutons de pagination", () => {
    expect(source).toContain('aria-label={t("Page précédente")}');
    expect(source).toContain('aria-label={t("Page suivante")}');
  });

  it("expose l'état des filtres à boutons", () => {
    expect(source).toContain('aria-pressed={owned === v}');
    expect(source).toContain('aria-pressed={active}');
  });

  it("affiche les erreurs de partage", () => {
    expect(source).toContain('role="alert"');
    expect(source).toContain("Le partage n’a pas pu être modifié");
  });
});
