// Seed en masse les decklists d'un tournoi depuis data/decklists/**/<prefixe>-*.json.
//
//   npx tsx scripts/seed-tournament-decks.ts <prefixe> "<contexte tournoi>" <set> "<tags,csv>"
//   npx tsx scripts/seed-tournament-decks.ts s3-national "S3 National Open (2026-07-19)" Unleashed "national,s3,unleashed"
//
// Convention reprise des tournois déjà en base : les decks de masse ont
// tournamentTier = null, seul le top cut (best-of) reçoit S/A/B/C/D.
//
// Toutes les cartes sont chargées une fois en mémoire : sur 1 957 decks, une requête
// par carte ferait ~50 000 allers-retours.
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseDeckCode } from "../src/lib/deck-code";

const prisma = new PrismaClient();

type DeckJson = {
  id: string; legend: string; champion: string | null; player: string | null;
  placement: number | null; domains: string[]; record?: string | null; source?: string | null;
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>; battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
};

function buildDeckCode(d: DeckJson): string {
  // Le champion est lié à part (section "legend") : ne pas l'émettre ici, sinon
  // parseDeckCode le compte deux fois.
  const parts: string[] = ["== Main Deck =="];
  for (const c of d.mainDeck) {
    if ((c.type ?? "").toLowerCase() === "champion") continue;
    parts.push(`${c.quantity}x ${c.name}`);
  }
  const runes = Object.entries(d.runes ?? {}).map(
    ([n, q]) => `${q}x ${n.endsWith(" Rune") ? n : n + " Rune"}`,
  );
  if (runes.length) parts.push("== Runes ==", ...runes);
  if (d.battlefields.length) {
    parts.push("== Battlefield ==", ...d.battlefields.map((b) => `1x ${b}`));
  }
  const side = d.sideDeck ?? [];
  if (side.length) parts.push("== Side Deck ==", ...side.map((s) => `${s.quantity}x ${s.name}`));
  return parts.join("\n");
}

const ordinal = (n: number) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);

function load(prefix: string): DeckJson[] {
  const root = join(__dirname, "../data/decklists");
  const out: DeckJson[] = [];
  for (const dir of readdirSync(root)) {
    let files: string[] = [];
    try {
      files = readdirSync(join(root, dir)).filter((f) => f.startsWith(`${prefix}-`) && f.endsWith(".json"));
    } catch {
      continue; // pas un dossier
    }
    for (const f of files) out.push(JSON.parse(readFileSync(join(root, dir, f), "utf-8")));
  }
  return out.sort((a, b) => (a.placement ?? 1e9) - (b.placement ?? 1e9));
}

async function main() {
  const [prefix, context, setTag, tagsCsv] = process.argv.slice(2);
  if (!prefix || !context || !setTag) {
    console.error('usage : seed-tournament-decks.ts <prefixe> "<contexte>" <set> "<tags,csv>"');
    process.exit(2);
  }
  const tags = (tagsCsv ?? "").split(",").map((t) => t.trim()).filter(Boolean);

  const decks = load(prefix);
  if (decks.length === 0) {
    console.error(`aucune decklist ${prefix}-*.json dans data/decklists`);
    process.exit(1);
  }

  // Index cartes : nom, cleanName et variante "Nom - Titre" (les listes écrivent "Nom, Titre").
  const cards = await prisma.card.findMany({ select: { id: true, name: true, cleanName: true, riftboundId: true, type: true } });
  const byName = new Map<string, (typeof cards)[number]>();
  const legendByName = new Map<string, (typeof cards)[number]>();
  for (const c of cards) {
    for (const key of [c.name, c.cleanName, c.name.replace(/ - /g, ", ")]) {
      if (key && !byName.has(key.toLowerCase())) byName.set(key.toLowerCase(), c);
    }
    if (c.type === "Legend" && !legendByName.has(c.name.toLowerCase())) legendByName.set(c.name.toLowerCase(), c);
  }
  // riftdecks tronque certains noms de champion. Sans cet alias, 7 decks du National
  // perdaient leur champion en silence (108 listes concernées tous tournois confondus).
  const ALIASES: Record<string, string> = {
    "yi, meditative": "Master Yi, Meditative",
  };
  const find = (name: string) => {
    const alias = ALIASES[name.toLowerCase()];
    const n = alias ?? name;
    return byName.get(n.toLowerCase()) ?? byName.get(n.replace(/, /g, " - ").toLowerCase());
  };

  // Rejouable : on repart d'un état propre pour ce préfixe.
  const old = await prisma.deck.findMany({ where: { slug: { startsWith: `${prefix}-` } }, select: { id: true } });
  if (old.length) {
    const ids = old.map((d) => d.id);
    await prisma.deckCard.deleteMany({ where: { deckId: { in: ids } } });
    await prisma.deck.deleteMany({ where: { id: { in: ids } } });
    console.log(`${old.length} decks ${prefix}-* supprimés avant re-seed`);
  }

  const notFound = new Map<string, number>();
  let done = 0;

  for (const d of decks) {
    const legendCard = legendByName.get(d.legend.toLowerCase());
    const place = d.placement;
    const who = d.player ?? "joueur inconnu";
    const deck = await prisma.deck.create({
      data: {
        title: `${d.legend} — ${who}${place ? ` (${ordinal(place)})` : ""}`,
        slug: d.id,
        legendId: legendCard?.riftboundId ?? d.legend,
        legendName: d.legend,
        description: `${place ? `${ordinal(place)} au ` : ""}${context} par ${who}${d.record ? ` (${d.record})` : ""}. ${d.domains.join("/")}.`,
        format: "constructed",
        setTag,
        tags,
        featured: false,
        published: true,
        tournamentContext: context,
        tournamentTier: null,
        placement: place ? ordinal(place) : null,
        record: d.record ?? null,
        playerName: d.player,
        sourceUrl: d.source ?? null,
      },
    });

    const rows: { deckId: string; cardId: string; quantity: number; section: string }[] = [];
    const seen = new Set<string>();
    const push = (cardId: string, quantity: number, section: string) => {
      const key = `${cardId}:${section}`;
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({ deckId: deck.id, cardId, quantity, section });
    };

    if (legendCard) push(legendCard.id, 1, "legend");
    if (d.champion) {
      const champ = find(d.champion);
      if (champ) push(champ.id, 1, "legend");
      else notFound.set(d.champion, (notFound.get(d.champion) ?? 0) + 1);
    }
    for (const entry of parseDeckCode(buildDeckCode(d)).entries) {
      const card = find(entry.name);
      if (card) push(card.id, entry.quantity, entry.section);
      else notFound.set(entry.name, (notFound.get(entry.name) ?? 0) + 1);
    }
    await prisma.deckCard.createMany({ data: rows });

    if (++done % 200 === 0) console.log(`  ${done}/${decks.length}`);
  }

  console.log(`\n${done} decks seedés pour ${context}.`);
  if (notFound.size) {
    console.log(`\n⚠️ ${notFound.size} noms de cartes introuvables en base :`);
    for (const [n, c] of [...notFound.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
      console.log(`    ${c}x  ${n}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
