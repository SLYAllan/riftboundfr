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

// Recalculé sur ~8 560 decks classés Unleashed (S3 City Challenges + Xi'an/Tianjin/Changsha RO + Suzhou RQ + Sydney + Vancouver + Utrecht + Hartford) — le méta le plus ouvert à ce jour.
// NB dev : deux légendes Master Yi distinctes (Wuju Bladesman champion Honed ; Wuju Master champion Tempered). Lire la légende réelle de chaque deck, ne pas la déduire du set/champion.
const unleashedTier: TierEntry[] = [
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "#1 du field, Hold Body/Calm. A gagné Suzhou, Tianjin et Hartford (Factor, 14-1-1). Le + joué à Hartford (178 / 10,7%) — mais 1 seul Top 8 sur place : convertit au titre, pas en volume" },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "T1 absolu, tempo gear. 6 wins Unleashed. À Hartford : 2e légende la + jouée (93) mais 0 Top 8 (best 9e) — régulière ailleurs, ratée à Hartford" },
  { legendName: "Diana, Scorn of the Moon", tier: "S", comment: "A gagné Vancouver (AlanZQ), 2e Tianjin, top 4 Utrecht. Reine de Hartford : 3 Top 8 (2e/4e/5e), 14 dans le Top 64 — meilleure conversion du field, Chaos/Mind" },
  { legendName: "LeBlanc, Deceiver", tier: "S", comment: "~6,3% (438 decks), 18 top 8, 2 wins. Deathknell midrange. 76 à Hartford, best 39e (creux)" },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "5,1% (351 decks), 16 top 8, 3 wins" },
  { legendName: "Draven, Glorious Executioner", tier: "A", comment: "4,9% (340 decks), 12 top 8, 1 win. Aggro" },
  { legendName: "Lillia, Bashful Bloom", tier: "A", comment: "4,5% (308 decks), 11 top 8, 1 win. Control-tempo" },
  { legendName: "Azir, Emperor of the Sands", tier: "A", comment: "3,5% (242 decks), 8 top 8, 2 wins. A gagné Utrecht (Squirtle). Tokens equip. 70 à Hartford, best 11e" },
  { legendName: "Kai'Sa, Daughter of the Void", tier: "A", comment: "3,8% (260 decks), 11 top 8. Tempo Fury/Mind" },
  { legendName: "Sivir, Battle Mistress", tier: "A", comment: "2,9% (202 decks), 10 top 8, 2 wins. Aurora ramp" },
  { legendName: "Sett, The Boss", tier: "A", comment: "2,5% (172 decks), 9 top 8, 3 wins. Surperforme, top 4 Utrecht" },
  { legendName: "Rengar, Pridestalker", tier: "A", comment: "2,5% (170 decks), 5 top 8, 1 win. Finaliste Vancouver (SamDSherman)" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "1,7% (115 decks) mais 8 top 8 + 3 wins — meilleure conversion, sleeper. 7e Hartford (Prismaticismism, champion d'Atlanta)" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "B", comment: "6 top 8 + 1 win (Bologna). 3e à Hartford (Bradykin), seul Ezreal du Top 8. Chaos/Mind, courbe d'apprentissage" },
  { legendName: "Vex, Gloomist", tier: "B", comment: "4,2% (288 decks), 7 top 8, 0 win. Hold-control : gros volume, faible conversion" },
  { legendName: "Viktor, Herald of the Arcane", tier: "B", comment: "3% (206 decks), 4 top 8. Finaliste Utrecht (Rednaxell, recruits/tokens)" },
  { legendName: "Kha'Zix, Voidreaver", tier: "B", comment: "2,5% (170 decks), 4 top 8. Aggro-combo" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "B", comment: "1,8% (126 decks), 2 top 8. Gear-value" },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "B", comment: "1,8% (126 decks), 5 top 8. 4e Tianjin, 8e Hartford (Mirru). Assassin Chaos/Fury" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "C", comment: "2,9% (201 decks) mais 1 seul top 8 — sous-performe" },
  { legendName: "Lux, Lady of Luminosity", tier: "C", comment: "Control Mind/Order. 6e à Hartford (CTCG Relivia) — 1er Top 8 majeur Unleashed. Pic de spiciness, monte en C" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "C", comment: "1,6% (113 decks), 0 top 8" },
  { legendName: "Jhin, Virtuoso", tier: "C", comment: "1,2% (80 decks), 2 top 8. Combo précision" },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "1,3% (90 decks), 1 top 8. Combo « Dragon Storm » émergent (Gem Dragon untap les runes + Herald of Scales -2 énergie = pioche/mana quasi infinie), repéré au Triple Win-A-Box" },
  { legendName: "Vi, Piltover Enforcer", tier: "C", comment: "1,1% (79 decks), 0 top 8" },
  { legendName: "Teemo, Swift Scout", tier: "C", comment: "1,3% (91 decks), 1 top 8" },
  { legendName: "Poppy, Keeper of the Hammer", tier: "C", comment: "0,9% (64 decks), 2 top 8" },
  { legendName: "Rek'Sai, Void Burrower", tier: "C", comment: "0,9% (62 decks), 3 top 8, 3e Tianjin, top 8 Utrecht. Aggro tunneler" },
  { legendName: "Darius, Hand of Noxus", tier: "C", comment: "0,7% (46 decks), 2 top 8, top 8 Utrecht (MICE DiamondHat)" },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "1,2% (85 decks), 0 top 8" },
  { legendName: "Ivern, Green Father", tier: "D", comment: "1% (70 decks), 0 top 8. Support ramp" },
  { legendName: "Lucian, Purifier", tier: "D", comment: "0,9% (60 decks), 1 top 8" },
  { legendName: "Jax, Grandmaster At Arms", tier: "D", comment: "0,9% (61 decks), 1 top 8" },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "0,8% (57 decks), 0 top 8" },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "0,8% (54 decks), 0 top 8" },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "0,8% (53 decks), 0 top 8" },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "0,6% (44 decks), 0 top 8" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "0,7% (45 decks), 1 top 8" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "0,6% (39 decks), 0 top 8. Contrôle toxique" },
  { legendName: "Master Yi, Wuju Master", tier: "D", comment: "0,4% (28 decks), 1 top 8. Variante Body/Calm autour du champion Tempered. Archétype de niche" },
];

// Recalculé sur ~20 780 decks classés toutes ères (Origins + Spiritforged + Unleashed, Hartford inclus)
const globalTier: TierEntry[] = [
  { legendName: "Kai'Sa, Daughter of the Void", tier: "S", comment: "2924 decks (toutes ères), 123 top 8, 14 wins. Reine cross-set" },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "2562 decks, 108 top 8, 12 wins. T1 Origins (Hold +2 Might), joué cross-set. A gagné Tianjin et Hartford" },
  { legendName: "Draven, Glorious Executioner", tier: "S", comment: "1667 decks, 93 top 8, 14 wins. Roi Spiritforged" },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "1295 decks, 73 top 8, 8 wins. T1 cross-set" },
  { legendName: "Viktor, Herald of the Arcane", tier: "A", comment: "1364 decks, 47 top 8, 4 wins. Gros volume Mind/Order" },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "663 decks, 24 top 8, 4 wins. Flex slots max" },
  { legendName: "Sett, The Boss", tier: "A", comment: "642 decks, 21 top 8, 8 wins. Forte conversion" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "472 decks, 21 top 8, 5 wins. Meilleure conversion" },
  { legendName: "Diana, Scorn of the Moon", tier: "A", comment: "468 decks, 24 top 8, 2 wins. T1 Unleashed, 2e Tianjin, 3 Top 8 à Hartford (2e/4e/5e)" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "B", comment: "660 decks, 10 top 8, 1 win. Aurora Body/Chaos" },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "453 decks, 10 top 8, 1 win. Won Lille. Equipment tokens" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "B", comment: "460 decks, 11 top 8. Won Bologna, 3e Hartford. Learning curve" },
  { legendName: "LeBlanc, Deceiver", tier: "B", comment: "365 decks, 18 top 8, 2 wins. Deathknell engine" },
  { legendName: "Sivir, Battle Mistress", tier: "B", comment: "329 decks, 10 top 8, 2 wins. Aurora ramp" },
  { legendName: "Teemo, Swift Scout", tier: "C", comment: "519 decks, 12 top 8, 1 win. Tempo-disrupt" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "C", comment: "506 decks, 9 top 8, 1 win. Calm/Mind value" },
  { legendName: "Yasuo, Unforgiven", tier: "C", comment: "321 decks, 2 top 8, 1 win. Tempo" },
  { legendName: "Darius, Hand of Noxus", tier: "C", comment: "269 decks, 11 top 8. Aggro Body/Fury" },
  { legendName: "Jinx, Loose Cannon", tier: "C", comment: "267 decks, 3 top 8, 1 win. Aggro Chaos/Fury" },
  { legendName: "Lillia, Bashful Bloom", tier: "C", comment: "260 decks, 11 top 8, 1 win. Control-tempo" },
  { legendName: "Vex, Gloomist", tier: "C", comment: "253 decks, 7 top 8. Hold-control" },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "233 decks, 2 top 8. Ramp midrange" },
  { legendName: "Lee Sin, Blind Monk", tier: "C", comment: "229 decks, 3 top 8. Tempo Body/Calm" },
  { legendName: "Lucian, Purifier", tier: "C", comment: "221 decks, 2 top 8. Aggro equip" },
  { legendName: "Rek'sai, Void Burrower", tier: "C", comment: "212 decks, 7 top 8, 1 win. 3e Tianjin. Aggro tunneler" },
  { legendName: "Rengar, Pridestalker", tier: "C", comment: "138 decks, 5 top 8, 1 win. Dark horse" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "D", comment: "270 decks, 4 top 8. Gear-value" },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "254 decks, 0 top 8. Midrange défensif" },
  { legendName: "Lux, Lady of Luminosity", tier: "D", comment: "258 decks, 4 top 8. Control Mind/Order. 6e Hartford (CTCG Relivia)" },
  { legendName: "Jax, Grandmaster At Arms", tier: "D", comment: "166 decks, 3 top 8. Bruiser" },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "157 decks, 1 top 8. Aggro burn" },
  { legendName: "Kha'Zix, Voidreaver", tier: "D", comment: "137 decks, 4 top 8. Aggro-combo" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "97 decks, 1 top 8. Aurora ramp" },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "D", comment: "143 decks, 5 top 8. 4e Tianjin, 8e Hartford. Assassin" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "94 decks, 0 top 8. Contrôle toxique" },
  { legendName: "Jhin, Virtuoso", tier: "D", comment: "58 decks, 2 top 8. Combo précision" },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "58 decks, 0 top 8. Bruiser tempo" },
  { legendName: "Ivern, Green Father", tier: "D", comment: "54 decks, 0 top 8. Support ramp" },
  { legendName: "Poppy, Keeper of the Hammer", tier: "D", comment: "52 decks, 1 top 8. Yordle aggro" },
  { legendName: "Master Yi, Wuju Master", tier: "D", comment: "Variante Body/Calm autour du champion Tempered (28 decks classés, 1 top 8). Archétype de niche" },
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
