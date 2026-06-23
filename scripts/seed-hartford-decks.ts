import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseDeckCode } from "../src/lib/deck-code";

const prisma = new PrismaClient();

type DeckJson = {
  id: string; legend: string; champion: string | null; player: string;
  placement: number; domains: string[]; record?: string; source?: string;
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>; battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
};

function buildDeckCode(d: DeckJson): string {
  // Le champion est lié séparément (section "legend"), comme les seeds best-of.
  // On ne l'émet PAS dans le deckCode, sinon parseDeckCode le rajoute en doublon.
  const parts: string[] = [];
  parts.push("== Main Deck ==");
  for (const c of d.mainDeck) {
    if ((c.type ?? "").toLowerCase() === "champion") continue;
    parts.push(`${c.quantity}x ${c.name}`);
  }
  const runes = Object.entries(d.runes ?? {}).map(([n, q]) => `${q}x ${n.endsWith(" Rune") ? n : n + " Rune"}`);
  if (runes.length) { parts.push("== Runes =="); parts.push(...runes); }
  if (d.battlefields.length) { parts.push("== Battlefield =="); for (const b of d.battlefields) parts.push(`1x ${b}`); }
  const side = d.sideDeck ?? [];
  if (side.length) { parts.push("== Side Deck =="); for (const s of side) parts.push(`${s.quantity}x ${s.name}`); }
  return parts.join("\n");
}

const ordinal = (n: number) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);
const tierFor = (n: number) => (n === 1 ? "S" : n <= 4 ? "A" : "B");

function loadHartfordDecks(): DeckJson[] {
  const root = join(__dirname, "../data/decklists");
  const out: DeckJson[] = [];
  for (const dir of readdirSync(root)) {
    const full = join(root, dir);
    let files: string[] = [];
    try { files = readdirSync(full).filter((f) => f.startsWith("hartford-rq-") && f.endsWith(".json")); } catch { continue; }
    for (const f of files) out.push(JSON.parse(readFileSync(join(full, f), "utf-8")));
  }
  return out.sort((a, b) => a.placement - b.placement);
}

async function main() {
  const decks = loadHartfordDecks();
  console.log(`Seeding ${decks.length} Hartford Top 8 decks (cat=tournoi, featured:false)...`);
  const notFound: string[] = [];

  for (const d of decks) {
    const legendCard = await prisma.card.findFirst({
      where: { type: "Legend", name: { contains: d.legend.split(",")[0].trim(), mode: "insensitive" } },
    });
    const slug = `hartford-rq-${d.placement}-${d.player.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "")}`;
    const existing = await prisma.deck.findUnique({ where: { slug } });
    if (existing) {
      await prisma.deckCard.deleteMany({ where: { deckId: existing.id } });
      await prisma.deck.delete({ where: { id: existing.id } });
    }

    const deck = await prisma.deck.create({
      data: {
        title: `${d.legend} — ${d.player} (${ordinal(d.placement)} Hartford)`,
        slug,
        legendId: legendCard?.riftboundId ?? d.legend,
        legendName: d.legend,
        description: `${ordinal(d.placement)} au RQ Hartford par ${d.player}${d.record ? ` (${d.record})` : ""}. ${d.domains.join("/")}.`,
        format: "constructed",
        setTag: "Unleashed",
        tags: ["hartford", "rq", "top-8", "unleashed"],
        featured: false,
        published: true,
        tournamentContext: "RQ Hartford 2026",
        tournamentTier: tierFor(d.placement),
        placement: ordinal(d.placement),
        record: d.record ?? null,
        playerName: d.player,
        sourceUrl: d.source ?? null,
      },
    });

    const seen = new Set<string>();
    const legForCard = (await prisma.card.findFirst({ where: { type: "Legend", name: { equals: d.legend, mode: "insensitive" } } })) ?? legendCard;
    if (legForCard) { await prisma.deckCard.create({ data: { deckId: deck.id, cardId: legForCard.id, quantity: 1, section: "legend" } }); seen.add(`${legForCard.id}:legend`); }
    if (d.champion) {
      const champDash = d.champion.replace(/, /g, " - ");
      const champCard = await prisma.card.findFirst({ where: { OR: [
        { name: { equals: d.champion, mode: "insensitive" } },
        { name: { equals: champDash, mode: "insensitive" } },
        { cleanName: { equals: d.champion, mode: "insensitive" } },
      ] } });
      if (champCard && !seen.has(`${champCard.id}:legend`)) { await prisma.deckCard.create({ data: { deckId: deck.id, cardId: champCard.id, quantity: 1, section: "legend" } }); seen.add(`${champCard.id}:legend`); }
    }

    const parsed = parseDeckCode(buildDeckCode(d));
    let created = 0;
    for (const entry of parsed.entries) {
      const dashName = entry.name.replace(/, /g, " - ");
      const card = await prisma.card.findFirst({ where: { OR: [
        { name: { equals: entry.name, mode: "insensitive" } },
        { name: { equals: dashName, mode: "insensitive" } },
        { cleanName: { equals: entry.name, mode: "insensitive" } },
        { cleanName: { equals: dashName, mode: "insensitive" } },
      ] } });
      if (card) {
        const key = `${card.id}:${entry.section}`;
        if (seen.has(key)) continue;
        seen.add(key);
        await prisma.deckCard.create({ data: { deckId: deck.id, cardId: card.id, quantity: entry.quantity, section: entry.section } });
        created++;
      } else { notFound.push(`${d.legend}: "${entry.name}"`); }
    }
    console.log(`  Deck: ${slug} (${created} cartes liées)`);
  }

  if (notFound.length) { console.log(`\n⚠️ ${notFound.length} cartes non trouvées :`); for (const n of [...new Set(notFound)]) console.log(`    ${n}`); }
  console.log(`\nDone! ${decks.length} decks Hartford (cat=tournoi) créés.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
