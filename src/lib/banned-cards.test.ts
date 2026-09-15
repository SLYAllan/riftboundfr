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
    // Ces deux fiches conseillent une carte bannie (relevé du 15 septembre 2026).
    // Le badge « Bannie » de CardTile repose sur cette correspondance exacte :
    // si un nom change d'un côté sans l'autre, le badge disparaît en silence.
    //
    // Elles étaient quatre le 23 août. `fiches-maj` a recalculé les cartes clés
    // d'Annie sur les decklists Vendetta réelles, et la carte bannie a disparu
    // d'elle-même. Volibear a suivi le 15 septembre : `parse-hexgate` rattache
    // enfin sa Légende, il passe les dix listes et sa fiche est recalculée. Les
    // deux qui restent sont des Légendes d'Origines désertées depuis la rotation
    // des Best-Of : moins de dix listes chacune dans le format, donc le script
    // les laisse telles quelles et leurs cartes datent.
    //
    // Le ban de Stacked Deck (18 septembre) en ajoute onze d'un coup : les fiches
    // sont calculées sur des listes jouées avant le ban. Elles retomberont quand
    // `maj:stats` tournera sur des listes d'après le 18.
    const bannies = cartesDesFiches().filter((c) => isBanned(c.nom));
    const fiches = [...new Set(bannies.map((c) => c.fiche))].sort();
    expect(fiches).toEqual([
      "annie-dark-child.json",
      "diana-scorn-of-the-moon.json",
      "draven-glorious-executioner.json",
      "ezreal-prodigal-explorer.json",
      "irelia-blade-dancer.json",
      "jinx-loose-cannon.json",
      "kennen-heart-of-the-tempest.json",
      "khazix-voidreaver.json",
      "mel-souls-reflection.json",
      "pyke-bloodharbor-ripper.json",
      "sivir-battle-mistress.json",
      "yasuo-unforgiven.json",
      "zed-master-of-shadows.json",
    ]);
  });

  it("retire le pourcentage du nom de terrain avant le contrôle", () => {
    expect(nomTerrain("Aspirant's Climb (100%)")).toBe("Aspirant's Climb");
    expect(isBanned(nomTerrain("Aspirant's Climb (100%)"))).toBe(true);
    expect(isBanned("Aspirant's Climb (100%)")).toBe(false);
  });
});
