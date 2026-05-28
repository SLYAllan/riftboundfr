import fs from "fs";
import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

interface IndexEntry {
  id: string;
  legend: string;
  player: string;
  placement: number;
  file: string;
}

const rqs = ["atlanta-rq", "houston-rq", "bologna-rq", "las-vegas-rq", "lille-rq"];
const slugMap: Record<string, string> = {
  "atlanta-rq": "best-of-atlanta-rq-2026",
  "houston-rq": "best-of-houston-rq-2025",
  "bologna-rq": "best-of-bologna-rq-2026",
  "las-vegas-rq": "best-of-las-vegas-rq-2026",
  "lille-rq": "best-of-lille-rq-2026",
};

async function main() {
  const idx: IndexEntry[] = JSON.parse(
    fs.readFileSync("data/decklists-index.json", "utf-8"),
  );

  for (const rq of rqs) {
    const decks = idx.filter((d) => d.file.includes(rq));
    const legends = new Set(decks.map((d) => d.legend));

    const article = await p.article.findFirst({
      where: { slug: slugMap[rq] },
      select: { blocks: true },
    });
    const blocks = (article?.blocks as any[]) || [];
    const deckBlocks = blocks.filter((b: any) => b.type === "decklist");
    const articleLegends = new Set(
      deckBlocks.map((b: any) => b.legendName as string),
    );

    const missing = [...legends].filter((l) => !articleLegends.has(l));
    console.log(
      `${rq}: ${legends.size} legends in data, ${articleLegends.size} in article, ${missing.length} missing`,
    );
    if (missing.length > 0) console.log("  Missing:", missing.join(", "));
  }

  // Also check Sydney
  const sydneyDecks = idx.filter((d) => !rqs.some((rq) => d.file.includes(rq)));
  // Sydney is the remaining non-Chinese data
  const sydneyArticle = await p.article.findFirst({
    where: { slug: "best-of-sydney-rq-2026" },
    select: { blocks: true },
  });
  if (sydneyArticle) {
    const blocks = (sydneyArticle.blocks as any[]) || [];
    const deckBlocks = blocks.filter((b: any) => b.type === "decklist");
    const articleLegends = new Set(
      deckBlocks.map((b: any) => b.legendName as string),
    );
    console.log(
      `sydney-rq: ${articleLegends.size} legends in article`,
    );
  }

  await p.$disconnect();
}

main().catch(console.error);
