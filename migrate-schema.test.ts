import { describe, expect, it } from "vitest";
import { TABLES_ATTENDUES, tablesManquantes } from "./migrate-schema.mjs";

describe("contrôle du schéma au démarrage", () => {
  it("attend aussi la table qui porte les abonnements de la cloche", () => {
    expect(TABLES_ATTENDUES).toHaveLength(19);
    expect(tablesManquantes(TABLES_ATTENDUES.filter((table) => table !== "Abonnement"))).toEqual(["Abonnement"]);
    expect(TABLES_ATTENDUES).not.toContain("WishlistItem");
  });

  it("signale toutes les tables d'une base existante vide de schéma", () => {
    expect(tablesManquantes([])).toEqual(TABLES_ATTENDUES);
  });

  it("accepte le schéma attendu et repère une table manquante", () => {
    expect(tablesManquantes(TABLES_ATTENDUES)).toEqual([]);
    expect(tablesManquantes(TABLES_ATTENDUES.filter((table) => table !== "Binder"))).toEqual([
      "Binder",
    ]);
  });
});
