import { readFileSync, readdirSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { BANNED_CARD_NAMES, cartesInterdites, isBanned } from "./banned-cards";
import { BAN_ENTRIES, interdictionsCitees, interdictionsParDate } from "./bans";

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
    // Les fiches qui citent une carte bannie.
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
    //
    // Vex s'y ajoute le 22 septembre : les fiches montrent maintenant leurs cartes
    // flex, et Stacked Deck est l'une des siennes (54 % des listes). Elle en
    // ressort le 30 septembre, avec les City Challenge chinoises du 26 et du 27 :
    // premières listes d'après le ban, Stacked Deck quitte ses cartes flex.
    //
    // Le 17 octobre, `fiches-stats` ne compte plus les cartes que sur les
    // tournois d'après le dernier ban (choix d'Allan) : onze fiches en sortent
    // d'un coup. Reste Jinx, Légende d'Origines dont la page tait les cartes.
    //
    // Le ban annoncé le 13 novembre 2026 (dix cartes, en vigueur le 23) en ajoute
    // trente-deux d'un coup : jusqu'au 23 les stats comptent encore les listes qui
    // jouent ces cartes (`scripts/apres-ban.ts`), et la page les marque « Bannie ».
    // Le premier `maj:stats` lancé à partir du 23 taira les cartes du set en cours :
    // la liste ci-dessous retombera, et c'est le moment de la raccourcir.
    const bannies = cartesDesFiches().filter((c) => isBanned(c.nom));
    const fiches = [...new Set(bannies.map((c) => c.fiche))].sort();
    expect(fiches).toEqual([
      "ahri-nine-tailed-fox.json",
      "akali-rogue-assassin.json",
      "ambessa-matriarch-of-war.json",
      "draven-glorious-executioner.json",
      "ekko-boy-who-shattered-time.json",
      "garen-might-of-demacia.json",
      "irelia-blade-dancer.json",
      "ivern-green-father.json",
      "jayce-defender-of-tomorrow.json",
      "jinx-loose-cannon.json",
      "kaisa-daughter-of-the-void.json",
      "kennen-heart-of-the-tempest.json",
      "khazix-voidreaver.json",
      "ksante-pride-of-nazumah.json",
      "leblanc-deceiver.json",
      "lee-sin-blind-monk.json",
      "leona-radiant-dawn.json",
      "lucian-purifier.json",
      "master-yi-wuju-bladesman.json",
      "master-yi-wuju-master.json",
      "miss-fortune-bounty-hunter.json",
      "nasus-curator-of-the-sands.json",
      "orianna-lady-of-clockwork.json",
      "poppy-keeper-of-the-hammer.json",
      "renekton-butcher-of-the-sands.json",
      "rengar-pridestalker.json",
      "riven-the-exile.json",
      "rumble-mechanized-menace.json",
      "shen-eye-of-twilight.json",
      "sivir-battle-mistress.json",
      "vex-gloomist.json",
      "vi-piltover-enforcer.json",
      "yasuo-unforgiven.json",
    ]);
  });

  it("retire le pourcentage du nom de terrain avant le contrôle", () => {
    expect(nomTerrain("Aspirant's Climb (100%)")).toBe("Aspirant's Climb");
    expect(isBanned(nomTerrain("Aspirant's Climb (100%)"))).toBe(true);
    expect(isBanned("Aspirant's Climb (100%)")).toBe(false);
  });
});

describe("listes qui jouent une carte interdite", () => {
  it("rend chaque carte interdite une fois, dans l'ordre de la liste", () => {
    // Principal puis réserve : la même carte revient deux fois dans une liste.
    expect(cartesInterdites(["Stacked Deck", "Ride the Wind", "Ekko, Recurrent", "Stacked Deck"])).toEqual([
      "Stacked Deck",
      "Ekko, Recurrent",
    ]);
    expect(cartesInterdites(["Ride the Wind"])).toEqual([]);
  });

  it("regroupe par date d'interdiction, la plus ancienne d'abord", () => {
    expect(interdictionsParDate(["Stacked Deck", "Called Shot", "Ekko, Recurrent"])).toEqual([
      { date: "31 mars 2026", cartes: ["Called Shot"], aVenir: false },
      { date: "18 septembre 2026", cartes: ["Ekko, Recurrent", "Stacked Deck"], aVenir: false },
    ]);
    expect(interdictionsParDate([])).toEqual([]);
  });

  // Annoncé le 13 novembre 2026, en vigueur le 23 : entre les deux, la page d'un
  // deck doit écrire « sera interdite le », pas « est interdite depuis le ».
  it("dit qu'une interdiction annoncée n'est pas encore en vigueur", () => {
    const liste = ["Stacked Deck", "Star Spring"];
    expect(interdictionsParDate(liste, "2026-11-22").map((g) => g.aVenir)).toEqual([false, true]);
    expect(interdictionsParDate(liste, "2026-11-23").map((g) => g.aVenir)).toEqual([false, false]);
  });

  it("retrouve les cartes interdites qu'un texte nomme, apostrophe courbe comprise", () => {
    const texte = "**[[Zhonya’s Hourglass]]** sauve une unité, **[[Defy]]** contre le sort. Dazzling Aurora ferme la partie.";
    expect(interdictionsCitees(texte, "2026-11-30")).toEqual([
      { date: "23 novembre 2026", cartes: ["Zhonya's Hourglass", "Dazzling Aurora"], aVenir: false },
    ]);
    expect(interdictionsCitees("**[[Defy]]** contre le sort.")).toEqual([]);
  });

  // La pastille lit `isBanned`, l'encadré de la page deck lit `BAN_ENTRIES` pour
  // la date. Une carte ajoutée d'un seul côté donnerait une pastille sans date,
  // ou une date sans pastille.
  it("tient les deux listes de cartes interdites d'accord", () => {
    expect(new Set(BAN_ENTRIES.map((b) => b.en))).toEqual(BANNED_CARD_NAMES);
  });
});
