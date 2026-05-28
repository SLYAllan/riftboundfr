import { PrismaClient } from "@prisma/client";
import { parseDeckCode } from "../src/lib/deck-code";

const prisma = new PrismaClient();

const ARTICLE_META: Record<string, { tournament: string; set: string }> = {
  "best-of-houston-rq-2025": { tournament: "RQ Houston 2025", set: "Origins" },
  "best-of-bologna-rq-2026": { tournament: "RQ Bologna 2026", set: "Spiritforged" },
  "best-of-las-vegas-rq-2026": { tournament: "RQ Las Vegas 2026", set: "Spiritforged" },
  "best-of-lille-rq-2026": { tournament: "RQ Lille 2026", set: "Spiritforged" },
  "best-of-xian-regional-open-s3": { tournament: "Xi'an Regional Open S3", set: "Unleashed" },
};

interface DecklistBlock {
  type: "decklist";
  id: string;
  deckCode: string;
  deckName?: string;
  legendName: string;
  playerName?: string;
  context?: string;
}

interface TextBlock {
  type: "text";
  id: string;
  content: string;
}

type Block = DecklistBlock | TextBlock | { type: string; id: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/g, "")
    .replace(/^-+/, "");
}

function extractPlacement(context?: string): string | null {
  if (!context) return null;
  const m = context.match(/(\d+(?:st|nd|rd|th|er|e))/i);
  return m ? m[1] : null;
}

async function main() {
  const articles = await prisma.article.findMany({
    where: {
      published: true,
      slug: { in: Object.keys(ARTICLE_META) },
    },
    include: { _count: { select: { decks: true } } },
  });

  let totalCreated = 0;

  for (const article of articles) {
    if (article._count.decks > 0) {
      console.log(`SKIP ${article.slug}: already has ${article._count.decks} decks`);
      continue;
    }

    const meta = ARTICLE_META[article.slug];
    if (!meta) continue;

    const blocks = article.blocks as Block[];
    const decklistBlocks = blocks.filter(
      (b): b is DecklistBlock => b.type === "decklist" && "deckCode" in b,
    );

    console.log(`\n${article.slug}: ${decklistBlocks.length} decklists`);

    for (const block of decklistBlocks) {
      const legendFirst = block.legendName.split(",")[0].trim();
      const slug = `best-of-${slugify(article.slug.replace("best-of-", ""))}-${slugify(block.legendName)}`;

      const existing = await prisma.deck.findUnique({ where: { slug } });
      if (existing) {
        console.log(`  SKIP ${slug}: exists`);
        continue;
      }

      const legendCard = await prisma.card.findFirst({
        where: {
          type: "Legend",
          OR: [
            { name: { startsWith: legendFirst, mode: "insensitive" } },
          ],
          NOT: [
            { name: { contains: "Overnumbered" } },
            { name: { contains: "Signature" } },
            { name: { contains: "Alternate" } },
          ],
        },
      });

      const placement = extractPlacement(block.context ?? undefined);

      const deck = await prisma.deck.create({
        data: {
          title: block.deckName || `${legendFirst} — Best of ${meta.tournament}`,
          slug,
          legendId: legendCard?.riftboundId ?? legendFirst,
          legendName: block.legendName,
          format: "constructed",
          tags: [slugify(meta.tournament), "best-of"],
          featured: true,
          published: true,
          sourceArticleId: article.id,
          tournamentContext: meta.tournament,
          placement: placement,
          playerName: block.playerName || null,
        },
      });

      await prisma.$executeRawUnsafe(
        `UPDATE "Deck" SET "setTag" = $1 WHERE id = $2`,
        meta.set,
        deck.id,
      );

      const parsed = parseDeckCode(block.deckCode);
      let cardCount = 0;
      const seen = new Set<string>();

      for (const entry of parsed.entries) {
        const dashName = entry.name.replace(/, /g, " - ");
        const card = await prisma.card.findFirst({
          where: {
            OR: [
              { name: { equals: entry.name, mode: "insensitive" } },
              { name: { equals: dashName, mode: "insensitive" } },
              { cleanName: { equals: entry.name, mode: "insensitive" } },
              { cleanName: { equals: dashName, mode: "insensitive" } },
            ],
          },
        });

        if (card) {
          const key = `${card.id}:${entry.section}`;
          if (seen.has(key)) continue;
          seen.add(key);
          await prisma.deckCard.create({
            data: {
              deckId: deck.id,
              cardId: card.id,
              quantity: entry.quantity,
              section: entry.section,
            },
          });
          cardCount++;
        }
      }

      console.log(`  ${slug} (${cardCount} cards)`);
      totalCreated++;
    }
  }

  console.log(`\nDone! Created ${totalCreated} deck records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
