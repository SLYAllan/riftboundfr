import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const p = new PrismaClient();

interface IndexEntry {
  id: string;
  legend: string;
  player: string;
  placement: number;
  file: string;
}

interface DeckFile {
  id: string;
  legend: string;
  champion?: string;
  player: string;
  tournament: string;
  placement: number;
  domains: string[];
  mainDeck: { name: string; quantity: number }[];
  runes: { name: string; quantity: number }[];
  battlefields: { name: string; quantity: number }[];
  sideDeck: { name: string; quantity: number }[];
}

const rqs: Record<string, { filePattern: string; slug: string; name: string }> = {
  "atlanta-rq": { filePattern: "atlanta-rq", slug: "best-of-atlanta-rq-2026", name: "Atlanta Regional Qualifier" },
  "houston-rq": { filePattern: "houston-rq", slug: "best-of-houston-rq-2025", name: "Houston Regional Qualifier" },
  "bologna-rq": { filePattern: "bologna-rq", slug: "best-of-bologna-rq-2026", name: "Bologna Regional Qualifier" },
  "las-vegas-rq": { filePattern: "las-vegas-rq", slug: "best-of-las-vegas-rq-2026", name: "Las Vegas Regional Qualifier" },
  "lille-rq": { filePattern: "lille-rq", slug: "best-of-lille-rq-2026", name: "Lille Regional Qualifier" },
};

function uid() {
  return randomBytes(6).toString("hex");
}

function buildDeckCode(deck: DeckFile): string {
  const lines: string[] = [];
  if (deck.champion) {
    lines.push("== Legend ==");
    lines.push(`1x ${deck.champion}`);
    lines.push("");
  }
  lines.push("== Main Deck ==");
  for (const c of deck.mainDeck) lines.push(`${c.quantity}x ${c.name}`);
  lines.push("");
  lines.push("== Runes ==");
  for (const c of deck.runes) lines.push(`${c.quantity}x ${c.name}`);
  lines.push("");
  lines.push("== Battlefield ==");
  for (const c of deck.battlefields) lines.push(`${c.quantity}x ${c.name}`);
  if (deck.sideDeck?.length) {
    lines.push("");
    lines.push("== Side Deck ==");
    for (const c of deck.sideDeck) lines.push(`${c.quantity}x ${c.name}`);
  }
  return lines.join("\n");
}

function ordinal(n: number): string {
  if (n === 1) return "1er";
  return `${n}e`;
}

async function main() {
  const idx: IndexEntry[] = JSON.parse(
    fs.readFileSync("data/decklists-index.json", "utf-8"),
  );

  for (const [key, rq] of Object.entries(rqs)) {
    const decks = idx.filter((d) => d.file.includes(rq.filePattern));
    const legendsInData = new Map<string, IndexEntry[]>();
    for (const d of decks) {
      if (!legendsInData.has(d.legend)) legendsInData.set(d.legend, []);
      legendsInData.get(d.legend)!.push(d);
    }

    const article = await p.article.findFirst({
      where: { slug: rq.slug },
      select: { id: true, blocks: true },
    });
    if (!article) {
      console.log(`⚠ Article not found: ${rq.slug}`);
      continue;
    }

    const blocks = (article.blocks as any[]) || [];
    const deckBlocks = blocks.filter((b: any) => b.type === "decklist");
    const articleLegends = new Set(
      deckBlocks.map((b: any) => b.legendName as string),
    );

    const missing = [...legendsInData.keys()].filter(
      (l) => !articleLegends.has(l),
    );

    if (missing.length === 0) {
      console.log(`✓ ${key}: all legends covered`);
      continue;
    }

    console.log(`${key}: adding ${missing.length} missing legends`);

    const newBlocks: any[] = [];

    for (const legendName of missing.sort()) {
      const entries = legendsInData.get(legendName)!;
      entries.sort((a, b) => a.placement - b.placement);
      const best = entries[0];

      const filePath = path.join("data/decklists", best.file);
      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠ File not found: ${filePath}`);
        continue;
      }

      const deckData: DeckFile = JSON.parse(
        fs.readFileSync(filePath, "utf-8"),
      );
      const deckCode = buildDeckCode(deckData);
      const domains = deckData.domains?.join("/") || "";
      const shortName = legendName.split(",")[0].trim();

      newBlocks.push({
        id: uid(),
        type: "text",
        content: `### ${shortName} de ${best.player} — ${ordinal(best.placement)} place`,
      });

      newBlocks.push({
        id: uid(),
        type: "text",
        content: `Meilleur deck ${shortName} du tournoi (${domains}). ${entries.length} exemplaire${entries.length > 1 ? "s" : ""} dans le field.`,
      });

      newBlocks.push({
        id: uid(),
        type: "decklist",
        deckCode,
        deckName: `${legendName} — Best of ${rq.name}`,
        legendName,
        playerName: best.player,
        context: `${ordinal(best.placement)} — ${rq.name} (${domains})`,
      });

      console.log(
        `  + ${legendName} — ${ordinal(best.placement)} (${best.player})`,
      );
    }

    const updatedBlocks = [...blocks, ...newBlocks];
    await p.article.update({
      where: { id: article.id },
      data: { blocks: updatedBlocks },
    });
    console.log(
      `  ✓ Updated ${rq.slug}: ${blocks.length} → ${updatedBlocks.length} blocks`,
    );
  }

  await p.$disconnect();
}

main().catch(console.error);
