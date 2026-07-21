import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TierEntry {
  legendName: string;
  tier: string;
  comment?: string;
}

// Recalculé sur 6799 decks classés Origins (Shanghai NO + Beijing/Guangzhou/Chongqing/Hangzhou RO + City Challenges)
const originsTier: TierEntry[] = [
  { legendName: "Kai'Sa, Daughter of the Void", tier: "S", comment: "27,6% du field (1876 decks), 83 top 8, 10 victoires. Reine d'Origins" },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "23% (1561 decks), 61 top 8, 6 wins. Hold +2 Might" },
  { legendName: "Viktor, Herald of the Arcane", tier: "A", comment: "11,5% (781 decks), 24 top 8, 2 wins. Control Mind/Order" },
  { legendName: "Sett, The Boss", tier: "A", comment: "5,4% (366 decks), 10 top 8, 4 wins. Meilleure conversion" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "3,4% (233 decks), 10 top 8, 1 win. Counter méta" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "B", comment: "5,6% (378 decks), 6 top 8. Aurora Body/Chaos" },
  { legendName: "Teemo, Swift Scout", tier: "B", comment: "5,4% (370 decks), 11 top 8, 1 win. Tempo-disrupt" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "B", comment: "4,5% (305 decks), 7 top 8. Value Calm/Mind" },
  { legendName: "Darius, Hand of Noxus", tier: "B", comment: "2,6% (176 decks), 9 top 8. Aggro Body/Fury" },
  { legendName: "Yasuo, Unforgiven", tier: "C", comment: "2,4% (161 decks), 2 top 8, 1 win" },
  { legendName: "Jinx, Loose Cannon", tier: "C", comment: "2,2% (149 decks), 3 top 8, 1 win. Aggro Chaos/Fury" },
  { legendName: "Lee Sin, Blind Monk", tier: "C", comment: "2,1% (140 decks), 3 top 8. Tempo Body/Calm" },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "1,3% (87 decks), 1 top 8. Ramp midrange" },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "1,6% (112 decks), 0 top 8" },
  { legendName: "Lux, Lady of Luminosity", tier: "D", comment: "1% (69 decks), 0 top 8. Control Mind/Order" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "0,5% (35 decks), 0 top 8. Aurora ramp" },
];

const spiritforgedTier: TierEntry[] = [
  { legendName: "Draven, Glorious Executioner", tier: "S", comment: "21% du field (1539 decks), 88 top 8, 15 victoires. Roi incontesté du Spiritforged" },
  { legendName: "Irelia, Blade Dancer", tier: "A", comment: "12% (876 decks), 45 top 8, 3 wins. Tempo dominant" },
  { legendName: "Kai'Sa, Daughter of the Void", tier: "A", comment: "12% (865 decks), 29 top 8, 4 wins. Reste T1 Fury/Mind" },
  { legendName: "Viktor, Herald of the Arcane", tier: "A", comment: "6% (445 decks), 21 top 8, 2 wins. Forte conversion Mind/Order" },
  { legendName: "Annie, Dark Child", tier: "B", comment: "Seulement 2,2% (164) mais 8 top 8 + 2 wins — meilleure conversion du set" },
  { legendName: "Fiora, Grand Duelist", tier: "B", comment: "5,2% (378 decks), 9 top 8, 1 win. Midrange Body/Order" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "B", comment: "4,6% (333 decks), 9 top 8, 1 win (Bologna)" },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "3,5% (258 decks), won Lille 14-0-2. Equipment tokens" },
  { legendName: "Rek'Sai, Void Burrower", tier: "B", comment: "2,4% (175 decks), 5 top 8, 1 win. Aggro tunneler" },
  { legendName: "Master Yi, Wuju Bladesman", tier: "B", comment: "3,3% (244 decks), ~7 top 8. Hold Body/Calm (seul Yi légal à Spiritforged)" },
  { legendName: "Sivir, Battle Mistress", tier: "C", comment: "2,5% (180 decks), 2 top 8. Aurora ramp" },
  { legendName: "Lucian, Purifier", tier: "C", comment: "2,5% (183 decks), 1 top 8. Populaire mais sous-performe" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "C", comment: "2,3% (170 decks), 2 top 8. Gear-value" },
  { legendName: "Sett, The Boss", tier: "C", comment: "1,9% (142 decks), 3 top 8, 1 win" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "C", comment: "1,8% (131 decks), 2 top 8. Value Calm/Mind" },
  { legendName: "Jax, Grandmaster at Arms", tier: "C", comment: "1,8% (130 decks), 3 top 8" },
  { legendName: "Lux, Lady of Luminosity", tier: "C", comment: "1,7% (123 decks), 3 top 8. Control Mind/Order" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "C", comment: "1,6% (117 decks), 4 top 8. Aurora Body/Chaos" },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "1,8% (128 decks), 0 top 8. Ne convertit pas" },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "1,7% (127 decks), 1 top 8. Aggro burn" },
  { legendName: "Teemo, Swift Scout", tier: "D", comment: "1,3% (94 decks), 0 top 8" },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "1,2% (88 decks), 0 top 8. Aggro Chaos/Fury" },
  { legendName: "Volibear, Relentless Storm", tier: "D", comment: "1,1% (82 decks), 0 top 8. Ramp midrange" },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "1,1% (78 decks), 0 top 8" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "1% (75 decks), 0 top 8. Contrôle toxique" },
  { legendName: "Darius, Hand of Noxus", tier: "D", comment: "0,9% (66 decks), 1 top 8. Aggro Body/Fury" },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "0,9% (65 decks), 0 top 8" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "0,5% (39 decks), 0 top 8. Aurora ramp" },
];

// Recalculé le 21 juillet 2026 sur 9 555 decks classés Unleashed via scripts/tier-unleashed.py
// (S3 City Challenges + Xi'an/Tianjin/Changsha RO + Suzhou RQ + Sydney + Vancouver + Utrecht
//  + Hartford, classement complet 1 659 + S3 National Open, classement complet 2 030).
// Taux de Top 8 moyen du field = 2,76 % : c'est la barre qui sépare les légendes qui convertissent de celles qui sont surjouées.
// NB dev : deux légendes Master Yi distinctes, Wuju Bladesman et Wuju Master.
// Le champion NE permet PAS de les distinguer : mesuré sur les 307 Bladesman du National Open
// (scrape complet), 82 % jouent Tempered et 18 % Honed, et les Wuju Master jouent Tempered aussi.
// Toujours lire la légende réelle du deck, jamais la déduire du champion ni du set.
const unleashedTier: TierEntry[] = [
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "11,9% du field (1133 decks), 49 top 8, 6 victoires, conversion 4,3%. Hold Corps/Calme. A gagné Suzhou, Tianjin et Hartford. Le plus joué de très loin, mais convertit moins bien qu'Irelia et Diana, deux fois moins choisies" },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "8,2% (780 decks), 37 top 8, 7 victoires, conversion 4,7%. Tempo gear Calme/Chaos. A gagné le S3 National Open, où la finale opposait deux Irelia" },
  { legendName: "Diana, Scorn of the Moon", tier: "S", comment: "7,3% (698 decks), 31 top 8, 3 victoires, conversion 4,4%. Chaos/Esprit. A gagné Vancouver, 3 top 8 à Hartford, 3e et 4e au National. La plus régulière du set" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "1,7% (161 decks) pour 8 top 8 et 3 victoires : conversion 5,0%, la meilleure du set. Top 8 à Utrecht, à Hartford, 6e au National. Aggro Chaos/Fureur très sous-estimé" },
  { legendName: "Sett, The Boss", tier: "A", comment: "2,1% (204 decks), 9 top 8, 3 victoires, conversion 4,4%. Midrange Corps/Ordre" },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "4,0% (386 decks), 15 top 8, 3 victoires, conversion 3,9%. Midrange Corps/Ordre" },
  { legendName: "Draven, Glorious Executioner", tier: "A", comment: "2,3% (219 decks), 8 top 8, conversion 3,7%. Aggro Chaos/Fureur, sans titre en Unleashed" },
  { legendName: "Kai'Sa, Daughter of the Void", tier: "A", comment: "3,3% (318 decks), 11 top 8, conversion 3,5%, mais aucune victoire en Unleashed et zéro top 32 au National. La reine d'Origins tient sans dominer" },
  { legendName: "Sivir, Battle Mistress", tier: "A", comment: "2,7% (256 decks), 9 top 8, 2 victoires, conversion 3,5%. Rampe Aurora, la meilleure économie de runes du format" },
  { legendName: "LeBlanc, Deceiver", tier: "B", comment: "6,0% (573 decks), 18 top 8, 2 victoires, conversion 3,1%. Midrange deathknell. Gros volume mais plus rien gagne depuis avril, et aucun top 8 ni à Hartford ni au National : quitte le tier S" },
  { legendName: "Lillia, Bashful Bloom", tier: "B", comment: "3,8% (363 decks), 11 top 8, 1 victoire, conversion 3,0%. Contrôle tempo Calme/Esprit" },
  { legendName: "Rek'Sai, Void Burrower", tier: "B", comment: "1,4% (134 decks), 4 top 8, conversion 3,0%. 3e à Tianjin, 5e au National, top 8 Utrecht. Aggro tunneler Fureur/Ordre" },
  { legendName: "Darius, Hand of Noxus", tier: "B", comment: "0,8% (74 decks), 2 top 8, conversion 2,7%. Aggro Corps/Fureur, top 8 Utrecht" },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "3,8% (363 decks), 9 top 8, 2 victoires, conversion 2,5%. A gagné Utrecht. Jetons et équipement" },
  { legendName: "Rengar, Pridestalker", tier: "B", comment: "2,5% (236 decks), 6 top 8, 1 victoire, conversion 2,5%. Finaliste de Vancouver" },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "B", comment: "2,2% (209 decks), 5 top 8, conversion 2,4%. Assassin Chaos/Fureur, 4e à Tianjin, 8e à Hartford" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "B", comment: "1,9% (184 decks), 4 top 8, conversion 2,2%. 3e à Hartford. Contrôle Chaos/Esprit exigeant" },
  { legendName: "Vex, Gloomist", tier: "C", comment: "4,2% (397 decks) mais 7 top 8, aucune victoire, et zéro top 32 au National sur 89 listes. Conversion 1,8%. Trois tournois de suite sans résultat : le gros taux de jeu ne se traduit jamais" },
  { legendName: "Kha'Zix, Voidreaver", tier: "C", comment: "2,4% (234 decks), 4 top 8, conversion 1,7%. Aggro combo" },
  { legendName: "Garen, Might of Demacia", tier: "C", comment: "0,7% (63 decks), 1 top 8, conversion 1,6%. Rampe Aurora" },
  { legendName: "Jhin, Virtuoso", tier: "C", comment: "1,5% (142 decks), 2 top 8, conversion 1,4%. Combo précision" },
  { legendName: "Viktor, Herald of the Arcane", tier: "C", comment: "3,3% (313 decks), 4 top 8, conversion 1,3%. Finaliste d'Utrecht, mais très en dessous de la moyenne du field sur la durée" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "C", comment: "1,7% (165 decks), 2 top 8, conversion 1,2%. Valeur par l'équipement" },
  { legendName: "Poppy, Keeper of the Hammer", tier: "C", comment: "1,0% (94 decks), 1 top 8, conversion 1,1%" },
  { legendName: "Lucian, Purifier", tier: "C", comment: "1,0% (91 decks), 1 top 8, conversion 1,1%" },
  { legendName: "Jax, Grandmaster At Arms", tier: "C", comment: "0,9% (90 decks), 1 top 8, conversion 1,1%" },
  { legendName: "Master Yi, Wuju Master", tier: "C", comment: "1,1% (101 decks), 1 top 8, conversion 1,0%. Variante Corps/Calme autour du champion Tempered, à ne pas confondre avec le Bladesman" },
  { legendName: "Lux, Lady of Luminosity", tier: "C", comment: "1,1% (109 decks), 1 top 8, conversion 0,9%. Contrôle Esprit/Ordre. 6e à Hartford, 12e et 14e au National : des pointes, pas de régularité" },
  { legendName: "Teemo, Swift Scout", tier: "C", comment: "1,3% (126 decks), 1 top 8, conversion 0,8%" },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "1,3% (124 decks), 1 top 8, conversion 0,8%. Combo Dragon Storm repéré au Triple Win-A-Box : Gem Dragon dégage les runes, Herald of Scales baisse le coût des dragons, la pioche s'emballe" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "D", comment: "2,8% (268 decks) pour 1 seul top 8, soit 0,4% de conversion : sept fois sous la moyenne, la pire du set. L'archétype Aurora qu'elle porte est trop lisible en parties 2 et 3" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "D", comment: "2,0% (187 decks), aucun top 8" },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "1,5% (141 decks), aucun top 8" },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "1,1% (109 decks), aucun top 8" },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "1,1% (108 decks), aucun top 8" },
  { legendName: "Ivern, Green Father", tier: "D", comment: "1,0% (99 decks), aucun top 8. Rampe et soutien" },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "1,0% (95 decks), aucun top 8" },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "0,8% (77 decks), aucun top 8" },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "0,7% (67 decks), aucun top 8" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "0,7% (65 decks), aucun top 8. Contrôle toxique" },
];

// Recalculé le 21 juillet 2026 sur 23 780 decks classés toutes ères (Origins + Spiritforged + Unleashed),
// classements complets de Hartford et du S3 National Open inclus. Taux de Top 8 moyen = 3,23 %.
// Commande : python -X utf8 scripts/tier-unleashed.py Global
const globalTier: TierEntry[] = [
  { legendName: "Kai'Sa, Daughter of the Void", tier: "S", comment: "13,1% du field toutes ères (3118 decks), 135 top 8, 17 victoires, conversion 4,3%. La plus jouée et la plus titrée de l'histoire du jeu, reine d'Origins" },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "12,5% (2967 decks), 122 top 8, 12 victoires, conversion 4,1%. Hold Corps/Calme, dominant d'Origins à Unleashed" },
  { legendName: "Draven, Glorious Executioner", tier: "S", comment: "7,4% (1760 decks), 97 top 8, 16 victoires, conversion 5,5%. Meilleure conversion des grosses légendes, roi du Spiritforged" },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "7,0% (1658 decks), 83 top 8, 10 victoires, conversion 5,0%. Tempo gear, a gagné le S3 National Open" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "2,4% (563 decks), 26 top 8, 6 victoires, conversion 4,6%. Surperforme dans les trois sets, toujours sous-jouée" },
  { legendName: "Diana, Scorn of the Moon", tier: "A", comment: "2,9% (698 decks), 31 top 8, 3 victoires, conversion 4,4%. Apparue en Unleashed, immédiatement au sommet" },
  { legendName: "Darius, Hand of Noxus", tier: "A", comment: "1,3% (315 decks), 12 top 8, conversion 3,8%. Aggro Corps/Fureur régulier, jamais titré" },
  { legendName: "Viktor, Herald of the Arcane", tier: "A", comment: "6,5% (1548 decks), 52 top 8, 4 victoires, conversion 3,4%. Contrôle Esprit/Ordre, très joué mais en perte de vitesse" },
  { legendName: "Rek'Sai, Void Burrower", tier: "A", comment: "1,3% (310 decks), 10 top 8, 2 victoires, conversion 3,2%. Aggro tunneler, podium à Tianjin et 5e au National" },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "3,2% (763 decks), 24 top 8, 4 victoires, conversion 3,1%. Midrange Corps/Ordre" },
  { legendName: "Sett, The Boss", tier: "A", comment: "3,0% (718 decks), 22 top 8, 8 victoires, conversion 3,1%. Huit titres, un des meilleurs rapports résultats sur volume" },
  { legendName: "LeBlanc, Deceiver", tier: "A", comment: "2,4% (573 decks), 18 top 8, 2 victoires, conversion 3,1%. Moteur deathknell né en Unleashed" },
  { legendName: "Lillia, Bashful Bloom", tier: "B", comment: "1,5% (363 decks), 11 top 8, 1 victoire, conversion 3,0%. Contrôle tempo Calme/Esprit" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "B", comment: "2,2% (516 decks), 13 top 8, 1 victoire, conversion 2,5%. Contrôle exigeant, 3e à Hartford" },
  { legendName: "Sivir, Battle Mistress", tier: "B", comment: "1,8% (438 decks), 11 top 8, 2 victoires, conversion 2,5%. Rampe Aurora" },
  { legendName: "Rengar, Pridestalker", tier: "B", comment: "1,0% (236 decks), 6 top 8, 1 victoire, conversion 2,5%. Finaliste de Vancouver" },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "B", comment: "0,9% (209 decks), 5 top 8, conversion 2,4%. Assassin Chaos/Fureur" },
  { legendName: "Teemo, Swift Scout", tier: "B", comment: "2,5% (596 decks), 14 top 8, 1 victoire, conversion 2,3%. Fort en Origins, effacé depuis" },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "2,6% (622 decks), 13 top 8, 3 victoires, conversion 2,1%. Jetons et équipement, a gagné Lille et Utrecht" },
  { legendName: "Vex, Gloomist", tier: "C", comment: "1,7% (397 decks), 7 top 8, aucune victoire, conversion 1,8%. Gros taux de jeu, aucun résultat" },
  { legendName: "Jax, Grandmaster At Arms", tier: "C", comment: "0,9% (220 decks), 4 top 8, conversion 1,8%" },
  { legendName: "Kha'Zix, Voidreaver", tier: "C", comment: "1,0% (234 decks), 4 top 8, conversion 1,7%. Aggro combo" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "C", comment: "3,2% (771 decks) pour 13 top 8 et 1 victoire, conversion 1,7%. Très jouée, rendement faible sur toute son histoire" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "C", comment: "2,6% (628 decks), 9 top 8, 1 victoire, conversion 1,4%. Populaire, sous la moyenne" },
  { legendName: "Jhin, Virtuoso", tier: "C", comment: "0,6% (142 decks), 2 top 8, conversion 1,4%. Combo précision" },
  { legendName: "Lux, Lady of Luminosity", tier: "C", comment: "1,3% (300 decks), 4 top 8, conversion 1,3%. Contrôle Esprit/Ordre" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "C", comment: "1,4% (335 decks), 4 top 8, conversion 1,2%. Valeur par l'équipement" },
  { legendName: "Lee Sin, Blind Monk", tier: "C", comment: "1,2% (284 decks), 3 top 8, conversion 1,1%" },
  { legendName: "Poppy, Keeper of the Hammer", tier: "C", comment: "0,4% (94 decks), 1 top 8, conversion 1,1%" },
  { legendName: "Master Yi, Wuju Master", tier: "C", comment: "0,4% (101 decks), 1 top 8, conversion 1,0%. Variante de niche, à ne pas confondre avec le Bladesman" },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "1,4% (341 decks), 3 top 8, 1 victoire, conversion 0,9%" },
  { legendName: "Volibear, Relentless Storm", tier: "D", comment: "1,2% (290 decks), 2 top 8, conversion 0,7%" },
  { legendName: "Lucian, Purifier", tier: "D", comment: "1,2% (275 decks), 2 top 8, conversion 0,7%" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "0,6% (136 decks), 1 top 8, conversion 0,7%" },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "1,6% (383 decks), 2 top 8, 1 victoire, conversion 0,5%. Très joué, presque jamais payant" },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "0,8% (194 decks), 1 top 8, conversion 0,5%" },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "1,4% (330 decks), aucun top 8 en 23 780 decks" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "0,6% (139 decks), aucun top 8. Contrôle toxique" },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "0,5% (109 decks), aucun top 8" },
  { legendName: "Ivern, Green Father", tier: "D", comment: "0,4% (99 decks), aucun top 8. Rampe et soutien" },
];

async function seedTierList(
  title: string,
  setContext: string,
  entries: TierEntry[],
  isCurrent: boolean,
) {
  const existing = await prisma.tierList.findFirst({
    where: { title },
  });
  if (existing) {
    await prisma.tierListEntry.deleteMany({ where: { tierListId: existing.id } });
    await prisma.tierList.delete({ where: { id: existing.id } });
  }

  const legendCards = await prisma.card.findMany({
    where: { type: "Legend" },
    select: { riftboundId: true, name: true },
  });

  const legendMap = new Map<string, string>();
  const legendMapAll = new Map<string, string>();
  for (const c of legendCards) {
    const lower = c.name.toLowerCase();
    legendMapAll.set(lower, c.riftboundId);
    if (!c.name.includes("(")) {
      legendMap.set(lower, c.riftboundId);
    }
  }

  const resolvedEntries = entries.map((e, i) => {
    // Les noms de cartes en DB sont au format virgule ("Master Yi, Wuju Bladesman").
    // Essayer le nom exact (virgule) AVANT le fallback par prefixe, sinon 2 legendes du meme
    // personnage (Wuju Bladesman vs Wuju Master) resolvent vers le meme id -> meme image.
    const lower = e.legendName.toLowerCase();
    let legendId = legendMap.get(lower) ?? legendMap.get(lower.replace(", ", " - ")) ?? "";
    if (!legendId) {
      const prefix = e.legendName.split(",")[0].toLowerCase().replace("'", "'");
      for (const [name, id] of legendMap) {
        if (name.startsWith(prefix)) { legendId = id; break; }
      }
      if (!legendId) {
        for (const [name, id] of legendMapAll) {
          if (name.startsWith(prefix) && !name.includes("overnumbered") && !name.includes("signature") && !name.includes("alternate")) {
            legendId = id; break;
          }
        }
      }
    }
    return {
      legendId,
      legendName: e.legendName,
      tier: e.tier,
      position: i + 1,
      comment: e.comment ?? null,
    };
  });

  const unresolved = resolvedEntries.filter((e) => !e.legendId);
  if (unresolved.length > 0) {
    console.warn(`  ⚠ ${unresolved.length} legends not found:`, unresolved.map((e) => e.legendName));
  }

  const tierList = await prisma.tierList.create({
    data: {
      title,
      description: `Tier list ${setContext}`,
      setContext,
      published: true,
      current: isCurrent,
      entries: {
        create: resolvedEntries.filter((e) => e.legendId),
      },
    },
  });

  console.log(`✓ ${title}: ${resolvedEntries.filter((e) => e.legendId).length} entries`);
  return tierList;
}

async function main() {
  console.log("Seeding tier lists...\n");

  await prisma.tierList.updateMany({ where: { current: true }, data: { current: false } });

  await seedTierList("Tier List Origins", "Origins", originsTier, false);
  await seedTierList("Tier List Spiritforged", "Spiritforged", spiritforgedTier, false);
  // Unleashed = format actuel → liste « courante » affichée par défaut (/meta + /tier-list).
  await seedTierList("Tier List Unleashed", "Unleashed", unleashedTier, true);
  await seedTierList("Tier List Globale", "Global", globalTier, false);

  console.log("\n✅ All tier lists seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
