import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ZH } from "./i18n-zh";

// Les pages de l'overlay sont les seules que le chinois couvre en entier. Une
// phrase ajoutée là-bas sans sa traduction sortirait en français au milieu du
// chinois, sans erreur nulle part : ce test est le garde-fou.
const PAGES = [
  "src/app/profil/overlay/overlay-dashboard.tsx",
  "src/app/overlay/[token]/overlay-full.tsx",
  "src/app/compagnon/[token]/[cle]/compagnon.tsx",
];

function phrases(fichier: string): string[] {
  const source = readFileSync(fichier, "utf8");
  return [...source.matchAll(/\bt\(\s*"([^"]*)"/g)].map((m) => m[1]);
}

describe("dictionnaire chinois", () => {
  it("traduit toutes les phrases de l’overlay", () => {
    const manquantes = PAGES.flatMap(phrases).filter((phrase) => !ZH[phrase]);
    expect([...new Set(manquantes)]).toEqual([]);
  });
});
