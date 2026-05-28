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

const NAME_FIXES: Record<string, string> = {
  "yi, meditative": "master yi - meditative",
  "yi, tempered": "master yi - tempered",
  "yi, honed": "master yi - honed",
  "yi, unstoppable": "master yi - unstoppable",
};

async function main() {
  const allCards = await prisma.card.findMany({
    select: { id: true, name: true, supertype: true },
  });
  const cardsByName = new Map<string, { id: string; supertype: string | null }>();
  for (const c of allCards) {
    cardsByName.set(c.name.toLowerCase(), { id: c.id, supertype: c.supertype });
  }

  const allDecks = await prisma.deck.findMany({
    where: { published: true, tournamentContext: { not: null } },
    select: {
      id: true,
      playerName: true,
      legendName: true,
      tournamentContext: true,
      cards: { select: { cardId: true } },
    },
  });

  const deckLookup = new Map<string, { id: string; existingCardIds: Set<string> }>();
  for (const d of allDecks) {
    const key = `${d.tournamentContext}|${d.playerName}|${d.legendName}`;
    deckLookup.set(key, {
      id: d.id,
      existingCardIds: new Set(d.cards.map((c) => c.cardId)),
    });
  }

  const baseDir = path.join(process.cwd(), "data", "decklists");
  const legendDirs = fs
    .readdirSync(baseDir)
    .filter((d) => fs.statSync(path.join(baseDir, d)).isDirectory());

  let added = 0;
  let skipped = 0;
  let noCard = 0;
  let noDeck = 0;
  const toInsert: { deckId: string; cardId: string; quantity: number; section: string }[] = [];

  for (const dir of legendDirs) {
    const dirPath = path.join(baseDir, dir);
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dirPath, file), "utf8");
        const data = JSON.parse(raw);

        if (!data.champion) continue;

        const tournamentCtx = TOURNAMENT_CTX[data.tournament] ?? data.tournament;
        const key = `${tournamentCtx}|${data.player}|${data.legend}`;
        const deck = deckLookup.get(key);

        if (!deck) {
          noDeck++;
          continue;
        }

        const champName = data.champion;
        let dbName = champName.replace(", ", " - ").toLowerCase();
        if (NAME_FIXES[champName.toLowerCase()]) {
          dbName = NAME_FIXES[champName.toLowerCase()];
        }

        const card = cardsByName.get(dbName);
        if (!card) {
          noCard++;
          continue;
        }

        if (deck.existingCardIds.has(card.id)) {
          skipped++;
          continue;
        }

        const quantityFromMain = (data.mainDeck ?? []).find(
          (e: { name: string }) => e.name === champName,
        );
        const qty = quantityFromMain?.quantity ?? 1;

        toInsert.push({
          deckId: deck.id,
          cardId: card.id,
          quantity: qty,
          section: "main",
        });
        deck.existingCardIds.add(card.id);
        added++;
      } catch {
        // skip
      }
    }
  }

  console.log(`Legend champion units to add: ${added}`);
  console.log(`Already present: ${skipped}`);
  console.log(`No card match: ${noCard}`);
  console.log(`No deck in DB: ${noDeck}`);

  if (toInsert.length > 0) {
    const batchSize = 500;
    for (let i = 0; i < toInsert.length; i += batchSize) {
      const batch = toInsert.slice(i, i + batchSize);
      await prisma.deckCard.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }
    console.log(`Inserted ${toInsert.length} champion units`);
  }

  // Verify the specific deck
  const testDeck = await prisma.deck.findFirst({
    where: { slug: "xi-an-regional-open-s3-37th-master-yi" },
    include: {
      cards: {
        include: { card: { select: { name: true, supertype: true } } },
      },
    },
  });
  if (testDeck) {
    const champs = testDeck.cards.filter(
      (dc) => dc.card?.supertype === "Champion",
    );
    console.log(
      "\nVerify xi-an-37th-master-yi champions:",
      champs.map((c) => `${c.card!.name} x${c.quantity} (${c.section})`),
    );
  }

  await prisma.$disconnect();
}

main();
