import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const TOURNAMENT_CTX: Record<string, string> = {
  // Consolidation: les fichiers nomment "Suzhou/Fuzhou Regional" mais le tournoi
  // affiché (tournament-flags) est "... Regional Qualifier" → on mappe pour éviter
  // un contexte dupliqué à chaque seed.
  "Suzhou Regional": "Suzhou Regional Qualifier",
  "Fuzhou Regional": "Fuzhou Regional Qualifier",
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ordinal(n: number, ctx: string): string {
  const isFrench = ["Bologna", "Lille"].some((c) => ctx.includes(c));
  if (isFrench) return n === 1 ? "1er" : `${n}e`;
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

async function main() {
  const cardsByName = new Map<string, { id: string; type: string }>();
  const allCards = await prisma.card.findMany({
    select: { id: true, name: true, type: true },
  });
  for (const c of allCards) {
    cardsByName.set(c.name.toLowerCase(), { id: c.id, type: c.type });
  }

  function findCard(name: string): { id: string; type: string } | undefined {
    const lower = name.toLowerCase();
    return cardsByName.get(lower) ?? cardsByName.get(lower.replace(",", " -"));
  }

  const legends = allCards.filter((c) => c.type === "Legend");
  function findLegendId(legendName: string): string | null {
    const first = legendName.split(",")[0].trim().toLowerCase();
    const match = legends.find((l) => l.name.toLowerCase().includes(first));
    return match?.id ?? null;
  }

  const existing = await prisma.deck.findMany({
    select: { playerName: true, tournamentContext: true, legendName: true, placement: true },
  });
  const existingSet = new Set(
    existing.map(
      (d) => `${d.tournamentContext}|${d.playerName}|${d.legendName}|${d.placement ?? ""}`,
    ),
  );

  const baseDir = path.join(process.cwd(), "data", "decklists");
  const legendDirs = fs.readdirSync(baseDir).filter((d) =>
    fs.statSync(path.join(baseDir, d)).isDirectory(),
  );

  // Si des slugs sont passés en argument, ne seeder QUE les fichiers de ces tournois
  // (évite de re-seeder les tournois existants depuis des JSON désynchronisés du DB).
  const ONLY = process.argv.slice(2);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const dir of legendDirs) {
    const dirPath = path.join(baseDir, dir);
    const files = fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith(".json"))
      .filter((f) => ONLY.length === 0 || ONLY.some((s) => f.startsWith(s + "-")));

    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dirPath, file), "utf8");
        const data = JSON.parse(raw);

        const tournamentCtx =
          TOURNAMENT_CTX[data.tournament] ?? data.tournament;
        const legendName = data.legend;
        const playerName = data.player;

        const placement = data.placement
          ? ordinal(data.placement, tournamentCtx)
          : null;
        const key = `${tournamentCtx}|${playerName}|${legendName}|${placement ?? ""}`;
        if (existingSet.has(key)) {
          skipped++;
          continue;
        }
        existingSet.add(key);
        const legendId = findLegendId(legendName) ?? "unknown";
        const slug = slugify(
          `${tournamentCtx}-${placement ?? "x"}-${playerName}-${legendName.split(",")[0]}`,
        );

        const deck = await prisma.deck.create({
          data: {
            slug,
            title: `${legendName} · ${tournamentCtx}`,
            legendId,
            legendName,
            playerName,
            placement,
            tournamentContext: tournamentCtx,
            published: true,
            featured: false,
            format: data.format?.toLowerCase() ?? "constructed",
            setTag: data.set ?? null,
            tags: [slugify(tournamentCtx)],
          },
        });

        const deckCards: {
          deckId: string;
          cardId: string;
          quantity: number;
          section: string;
        }[] = [];
        const seen = new Set<string>();

        const legendCard = findCard(legendName);
        if (legendCard) {
          deckCards.push({
            deckId: deck.id,
            cardId: legendCard.id,
            quantity: 1,
            section: "legend",
          });
          seen.add(`${legendCard.id}|legend`);
        }

        if (data.champion) {
          const champName = data.champion.replace(",", " -").toLowerCase();
          const champCard = findCard(data.champion);
          if (champCard && !seen.has(`${champCard.id}|legend`)) {
            deckCards.push({
              deckId: deck.id,
              cardId: champCard.id,
              quantity: 1,
              section: "legend",
            });
            seen.add(`${champCard.id}|legend`);
          }
        }

        for (const entry of data.mainDeck ?? []) {
          const card = findCard(entry.name);
          if (card && !seen.has(`${card.id}|main`)) {
            deckCards.push({
              deckId: deck.id,
              cardId: card.id,
              quantity: entry.quantity,
              section: "main",
            });
            seen.add(`${card.id}|main`);
          }
        }

        for (const entry of data.sideboard ?? data.sideDeck ?? []) {
          const card = findCard(entry.name);
          if (card && !seen.has(`${card.id}|side`)) {
            deckCards.push({
              deckId: deck.id,
              cardId: card.id,
              quantity: entry.quantity,
              section: "side",
            });
            seen.add(`${card.id}|side`);
          }
        }

        // Les scrapes stockent les runes soit en tableau [{name:"Calm Rune",...}],
        // soit en objet par domaine {"Calm":7,"Mind":5}. Dans le 2e cas la clé est
        // le DOMAINE → la carte s'appelle "<Domaine> Rune", donc on suffixe " Rune"
        // (sinon findCard("Calm") échoue et le deck se retrouve sans runes).
        const runesArr = Array.isArray(data.runes)
          ? data.runes
          : data.runes
            ? Object.entries(data.runes).map(([name, qty]) => ({
                name: /rune$/i.test(name) ? name : `${name} Rune`,
                quantity: qty,
              }))
            : [];
        for (const entry of runesArr) {
          const card = findCard(entry.name);
          if (card && !seen.has(`${card.id}|rune`)) {
            deckCards.push({
              deckId: deck.id,
              cardId: card.id,
              quantity: entry.quantity,
              section: "rune",
            });
            seen.add(`${card.id}|rune`);
          }
        }

        for (const bf of data.battlefields ?? []) {
          const name = typeof bf === "string" ? bf : bf.name;
          const card = findCard(name);
          if (card && !seen.has(`${card.id}|battlefield`)) {
            deckCards.push({
              deckId: deck.id,
              cardId: card.id,
              quantity: 1,
              section: "battlefield",
            });
            seen.add(`${card.id}|battlefield`);
          }
        }

        if (deckCards.length > 0) {
          await prisma.deckCard.createMany({
            data: deckCards,
            skipDuplicates: true,
          });
        }

        created++;
      } catch (e: any) {
        errors++;
        if (errors <= 5)
          console.error(`Error ${file}: ${e.message?.slice(0, 80)}`);
      }
    }
  }

  console.log(`Done! Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
  const total = await prisma.deck.count();
  console.log(`Total decks in DB: ${total}`);
  await prisma.$disconnect();
}

main();
