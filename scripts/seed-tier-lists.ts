import { PrismaClient } from "@prisma/client";
import { resoudreLegende } from "./tier-list-integrity";
import {
  originsTier,
  spiritforgedTier,
  unleashedTier,
  globalTier,
  vendettaTier,
  type TierEntry,
} from "./tier-tables";

const prisma = new PrismaClient();




async function seedTierList(
  title: string,
  setContext: string,
  entries: TierEntry[],
  isCurrent: boolean,
) {
  const legendCards = await prisma.card.findMany({
    where: { type: "Legend", alternateArt: false, overnumbered: false, signature: false, set: { not: "OPP" } },
    select: { riftboundId: true, name: true },
  });

  const resolvedEntries = entries.map((e, i) => {
    // Une résolution par prénom publiait la mauvaise image dès qu'un champion avait
    // plusieurs Légendes. Le nom complet canonique est désormais obligatoire.
    const legendId = resoudreLegende(
      e.legendName,
      legendCards.map((carte) => ({ id: carte.riftboundId, name: carte.name })),
    ) ?? "";
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
    throw new Error(`${unresolved.length} Légendes introuvables : ${unresolved.map((e) => e.legendName).join(", ")}`);
  }

  const existing = await prisma.tierList.findFirst({
    where: { title },
  });
  if (existing) {
    await prisma.tierListEntry.deleteMany({ where: { tierListId: existing.id } });
    await prisma.tierList.delete({ where: { id: existing.id } });
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
  // Vendetta = format actuel → liste « courante » affichée par défaut (/meta + /tier-list).
  await seedTierList("Tier List Unleashed", "Unleashed", unleashedTier, false);
  await seedTierList("Tier List Vendetta", "Vendetta", vendettaTier, true);
  await seedTierList("Tier List Globale", "Global", globalTier, false);

  console.log("\n✅ All tier lists seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
