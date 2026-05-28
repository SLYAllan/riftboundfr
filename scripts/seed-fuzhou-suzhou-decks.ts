import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/g, "")
    .replace(/^-+/, "");
}

const placements = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

interface TopEntry {
  place: number;
  legend: string;
  player: string;
}

const fuzhou: TopEntry[] = [
  { place: 1, legend: "Draven - Glorious Executioner", player: "Aipotu" },
  { place: 2, legend: "Fiora - Grand Duelist", player: "EDG.BTM.少侠SNnnnn" },
  { place: 3, legend: "Draven - Glorious Executioner", player: "天堂制造" },
  { place: 4, legend: "Irelia - Blade Dancer", player: "赤月星宿" },
  { place: 5, legend: "Annie - Dark Child", player: "Ai.EDG.张伯伦" },
  { place: 6, legend: "Draven - Glorious Executioner", player: "海盗帕奇斯" },
  { place: 7, legend: "Draven - Glorious Executioner", player: "布启" },
  { place: 8, legend: "Irelia - Blade Dancer", player: "Trails" },
];

const suzhou: TopEntry[] = [
  { place: 1, legend: "Master Yi - Wuju Bladesman", player: "燐川" },
  { place: 2, legend: "Irelia - Blade Dancer", player: "LineKa·OAK" },
  { place: 3, legend: "Poppy - Keeper of the Hammer", player: "卓卡-坦尼斯" },
  { place: 4, legend: "Sivir - Battle Mistress", player: "藏宝 嗯哼" },
  { place: 5, legend: "Ezreal - Prodigal Explorer", player: "andy1996" },
  { place: 6, legend: "Ezreal - Prodigal Explorer", player: "TXG·高远" },
  { place: 7, legend: "Irelia - Blade Dancer", player: "JIYAN- YADA" },
  { place: 8, legend: "Sivir - Battle Mistress", player: "夺冠就结婚" },
];

async function seedTournamentDecks(
  tournamentContext: string,
  setTag: string,
  entries: TopEntry[],
) {
  const existing = await prisma.deck.count({
    where: { tournamentContext },
  });
  if (existing > 0) {
    console.log(`  SKIP ${tournamentContext}: ${existing} decks already exist`);
    return;
  }

  const legendCards = await prisma.card.findMany({
    where: { type: "Legend" },
    select: { riftboundId: true, name: true },
  });
  const legendMap = new Map<string, string>();
  for (const c of legendCards) {
    legendMap.set(c.name.toLowerCase(), c.riftboundId);
  }

  let created = 0;
  for (const entry of entries) {
    const legendId = legendMap.get(entry.legend.toLowerCase()) ?? "";
    if (!legendId) {
      console.warn(`  ⚠ Legend not found: ${entry.legend}`);
      continue;
    }

    const placement = placements[entry.place - 1] ?? `${entry.place}th`;
    const slug = slugify(`${tournamentContext}-${placement}-${entry.player}-${entry.legend.split(",")[0]}`);

    const legendShort = entry.legend.split(" - ")[0].trim();

    await prisma.deck.create({
      data: {
        slug,
        title: `${placement} ${tournamentContext} — ${legendShort} (${entry.player})`,
        legendId,
        legendName: entry.legend,
        format: "constructed",
        setTag,
        published: true,
        tournamentContext,
        placement,
        playerName: entry.player,
      },
    });
    created++;
  }

  console.log(`✓ ${tournamentContext}: ${created} decks created`);
}

async function main() {
  console.log("Seeding Fuzhou + Suzhou top 8 decks...\n");
  await seedTournamentDecks("Fuzhou Regional Qualifier", "Spiritforged", fuzhou);
  await seedTournamentDecks("Suzhou Regional Qualifier", "Unleashed", suzhou);
  console.log("\nDone.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
