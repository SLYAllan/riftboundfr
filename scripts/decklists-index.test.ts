import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Entree = { file: string };

describe("decklists-index", () => {
  it("ne contient ni doublon ni chemin mort", () => {
    const index = JSON.parse(readFileSync("data/decklists-index.json", "utf8")) as Entree[];
    const fichiers = index.map((entree) => entree.file);

    expect(new Set(fichiers).size).toBe(fichiers.length);
    expect(fichiers.filter((fichier) => !existsSync(join("data/decklists", fichier)))).toEqual([]);
  });
});
