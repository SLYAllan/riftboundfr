import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TierEntry {
  legendName: string;
  tier: string;
  comment?: string;
}

const originsTier: TierEntry[] = [
  { legendName: "Kai'sa, Daughter of the Void", tier: "S", comment: "30-38% du field. Won Shanghai, Beijing, Guangzhou, Chongqing" },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "20-27% du field. 2nd partout. Hold +2 Might imbattable" },
  { legendName: "Viktor, Herald of the Arcane", tier: "A", comment: "11-20% field. #3 constant mais jamais top 4" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "Won Houston. Counter du méta Kai'Sa/Yi" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "B", comment: "4-8% field. Body/Chaos Aurora" },
  { legendName: "Sett, The Boss", tier: "B", comment: "3-6% field. Midrange buff solide" },
  { legendName: "Teemo, Swift Scout", tier: "B", comment: "3-5% field. Tempo-disrupt" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "B", comment: "2-4% field. Calm/Mind value" },
  { legendName: "Jinx, Loose Cannon", tier: "C", comment: "2-4% field. Aggro Chaos/Fury" },
  { legendName: "Darius, Hand of Noxus", tier: "C", comment: "1-3% field. Aggro Body/Fury" },
  { legendName: "Lee Sin, Blind Monk", tier: "C", comment: "1-2% field. Tempo Body/Calm" },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "1-2% field. Ramp midrange" },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "<1% field. Midrange défensif" },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "<1% field. Tempo Calm/Chaos" },
  { legendName: "Lux, Lady of Luminosity", tier: "D", comment: "<1% field. Control Mind/Order" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "Très rare. Aurora ramp" },
];

const spiritforgedTier: TierEntry[] = [
  { legendName: "Draven, Glorious Executioner", tier: "S", comment: "18% Shenzhen (5/8 top 8), Won Vegas. Roi du set" },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "Won Shenzhen (#1+#2), 3/8 Lille. Cross-set T1" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "A", comment: "Won Bologna. 6% Shenzhen. Learning curve" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "Won Atlanta + Nanjing. 3 Regional wins" },
  { legendName: "Kai'sa, Daughter of the Void", tier: "A", comment: "10% Shenzhen. En baisse vs Origins" },
  { legendName: "Fiora, Grand Duelist", tier: "B", comment: "5% Shenzhen. 2 CC wins" },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "Won Lille 14-0-2. 3% Shenzhen" },
  { legendName: "Viktor, Herald of the Arcane", tier: "B", comment: "6% Shenzhen. Stable mais jamais top 4" },
  { legendName: "Sivir, Battle Mistress", tier: "B", comment: "3% Shenzhen. 8th top 8. Aurora ramp" },
  { legendName: "Master Yi, Wuju Bladesman", tier: "B", comment: "2% Shenzhen. Effondrement vs Origins" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "C", comment: "2% Shenzhen. 2nd Bologna" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "C", comment: "2% Shenzhen. Value Calm/Mind" },
  { legendName: "Jax, Grandmaster at Arms", tier: "C", comment: "2% Shenzhen. 7th Vegas" },
  { legendName: "Lucian, Purifier", tier: "C", comment: "2% Shenzhen. Aggro equip" },
  { legendName: "Sett, The Boss", tier: "C", comment: "1% Shenzhen. 7th Atlanta" },
  { legendName: "Yasuo, Unforgiven", tier: "C", comment: "2% Shenzhen" },
  { legendName: "Rumble, Mechanized Menace", tier: "C", comment: "1% Shenzhen. Aggro burn" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "<1% field. Contrôle toxique Mind/Order" },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "1% Shenzhen" },
  { legendName: "Teemo, Swift Scout", tier: "D", comment: "1% Shenzhen" },
  { legendName: "Volibear, Relentless Storm", tier: "D", comment: "1% Shenzhen" },
  { legendName: "Rek'Sai, Void Burrower", tier: "D", comment: "1% Shenzhen" },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "1% Shenzhen" },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "1% Shenzhen" },
  { legendName: "Lux, Lady of Luminosity", tier: "D", comment: "1% Shenzhen" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "D", comment: "1% Shenzhen" },
  { legendName: "Darius, Hand of Noxus", tier: "D", comment: "<1% Shenzhen" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "<1% field. Aurora ramp Body/Order" },
];

const unleashedTier: TierEntry[] = [
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "Won Sydney 14-1-1. 4 placements top 8 Xi'an. T1 absolu" },
  { legendName: "Master Yi, Wuju Master", tier: "S", comment: "Won Suzhou. 35 top 8 CC. Hold dominant" },
  { legendName: "Diana, Scorn of the Moon", tier: "S", comment: "2nd Xi'an. Top 4 Sydney. 4 CC wins" },
  { legendName: "LeBlanc, Deceiver", tier: "A", comment: "6th Xi'an. Top 8 Sydney. Deathknell engine" },
  { legendName: "Sivir, Battle Mistress", tier: "A", comment: "2nd Sydney. Top 4 Suzhou. Aurora ramp" },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "2 CC wins (Beijing, Tianjin). Flex slots max" },
  { legendName: "Vex, Gloomist", tier: "B", comment: "4th Sydney. 5th Xi'an. Hold-control" },
  { legendName: "Sett, The Boss", tier: "B", comment: "CC win Nanjing. Sous-représenté, surperformant" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "B", comment: "22 decks Xi'an. Monte en Chine" },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "20 decks Xi'an. Tokens equip" },
  { legendName: "Rengar, Pridestalker", tier: "B", comment: "CC win Guangzhou. Dark horse récurrent" },
  { legendName: "Annie, Dark Child", tier: "B", comment: "CC win Shenzhen + Atlanta" },
  { legendName: "Teemo, Swift Scout", tier: "C", comment: "6th Sydney. Sprites build" },
  { legendName: "Kha'Zix, Voidreaver", tier: "C", comment: "CC top 8 Shenzhen. Aggro-combo" },
  { legendName: "Lillia, Bashful Bloom", tier: "C", comment: "Won Shanghai CC. Control-tempo" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "C", comment: "3rd Tianjin CC. Aurora" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "C", comment: "5th Beijing CC. Gear-value" },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "8th Shenzhen CC" },
  { legendName: "Jhin, Virtuoso", tier: "C", comment: "7 decks Xi'an. Combo précision" },
  { legendName: "Poppy, Keeper of the Hammer", tier: "C", comment: "7 decks Xi'an. Yordle aggro" },
  { legendName: "Ivern, Green Father", tier: "D", comment: "7 decks Xi'an. Support ramp" },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "D", comment: "Peu joué. Assassin aggro" },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "Peu jouée. Bruiser tempo" },
];

const globalTier: TierEntry[] = [
  { legendName: "Kai'sa, Daughter of the Void", tier: "S", comment: "~1340 decks. Reine Origins. 5 RQ wins" },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "~1031 decks. T1 toutes ères. Won Suzhou" },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "~369 decks. Won Sydney+Shenzhen. T1 cross-set" },
  { legendName: "Draven, Glorious Executioner", tier: "S", comment: "~464 decks. Roi Spiritforged. 4 RQ wins" },
  { legendName: "Viktor, Herald of the Arcane", tier: "A", comment: "~580 decks. Gros volume, pas de top 4" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "~92 decks. 3 Regional wins. Meilleure conversion" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "A", comment: "~158 decks. Won Bologna. Learning curve" },
  { legendName: "Diana, Scorn of the Moon", tier: "A", comment: "36 decks. 2nd Xi'an. T1 Unleashed" },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "~160 decks. Flex slots max. 2 CC wins" },
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "Won Lille 14-0-2. Equipment tokens" },
  { legendName: "LeBlanc, Deceiver", tier: "B", comment: "32 decks. Deathknell engine unique" },
  { legendName: "Sivir, Battle Mistress", tier: "B", comment: "~101 decks. 2nd Sydney. Aurora ramp" },
  { legendName: "Sett, The Boss", tier: "B", comment: "~119 decks. CC win Nanjing" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "B", comment: "~138 decks. Calm/Mind value" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "B", comment: "~167 decks. 2nd Bologna. Aurora" },
  { legendName: "Vex, Gloomist", tier: "B", comment: "25 decks. 4th Sydney. Hold-control" },
  { legendName: "Teemo, Swift Scout", tier: "C", comment: "~128 decks. 6th Sydney" },
  { legendName: "Jinx, Loose Cannon", tier: "C", comment: "~94 decks. Aggro Chaos/Fury" },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "~91 decks. Ramp midrange" },
  { legendName: "Lee Sin, Blind Monk", tier: "C", comment: "~89 decks. Tempo Body/Calm" },
  { legendName: "Darius, Hand of Noxus", tier: "C", comment: "~73 decks. Aggro" },
  { legendName: "Leona, Radiant Dawn", tier: "C", comment: "~72 decks. Midrange défensif" },
  { legendName: "Yasuo, Unforgiven", tier: "C", comment: "~69 decks. Tempo" },
  { legendName: "Lucian, Purifier", tier: "C", comment: "~66 decks. Aggro equip" },
  { legendName: "Jax, Grandmaster at Arms", tier: "C", comment: "~65 decks. 7th Vegas" },
  { legendName: "Kha'Zix, Voidreaver", tier: "C", comment: "Unleashed. Aggro-combo" },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "~59 decks. Aggro burn" },
  { legendName: "Lux, Lady of Luminosity", tier: "D", comment: "~58 decks. Control" },
  { legendName: "Rek'Sai, Void Burrower", tier: "D", comment: "~55 decks. Aggro tunneler" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "D", comment: "~51 decks. Gear-value" },
  { legendName: "Rengar, Pridestalker", tier: "D", comment: "15 decks. Dark horse CC" },
  { legendName: "Lillia, Bashful Bloom", tier: "D", comment: "17 decks. En déclin" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "Rare. Aurora ramp Body/Order" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "Rare. Contrôle toxique" },
  { legendName: "Jhin, Virtuoso", tier: "D", comment: "Unleashed. Combo précision" },
  { legendName: "Poppy, Keeper of the Hammer", tier: "D", comment: "Unleashed. Yordle aggro" },
  { legendName: "Ivern, Green Father", tier: "D", comment: "Unleashed. Support ramp" },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "D", comment: "Unleashed. Assassin aggro" },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "Unleashed. Bruiser tempo" },
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
    const normalized = e.legendName.replace(", ", " - ").toLowerCase();
    let legendId = legendMap.get(normalized) ?? "";
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
