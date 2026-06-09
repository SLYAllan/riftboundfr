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

// Recalculé sur 5105 decks classés Unleashed (25 S3 City Challenges + Xi'an RO + Tianjin RO + Suzhou RQ + Sydney) — méta le plus ouvert.
// NB Master Yi : DEUX légendes distinctes. Wuju Bladesman = la vraie jouée (S, 583 decks). Wuju Master = quasi inexistant (~3 decks confirmés image, gardé en D pour complétude). Ne jamais classer un deck Bladesman en Wuju Master via le fallback set.
const unleashedTier: TierEntry[] = [
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "11,4% (583 decks), 41 top 8, 5 wins. A gagné Tianjin. #1 du field, Hold Body/Calm dominant" },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "8,3% (422 decks), 31 top 8, 5 wins. T1 absolu" },
  { legendName: "LeBlanc, Deceiver", tier: "S", comment: "7,1% (365 decks), 18 top 8, 2 wins. Deathknell midrange" },
  { legendName: "Diana, Scorn of the Moon", tier: "S", comment: "6,5% (334 decks), 21 top 8, 2 wins. 2e à Tianjin. Aggro-tempo" },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "5,6% (287 decks), 15 top 8, 3 wins" },
  { legendName: "Lillia, Bashful Bloom", tier: "A", comment: "5,1% (260 decks), 11 top 8, 1 win. Control-tempo" },
  { legendName: "Azir, Emperor of the Sands", tier: "A", comment: "3,8% (196 decks), 7 top 8, 1 win. Tokens equip" },
  { legendName: "Kai'Sa, Daughter of the Void", tier: "A", comment: "3,6% (185 decks), 11 top 8. Tempo Fury/Mind" },
  { legendName: "Sivir, Battle Mistress", tier: "A", comment: "2,9% (148 decks), 8 top 8, 2 wins. Aurora ramp" },
  { legendName: "Sett, The Boss", tier: "A", comment: "2,7% (138 decks), 8 top 8, 3 wins. Surperforme" },
  { legendName: "Rengar, Pridestalker", tier: "A", comment: "2,7% (138 decks), 5 top 8, 1 win. Dark horse" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "1,5% (79 decks) mais 5 top 8 + 3 wins — sleeper" },
  { legendName: "Vex, Gloomist", tier: "B", comment: "5% (253 decks), 7 top 8, 0 win. Hold-control : gros volume, faible conversion" },
  { legendName: "Viktor, Herald of the Arcane", tier: "B", comment: "2,8% (141 decks), 3 top 8" },
  { legendName: "Kha'Zix, Voidreaver", tier: "B", comment: "2,7% (137 decks), 4 top 8. Aggro-combo" },
  { legendName: "Draven, Glorious Executioner", tier: "B", comment: "2,6% (131 decks), 8 top 8. Aggro" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "B", comment: "2% (101 decks), 2 top 8. Gear-value" },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "B", comment: "1,9% (97 decks), 4 top 8. 4e à Tianjin. Assassin" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "B", comment: "1,7% (88 decks), 3 top 8" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "C", comment: "3,3% (167 decks) mais 1 seul top 8 — sous-performe" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "C", comment: "1,4% (74 decks), 0 top 8" },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "1,3% (66 decks), 1 top 8" },
  { legendName: "Jhin, Virtuoso", tier: "C", comment: "1,1% (58 decks), 2 top 8. Combo précision" },
  { legendName: "Vi, Piltover Enforcer", tier: "C", comment: "1,1% (58 decks), 0 top 8" },
  { legendName: "Teemo, Swift Scout", tier: "C", comment: "1,1% (57 decks), 1 top 8" },
  { legendName: "Poppy, Keeper of the Hammer", tier: "C", comment: "1% (52 decks), 1 top 8" },
  { legendName: "Rek'sai, Void Burrower", tier: "C", comment: "0,8% (40 decks), 2 top 8, 3e à Tianjin. Aggro tunneler" },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "1,3% (67 decks), 0 top 8" },
  { legendName: "Ivern, Green Father", tier: "D", comment: "1,1% (54 decks), 0 top 8. Support ramp" },
  { legendName: "Lux, Lady of Luminosity", tier: "D", comment: "0,9% (47 decks), 0 top 8" },
  { legendName: "Lucian, Purifier", tier: "D", comment: "0,8% (41 decks), 1 top 8" },
  { legendName: "Jax, Grandmaster At Arms", tier: "D", comment: "0,7% (38 decks), 1 top 8" },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "0,7% (35 decks), 0 top 8" },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "0,6% (33 decks), 0 top 8" },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "0,6% (31 decks), 0 top 8" },
  { legendName: "Darius, Hand of Noxus", tier: "D", comment: "0,6% (30 decks), 1 top 8" },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "0,5% (27 decks), 0 top 8" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "0,5% (26 decks), 1 top 8" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "0,4% (21 decks), 0 top 8. Contrôle toxique" },
  { legendName: "Master Yi, Wuju Master", tier: "D", comment: "Légende Unleashed très peu jouée (~3 decks confirmés). À ne pas confondre avec le Bladesman (S)" },
];

// Recalculé sur 19127 decks classés toutes ères (Origins + Spiritforged + Unleashed)
const globalTier: TierEntry[] = [
  { legendName: "Kai'Sa, Daughter of the Void", tier: "S", comment: "2924 decks (toutes ères), 123 top 8, 14 wins. Reine cross-set" },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "2384 decks, 107 top 8, 11 wins. T1 Origins (Hold +2 Might), joué cross-set. A gagné Tianjin" },
  { legendName: "Draven, Glorious Executioner", tier: "S", comment: "1667 decks, 93 top 8, 14 wins. Roi Spiritforged" },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "1295 decks, 73 top 8, 8 wins. T1 cross-set" },
  { legendName: "Viktor, Herald of the Arcane", tier: "A", comment: "1364 decks, 47 top 8, 4 wins. Gros volume Mind/Order" },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "663 decks, 24 top 8, 4 wins. Flex slots max" },
  { legendName: "Sett, The Boss", tier: "A", comment: "642 decks, 21 top 8, 8 wins. Forte conversion" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "472 decks, 21 top 8, 5 wins. Meilleure conversion" },
  { legendName: "Diana, Scorn of the Moon", tier: "A", comment: "334 decks, 21 top 8, 2 wins. T1 Unleashed, 2e Tianjin" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "B", comment: "660 decks, 10 top 8, 1 win. Aurora Body/Chaos" },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "453 decks, 10 top 8, 1 win. Won Lille. Equipment tokens" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "B", comment: "418 decks, 10 top 8. Won Bologna. Learning curve" },
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
  { legendName: "Lux, Lady of Luminosity", tier: "D", comment: "235 decks, 3 top 8. Control" },
  { legendName: "Jax, Grandmaster At Arms", tier: "D", comment: "166 decks, 3 top 8. Bruiser" },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "157 decks, 1 top 8. Aggro burn" },
  { legendName: "Kha'Zix, Voidreaver", tier: "D", comment: "137 decks, 4 top 8. Aggro-combo" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "97 decks, 1 top 8. Aurora ramp" },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "D", comment: "97 decks, 4 top 8. 4e Tianjin. Assassin" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "94 decks, 0 top 8. Contrôle toxique" },
  { legendName: "Jhin, Virtuoso", tier: "D", comment: "58 decks, 2 top 8. Combo précision" },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "58 decks, 0 top 8. Bruiser tempo" },
  { legendName: "Ivern, Green Father", tier: "D", comment: "54 decks, 0 top 8. Support ramp" },
  { legendName: "Poppy, Keeper of the Hammer", tier: "D", comment: "52 decks, 1 top 8. Yordle aggro" },
  { legendName: "Master Yi, Wuju Master", tier: "D", comment: "Légende Unleashed quasi pas jouée (~3 decks confirmés par image). Distincte du Wuju Bladesman (S)" },
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
  await seedTierList("Tier List Unleashed", "Unleashed", unleashedTier, false);
  await seedTierList("Tier List Globale", "Global", globalTier, true);

  console.log("\n✅ All tier lists seeded.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
