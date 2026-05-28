import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

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

interface ParsedDeck {
  legend: string;
  champion: string | null;
  player: string;
  placement: number | null;
  mainDeck: { name: string; quantity: number }[];
  runes: { name: string; quantity: number }[];
  battlefields: { name: string; quantity: number }[];
  sideboard: { name: string; quantity: number }[];
  sourceUrl: string;
}

function parseDeckMarkdown(md: string, fileName: string): ParsedDeck | null {
  const lines = md.split("\n");

  let legend = "";
  for (const line of lines) {
    const m = line.match(/\[([A-Z][^[\]]+(?:,\s[A-Z][^[\]]+)?)\]\(https:\/\/riftdecks\.com\/legends\/constructed\//);
    if (m) { legend = m[1]; break; }
  }
  if (!legend) return null;

  let player = "";
  const pm = md.match(/decklist by ([^.]+)\./);
  if (pm) player = pm[1].trim();

  let placement: number | null = null;
  const plm = md.match(/(\d+)(?:st|nd|rd|th) at/);
  if (plm) placement = parseInt(plm[1]);

  let currentSection = "";
  const mainDeck: { name: string; quantity: number }[] = [];
  const runes: { name: string; quantity: number }[] = [];
  const battlefields: { name: string; quantity: number }[] = [];
  const sideboard: { name: string; quantity: number }[] = [];
  let champion: string | null = null;

  for (const line of lines) {
    if (line.includes("legend (")) { currentSection = "legend"; continue; }
    if (line.includes("champion (")) { currentSection = "champion"; continue; }
    if (line.includes("unit (")) { currentSection = "unit"; continue; }
    if (line.includes("gear (")) { currentSection = "gear"; continue; }
    if (line.includes("spell (")) { currentSection = "spell"; continue; }
    if (line.includes("battlefields (")) { currentSection = "battlefield"; continue; }
    if (line.includes("runes (")) { currentSection = "rune"; continue; }
    if (line.includes("sideboard (")) { currentSection = "sideboard"; continue; }

    const cm = line.match(/!\[(\w+)\].*?\*\*(\d+)\*\*.*?\[([^\]]+)\]\(https:\/\/riftdecks\.com\/cards\//);
    if (!cm) continue;

    const quantity = parseInt(cm[2]);
    const name = cm[3];

    if (currentSection === "champion") { champion = name; continue; }
    if (currentSection === "legend") continue;

    if (currentSection === "rune") runes.push({ name, quantity });
    else if (currentSection === "battlefield") battlefields.push({ name, quantity: 1 });
    else if (currentSection === "sideboard") sideboard.push({ name, quantity });
    else mainDeck.push({ name, quantity });
  }

  const deckId = fileName.replace(".md", "");
  return {
    legend,
    champion,
    player,
    placement,
    mainDeck,
    runes,
    battlefields,
    sideboard,
    sourceUrl: `https://riftdecks.com/riftbound-metagame/${deckId}`,
  };
}

interface TournamentConfig {
  name: string;
  rawDir: string;
  setTag: string;
  date: string;
  playerCount: number;
}

const tournaments: TournamentConfig[] = [
  {
    name: "Fuzhou Regional Qualifier",
    rawDir: "fuzhou-regional",
    setTag: "Spiritforged",
    date: "2026-01-18",
    playerCount: 511,
  },
  {
    name: "Suzhou Regional Qualifier",
    rawDir: "suzhou-regional",
    setTag: "Unleashed",
    date: "2026-05-17",
    playerCount: 640,
  },
];

async function main() {
  const allCards = await prisma.card.findMany({
    select: { id: true, name: true, cleanName: true, type: true, riftboundId: true },
  });

  const cardByName = new Map<string, typeof allCards[0]>();
  for (const c of allCards) {
    const key = c.name.toLowerCase();
    if (!cardByName.has(key)) cardByName.set(key, c);
    const noApostrophe = key.replace(/['’]/g, "");
    if (!cardByName.has(noApostrophe)) cardByName.set(noApostrophe, c);
    if (c.cleanName) {
      const ck = c.cleanName.toLowerCase();
      if (!cardByName.has(ck)) cardByName.set(ck, c);
      const ckNoApo = ck.replace(/['’]/g, "");
      if (!cardByName.has(ckNoApo)) cardByName.set(ckNoApo, c);
    }
  }

  const manualAliases: Record<string, string> = {
    "mischievous marai": "mischevious marai",
  };

  function resolveCard(name: string) {
    const key = name.toLowerCase();
    const dash = key.replace(/, /g, " - ");
    const noApo = key.replace(/['’]/g, "");
    const dashNoApo = dash.replace(/['’]/g, "");
    return cardByName.get(key)
      ?? cardByName.get(dash)
      ?? cardByName.get(noApo)
      ?? cardByName.get(dashNoApo)
      ?? cardByName.get(key.replace(/['’]/g, "’"))
      ?? (manualAliases[key] ? cardByName.get(manualAliases[key]) : undefined);
  }

  for (const config of tournaments) {
    console.log(`\n=== ${config.name} ===`);

    const existingDecks = await prisma.deck.findMany({
      where: { tournamentContext: config.name },
      select: { id: true, slug: true },
    });

    if (existingDecks.length > 0) {
      console.log(`  Suppression de ${existingDecks.length} decks existants...`);
      await prisma.deckCard.deleteMany({
        where: { deckId: { in: existingDecks.map((d) => d.id) } },
      });
      await prisma.deck.deleteMany({
        where: { id: { in: existingDecks.map((d) => d.id) } },
      });
    }

    const rawDir = path.join(__dirname, "../data/raw-scrapes", config.rawDir);
    const files = fs.readdirSync(rawDir).filter((f) => f.startsWith("deck-") && f.endsWith(".md"));
    console.log(`  ${files.length} fichiers à parser`);

    let created = 0;
    let failed = 0;
    let noCards = 0;
    const slugsSeen = new Set<string>();
    const unresolvedNames = new Set<string>();

    for (const file of files) {
      const md = fs.readFileSync(path.join(rawDir, file), "utf-8");
      const parsed = parseDeckMarkdown(md, file);
      if (!parsed) { failed++; continue; }

      const legendCard = resolveCard(parsed.legend);
      if (!legendCard) {
        console.log(`  SKIP ${file}: légende introuvable "${parsed.legend}"`);
        failed++;
        continue;
      }

      const legendFirst = parsed.legend.split(",")[0].trim();
      const playerSlug = slugify(parsed.player || "unknown").slice(0, 30) || "unknown";
      const placementStr = parsed.placement ? `${parsed.placement}th` : "unranked";
      let slug = slugify(`${config.name}-${placementStr}-${playerSlug}-${legendFirst}`);

      let suffix = 0;
      const baseSlug = slug;
      while (slugsSeen.has(slug)) {
        suffix++;
        slug = `${baseSlug}-${suffix}`;
      }
      slugsSeen.add(slug);

      const title = parsed.placement
        ? `${placementStr} ${config.name} — ${legendFirst} (${parsed.player || "?"})`
        : `${config.name} — ${legendFirst} (${parsed.player || "?"})`;

      const deckCards: { cardId: string; quantity: number; section: string }[] = [];

      deckCards.push({ cardId: legendCard.id, quantity: 1, section: "legend" });

      if (parsed.champion) {
        const cc = resolveCard(parsed.champion);
        if (cc) deckCards.push({ cardId: cc.id, quantity: 1, section: "legend" });
        else unresolvedNames.add(parsed.champion);
      }

      for (const entry of parsed.mainDeck) {
        const c = resolveCard(entry.name);
        if (c) deckCards.push({ cardId: c.id, quantity: entry.quantity, section: "main" });
        else unresolvedNames.add(entry.name);
      }

      for (const entry of parsed.runes) {
        const c = resolveCard(entry.name);
        if (c) deckCards.push({ cardId: c.id, quantity: entry.quantity, section: "rune" });
        else unresolvedNames.add(entry.name);
      }

      for (const entry of parsed.battlefields) {
        const c = resolveCard(entry.name);
        if (c) deckCards.push({ cardId: c.id, quantity: 1, section: "battlefield" });
        else unresolvedNames.add(entry.name);
      }

      for (const entry of parsed.sideboard) {
        const c = resolveCard(entry.name);
        if (c) deckCards.push({ cardId: c.id, quantity: entry.quantity, section: "side" });
        else unresolvedNames.add(entry.name);
      }

      if (deckCards.length <= 1) { noCards++; continue; }

      const seen = new Set<string>();
      const uniqueCards = deckCards.filter((dc) => {
        const key = `${dc.cardId}:${dc.section}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      try {
        const deck = await prisma.deck.create({
          data: {
            slug,
            title,
            legendId: legendCard.riftboundId,
            legendName: parsed.legend,
            format: "constructed",
            setTag: config.setTag,
            published: true,
            tournamentContext: config.name,
            placement: parsed.placement ? placementStr : null,
            playerName: parsed.player || null,
            sourceUrl: parsed.sourceUrl,
          },
        });

        await prisma.deckCard.createMany({
          data: uniqueCards.map((dc) => ({
            deckId: deck.id,
            cardId: dc.cardId,
            quantity: dc.quantity,
            section: dc.section,
          })),
        });

        created++;
      } catch (err: any) {
        if (err.code === "P2002") {
          console.log(`  DUP slug: ${slug}`);
        } else {
          console.log(`  ERROR ${file}: ${err.message}`);
        }
        failed++;
      }

      if (created % 50 === 0 && created > 0) {
        console.log(`  ... ${created} créés`);
      }
    }

    console.log(`  RÉSULTAT: ${created} créés, ${failed} échoués, ${noCards} sans cartes`);
    if (unresolvedNames.size > 0) {
      console.log(`  Cartes non résolues (${unresolvedNames.size}):`);
      for (const n of [...unresolvedNames].sort()) console.log(`    - ${n}`);
    }
  }

  console.log("\n=== Terminé ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
