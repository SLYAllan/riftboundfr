import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ParsedDeckEntry {
  quantity: number;
  name: string;
  section: "legend" | "champion" | "main" | "rune" | "battlefield" | "side";
}

const SECTION_HEADERS: Record<string, ParsedDeckEntry["section"]> = {
  legend: "legend",
  legends: "legend",
  champion: "champion",
  "main deck": "main",
  maindeck: "main",
  main: "main",
  deck: "main",
  runes: "rune",
  rune: "rune",
  "rune pool": "rune",
  battlefield: "battlefield",
  battlefields: "battlefield",
  side: "side",
  "side deck": "side",
  sideboard: "side",
};

function parseDeckCode(code: string): ParsedDeckEntry[] {
  const lines = code.split("\n").map((l) => l.trim()).filter(Boolean);
  const entries: ParsedDeckEntry[] = [];
  let currentSection: ParsedDeckEntry["section"] = "main";

  for (const line of lines) {
    if (line.startsWith("//") || line.startsWith("#")) continue;
    const sectionMatch = line.match(/^==\s*(.+?)\s*==$/) ?? line.match(/^([A-Za-z\s]+):$/);
    if (sectionMatch) {
      const key = sectionMatch[1].trim().toLowerCase();
      currentSection = SECTION_HEADERS[key] ?? "main";
      continue;
    }
    const cardMatch = line.match(/^(\d+)x?\s+(.+?)(?:\s+\(([^)]+)\))?$/i);
    if (cardMatch) {
      entries.push({
        quantity: parseInt(cardMatch[1], 10),
        name: cardMatch[2].trim(),
        section: currentSection,
      });
    }
  }

  return entries;
}

function toBase64Url(str: string): string {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

interface DeckCodeEntry {
  cardId: string;
  quantity: number;
}

function encodeDeck(deck: {
  legend: DeckCodeEntry | null;
  champion: DeckCodeEntry | null;
  main: DeckCodeEntry[];
  rune: DeckCodeEntry[];
  battlefield: DeckCodeEntry[];
  side: DeckCodeEntry[];
}): string {
  const encodeEntries = (entries: DeckCodeEntry[]): string =>
    entries.map((e) => (e.quantity === 1 ? e.cardId : `${e.cardId}.${e.quantity}`)).join(",");

  const parts: string[] = [];
  if (deck.legend) parts.push(`L:${deck.legend.cardId}`);
  if (deck.champion) parts.push(`C:${deck.champion.cardId}`);
  if (deck.main.length) parts.push(`M:${encodeEntries(deck.main)}`);
  if (deck.rune.length) parts.push(`R:${encodeEntries(deck.rune)}`);
  if (deck.battlefield.length) parts.push(`B:${encodeEntries(deck.battlefield)}`);
  if (deck.side.length) parts.push(`S:${encodeEntries(deck.side)}`);
  return toBase64Url(parts.join("|"));
}

function isBinaryDeckCode(code: string): boolean {
  return !code.includes("\n") && !code.includes("==") && code.length > 10;
}

async function main() {
  const allCards = await prisma.card.findMany({
    select: { id: true, riftboundId: true, name: true, cleanName: true, type: true },
  });

  const cardByName = new Map<string, (typeof allCards)[0]>();
  for (const c of allCards) {
    const key = c.name.toLowerCase();
    if (!cardByName.has(key)) cardByName.set(key, c);
    const dash = key.replace(/, /g, " - ");
    if (!cardByName.has(dash)) cardByName.set(dash, c);
    const noApo = key.replace(/['’]/g, "");
    if (!cardByName.has(noApo)) cardByName.set(noApo, c);
    if (c.cleanName) {
      const ck = c.cleanName.toLowerCase();
      if (!cardByName.has(ck)) cardByName.set(ck, c);
    }
  }

  function resolveCard(name: string) {
    const key = name.toLowerCase();
    return cardByName.get(key)
      ?? cardByName.get(key.replace(/, /g, " - "))
      ?? cardByName.get(key.replace(/['’]/g, ""));
  }

  async function resolveLegend(legendName: string) {
    if (!legendName) return null;
    const key = legendName.toLowerCase();
    const dash = key.replace(/, /g, " - ");
    const prefix = legendName.split(",")[0].split(" -")[0].trim().toLowerCase();
    for (const c of allCards) {
      if (c.type !== "Legend") continue;
      const cn = c.name.toLowerCase();
      if (cn === key || cn === dash || cn.startsWith(prefix)) return c;
    }
    return null;
  }

  const articles = await prisma.article.findMany({
    select: { id: true, title: true, blocks: true },
  });

  let totalConverted = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const article of articles) {
    const blocks = Array.isArray(article.blocks) ? article.blocks : [];
    const deckBlocks = blocks.filter((b: any) => b.type === "decklist");
    if (deckBlocks.length === 0) continue;

    let changed = false;
    const updatedBlocks = [...blocks];

    for (let i = 0; i < updatedBlocks.length; i++) {
      const block = updatedBlocks[i] as any;
      if (block.type !== "decklist") continue;

      if (isBinaryDeckCode(block.deckCode)) {
        totalSkipped++;
        continue;
      }

      const entries = parseDeckCode(block.deckCode);
      if (entries.length === 0) {
        totalFailed++;
        continue;
      }

      const legendEntries: DeckCodeEntry[] = [];
      const championEntries: DeckCodeEntry[] = [];
      const mainEntries: DeckCodeEntry[] = [];
      const runeEntries: DeckCodeEntry[] = [];
      const battlefieldEntries: DeckCodeEntry[] = [];
      const sideEntries: DeckCodeEntry[] = [];
      const unresolved: string[] = [];

      for (const entry of entries) {
        const card = resolveCard(entry.name);
        if (!card) {
          unresolved.push(entry.name);
          continue;
        }
        const de: DeckCodeEntry = { cardId: card.riftboundId, quantity: entry.quantity };
        switch (entry.section) {
          case "legend": legendEntries.push(de); break;
          case "champion": championEntries.push(de); break;
          case "main": mainEntries.push(de); break;
          case "rune": runeEntries.push(de); break;
          case "battlefield": battlefieldEntries.push(de); break;
          case "side": sideEntries.push(de); break;
        }
      }

      let legend: DeckCodeEntry | null = legendEntries[0] ?? null;
      let champion: DeckCodeEntry | null = championEntries[0] ?? null;

      if (!legend && block.legendName) {
        const lc = await resolveLegend(block.legendName);
        if (lc) legend = { cardId: lc.riftboundId, quantity: 1 };
      }

      if (unresolved.length > 0) {
        console.log(`  WARN [${article.title}] block ${block.id}: ${unresolved.length} unresolved: ${unresolved.join(", ")}`);
      }

      const code = encodeDeck({
        legend,
        champion,
        main: mainEntries,
        rune: runeEntries,
        battlefield: battlefieldEntries,
        side: sideEntries,
      });

      updatedBlocks[i] = { ...block, deckCode: code };
      changed = true;
      totalConverted++;
    }

    if (changed) {
      await prisma.article.update({
        where: { id: article.id },
        data: { blocks: updatedBlocks },
      });
      console.log(`OK [${article.title}] — ${deckBlocks.length} blocks`);
    }
  }

  console.log(`\nRésultat: ${totalConverted} convertis, ${totalFailed} échoués, ${totalSkipped} déjà binaires`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
