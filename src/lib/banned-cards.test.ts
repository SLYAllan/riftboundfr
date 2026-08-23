import { readFileSync, readdirSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { isBanned } from "./banned-cards";

// Même découpage que `nomTerrain` dans legendes/[slug]/page.tsx : les terrains
// sont stockés « Aspirant's Climb (100%) ».
const nomTerrain = (bf: string) => bf.replace(/\s*\(\s*[\d.,]+\s*%?\s*\)\s*$/, "").trim();

const dossier = path.join(process.cwd(), "data", "fiches");

function cartesDesFiches() {
  const trouvees: { fiche: string; nom: string }[] = [];
  for (const f of readdirSync(dossier).filter((f) => f.endsWith(".json"))) {
    const d = JSON.parse(readFileSync(path.join(dossier, f), "utf-8"));
    for (const kc of d.keyCards ?? []) if (kc?.name) trouvees.push({ fiche: f, nom: kc.name });
    for (const bf of d.topBattlefields ?? []) trouvees.push({ fiche: f, nom: nomTerrain(String(bf)) });
  }
  return trouvees;
}

describe("cartes bannies dans les fiches Légendes", () => {
  it("reconnaît les noms tels qu'ils sont écrits dans les fiches", () => {
    // Ces quatre fiches conseillent une carte bannie (relevé du 23 août 2026).
    // Le badge « Bannie » de CardTile repose sur cette correspondance exacte :
    // si un nom change d'un côté sans l'autre, le badge disparaît en silence.
    const bannies = cartesDesFiches().filter((c) => isBanned(c.nom));
    const fiches = [...new Set(bannies.map((c) => c.fiche))].sort();
    expect(fiches).toEqual([
      "annie-dark-child.json",
      "jinx-loose-cannon.json",
      "volibear-relentless-storm.json",
      "yasuo-unforgiven.json",
    ]);
  });

  it("retire le pourcentage du nom de terrain avant le contrôle", () => {
    expect(nomTerrain("Aspirant's Climb (100%)")).toBe("Aspirant's Climb");
    expect(isBanned(nomTerrain("Aspirant's Climb (100%)"))).toBe(true);
    expect(isBanned("Aspirant's Climb (100%)")).toBe(false);
  });
});
