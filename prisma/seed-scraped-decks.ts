import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { buildCardLookup, findCard } from "../src/lib/card-printing";

const prisma = new PrismaClient();

const TOURNAMENT_CTX: Record<string, string> = {
  // Consolidation: les fichiers nomment "Suzhou/Fuzhou Regional" mais le tournoi
  // affiché (tournament-flags) est "... Regional Qualifier" → on mappe pour éviter
  // un contexte dupliqué à chaque seed.
  "Suzhou Regional": "Suzhou Regional Qualifier",
  "Fuzhou Regional": "Fuzhou Regional Qualifier",
  // Ces cinq-là allaient dans le mauvais sens : ils traduisaient le nom du fichier,
  // qui est celui du drapeau, vers un « RQ … 2026 » que tournament-flags.ts ne
  // connaît pas. Résultat, cinq pages de tournoi sans pays, sans date et sans
  // nombre de joueurs. On ne les traduit plus du tout.
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
  // Le suffixe anglais dépend des DEUX derniers chiffres : 71e s'écrit « 71st »,
  // pas « 71th ». Ne traiter que 1, 2 et 3 écrivait « 71th » et « 233th » sur le
  // site, et surtout donnait une clé de dédoublonnage différente de celle des
  // anciennes lignes : chaque nouveau seed recréait le deck en double.
  const reste = n % 100;
  if (reste >= 11 && reste <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

async function main() {
  const allCards = await prisma.card.findMany({
    select: { id: true, riftboundId: true, name: true, type: true, set: true, collectorNumber: true, alternateArt: true },
  });
  const cartes = buildCardLookup(allCards);
  const exigerCarte = (nom: string) => {
    const carte = findCard(cartes, nom);
    if (!carte) throw new Error(`Carte introuvable : ${nom}`);
    return carte;
  };

  const legends = allCards.filter((c) => c.type === "Legend");
  function findLegendId(legendName: string): string | null {
    const match = legends.find((l) => l.name.toLowerCase() === legendName.toLowerCase());
    return match?.riftboundId ?? null;
  }
  /**
   * Le nom de la Légende tel que la carte l'écrit. Les fichiers de decklist disent
   * « Rek'Sai, Void Burrower », la carte dit « Rek'sai ». Écrire le nom du fichier
   * coupait les compteurs par Légende en deux et recréait le deck en double au seed
   * suivant, la clé de dédoublonnage portant sur ce nom.
   */
  function nomCanoniqueLegende(legendName: string): string {
    return legends.find((l) => l.name.toLowerCase() === legendName.toLowerCase())?.name ?? legendName;
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
        const legendName = nomCanoniqueLegende(data.legend);
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
        const legendId = findLegendId(legendName);
        if (!legendId) throw new Error(`Légende introuvable : ${legendName}`);
        const slug = slugify(
          `${tournamentCtx}-${placement ?? "x"}-${playerName}-${legendName.split(",")[0]}`,
        );

        const deckCards: {
          cardId: string;
          quantity: number;
          section: string;
        }[] = [];
        const seen = new Set<string>();

        const legendCard = exigerCarte(legendName);
        deckCards.push({ cardId: legendCard.id, quantity: 1, section: "legend" });
        seen.add(`${legendCard.id}|legend`);

        if (data.champion) {
          const champCard = exigerCarte(data.champion);
          if (!seen.has(`${champCard.id}|legend`)) {
            deckCards.push({
              cardId: champCard.id,
              quantity: 1,
              section: "legend",
            });
            seen.add(`${champCard.id}|legend`);
          }
        }

        for (const entry of data.mainDeck ?? []) {
          const card = exigerCarte(entry.name);
          if (!seen.has(`${card.id}|main`)) {
            deckCards.push({
              cardId: card.id,
              quantity: entry.quantity,
              section: "main",
            });
            seen.add(`${card.id}|main`);
          }
        }

        for (const entry of data.sideboard ?? data.sideDeck ?? []) {
          const card = exigerCarte(entry.name);
          if (!seen.has(`${card.id}|side`)) {
            deckCards.push({
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
          const card = exigerCarte(entry.name);
          if (!seen.has(`${card.id}|rune`)) {
            deckCards.push({
              cardId: card.id,
              quantity: entry.quantity,
              section: "rune",
            });
            seen.add(`${card.id}|rune`);
          }
        }

        for (const bf of data.battlefields ?? []) {
          const name = typeof bf === "string" ? bf : bf.name;
          const card = exigerCarte(name);
          if (!seen.has(`${card.id}|battlefield`)) {
            deckCards.push({
              cardId: card.id,
              quantity: 1,
              section: "battlefield",
            });
            seen.add(`${card.id}|battlefield`);
          }
        }

        await prisma.$transaction(async (tx) => {
          const deck = await tx.deck.create({
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
          await tx.deckCard.createMany({
            data: deckCards.map((carte) => ({ ...carte, deckId: deck.id })),
          });
        });

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
  if (errors > 0) throw new Error(`${errors} decklist(s) n'ont pas été importées`);
}

main();
