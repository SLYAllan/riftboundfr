import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const TOURNAMENT_CTX: Record<string, string> = {
  "Atlanta Regional Qualifier": "RQ Atlanta 2026",
  "Bologna Regional Qualifier": "RQ Bologna 2026",
  "Houston Regional Qualifier": "RQ Houston 2025",
  "Las Vegas Regional Qualifier": "RQ Las Vegas 2026",
  "Lille Regional Qualifier": "RQ Lille 2026",
  "S3 Xi'an Regional Open": "Xi'an Regional Open S3",
  "S2 Shenzhen National Open": "Shenzhen National Open S2",
  "Shanghai National Open": "Shanghai National Open",
  "Beijing Regional Open (Day 2)": "Beijing Regional Open",
  "Beijing Regional Open (Day 1)": "Beijing Regional Open Day 1",
  "Guangzhou Regional Open (Full)": "Guangzhou Regional Open",
  "Guangzhou Regional Open": "Guangzhou Regional Open",
  "Chongqing Regional Open (Full)": "Chongqing Regional Open",
  "Chongqing Regional Open": "Chongqing Regional Open",
  "Shanghai City Challenge": "Shanghai City Challenge",
};

async function main() {
  const champCards = await prisma.card.findMany({
    where: { supertype: "Champion", alternateArt: false, overnumbered: false, signature: false },
    select: { id: true, name: true },
  });
  const champByName = new Map<string, string>();
  for (const c of champCards) {
    champByName.set(c.name.toLowerCase(), c.id);
  }

  const decksWithChampion = new Set<string>();
  const legendCards = await prisma.deckCard.findMany({
    where: { section: "legend" },
    include: { card: { select: { supertype: true } } },
  });
  for (const dc of legendCards) {
    if (dc.card.supertype === "Champion") {
      decksWithChampion.add(dc.deckId);
    }
  }

  const allDecks = await prisma.deck.findMany({
    where: { published: true, tournamentContext: { not: null } },
    select: { id: true, playerName: true, legendName: true, tournamentContext: true },
  });

  const decksByKey = new Map<string, string[]>();
  for (const d of allDecks) {
    const key = `${d.tournamentContext}|${d.playerName}|${d.legendName}`;
    if (!decksByKey.has(key)) decksByKey.set(key, []);
    decksByKey.get(key)!.push(d.id);
  }

  const baseDir = path.join(process.cwd(), "data", "decklists");
  const legendDirs = fs.readdirSync(baseDir).filter((d) =>
    fs.statSync(path.join(baseDir, d)).isDirectory(),
  );

  let added = 0;
  let alreadyHas = 0;
  let noDeck = 0;
  let noCard = 0;
  const toInsert: { deckId: string; cardId: string; quantity: number; section: string }[] = [];

  for (const dir of legendDirs) {
    const dirPath = path.join(baseDir, dir);
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dirPath, file), "utf8");
        const data = JSON.parse(raw);
        if (!data.champion) continue;

        const ctx = TOURNAMENT_CTX[data.tournament] ?? data.tournament;
        const key = `${ctx}|${data.player}|${data.legend}`;
        const deckIds = decksByKey.get(key);
        if (!deckIds) { noDeck++; continue; }

        const champName = data.champion.replace(",", " -").toLowerCase();
        const champCardId = champByName.get(champName);
        if (!champCardId) {
          const prefix = data.champion.split(",")[0].trim().toLowerCase();
          const fallback = [...champByName.entries()].find(([n]) => n.startsWith(prefix + " -"));
          if (!fallback) { noCard++; continue; }
          const fallbackId = fallback[1];
          for (const deckId of deckIds) {
            if (decksWithChampion.has(deckId)) { alreadyHas++; continue; }
            toInsert.push({ deckId, cardId: fallbackId, quantity: 1, section: "legend" });
            decksWithChampion.add(deckId);
            added++;
          }
          continue;
        }

        for (const deckId of deckIds) {
          if (decksWithChampion.has(deckId)) { alreadyHas++; continue; }
          toInsert.push({ deckId, cardId: champCardId, quantity: 1, section: "legend" });
          decksWithChampion.add(deckId);
          added++;
        }
      } catch {
        // skip
      }
    }
  }

  console.log(`Champions to add: ${added}`);
  console.log(`Already had champion: ${alreadyHas}`);
  console.log(`No deck match: ${noDeck}`);
  console.log(`No card match: ${noCard}`);

  if (toInsert.length > 0) {
    await prisma.deckCard.createMany({ data: toInsert, skipDuplicates: true });
    console.log(`Inserted ${toInsert.length} champion entries.`);
  }

  const missing = await prisma.$queryRaw<{ cnt: bigint }[]>`
    SELECT COUNT(DISTINCT d.id) as cnt
    FROM "Deck" d
    WHERE d.published = true AND d."tournamentContext" IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM "DeckCard" dc JOIN "Card" c ON dc."cardId" = c.id
      WHERE dc."deckId" = d.id AND dc.section = 'legend' AND c.supertype = 'Champion'
    )
  `;
  console.log(`Decks still missing champion: ${missing[0].cnt}`);

  await prisma.$disconnect();
}

main();
