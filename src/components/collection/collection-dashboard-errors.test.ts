import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync(resolve(__dirname, "collection-dashboard.tsx"), "utf8");
const importPiltover = readFileSync(resolve(__dirname, "import-piltover.tsx"), "utf8");

describe("erreurs du tableau de bord de collection", () => {
  it("affiche les erreurs des actions sur les classeurs", () => {
    expect(dashboard).toContain('role="alert"');
    expect(dashboard).toContain("Impossible de créer le classeur");
    expect(dashboard).toContain("Impossible de renommer le classeur");
    expect(dashboard).toContain("Impossible de modifier le partage");
    expect(dashboard).toContain("Impossible de supprimer le classeur");
  });

  it("ne signale la copie du lien qu'après une vraie copie", () => {
    expect(dashboard).not.toContain("navigator.clipboard?.writeText");
    expect(dashboard).not.toContain(".catch(() => {})");
  });

  it("garde les formulaires et le dialogue ouverts après un échec", () => {
    expect(dashboard).toContain("const success = await onRename(name)");
    expect(dashboard).toContain("if (success) setEditing(false)");
    expect(dashboard).toContain("if (res.ok)");
    expect(dashboard).not.toContain("setPendingDelete(null);\n    }");
  });

  it("garde le menu des classeurs facile à toucher", () => {
    expect(dashboard).toMatch(/h-11 w-11[^"]*sm:h-9 sm:w-9/);
    expect(dashboard).toContain("min-h-11");
  });
});

describe("rapport d'import Piltover", () => {
  it("reste affiché jusqu'à une actualisation demandée", () => {
    expect(importPiltover).not.toContain("setTimeout");
    expect(importPiltover).toContain("router.refresh()");
  });
});
