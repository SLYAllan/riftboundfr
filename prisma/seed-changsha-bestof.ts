import { PrismaClient } from "@prisma/client";
import { parseDeckCode } from "../src/lib/deck-code";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// ── Config tournoi ──────────────────────────────────────────────────
const FILE_PREFIX = "changsha-ro"; // préfixe des fichiers decklist (changsha-ro-{place}-{player}.json)
const ARTICLE_SLUG = "best-of-changsha-ro";
const TOURNAMENT_CTX = "S3 Changsha Regional Open (2026-06-14)"; // == data.tournament des JSON seedés
const TOURNAMENT_NAME = "S3 Changsha Regional Open";
const DATE = "2026-06-14";
const PLAYERS = 640;
const SET = "Unleashed";

const DECKLISTS = path.join(process.cwd(), "data", "decklists");

interface DeckJson {
  id: string;
  legend: string;
  champion: string | null;
  player: string;
  placement: number | null;
  domains: string[];
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number> | { name: string; quantity: number }[];
  battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
  sideboard?: { name: string; quantity: number }[];
  set: string | null;
}

function ordinal(n: number): string {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

// Tier par tranche de classement (640 joueurs)
function tierFor(p: number): string {
  if (p <= 3) return "S";
  if (p <= 16) return "A";
  if (p <= 64) return "B";
  if (p <= 128) return "C";
  return "D";
}

function runeEntries(runes: DeckJson["runes"]): { name: string; quantity: number }[] {
  if (Array.isArray(runes)) return runes;
  return Object.entries(runes ?? {}).map(([name, quantity]) => ({
    name: name.endsWith(" Rune") ? name : `${name} Rune`,
    quantity: quantity as number,
  }));
}

function buildDeckCode(d: DeckJson): string {
  const parts: string[] = [];
  if (d.champion) {
    parts.push("== Champion ==");
    parts.push(`1x ${d.champion}`);
  }
  parts.push("== Main Deck ==");
  // mainDeck contient le champion (type "Champion") → on l'exclut (déjà ajouté ci-dessus)
  for (const c of d.mainDeck) {
    if ((c.type ?? "").toLowerCase() === "champion") continue;
    parts.push(`${c.quantity}x ${c.name}`);
  }
  const runes = runeEntries(d.runes);
  if (runes.length) {
    parts.push("== Runes ==");
    for (const r of runes) parts.push(`${r.quantity}x ${r.name}`);
  }
  if (d.battlefields.length) {
    parts.push("== Battlefield ==");
    for (const b of d.battlefields) parts.push(`1x ${b}`);
  }
  const side = d.sideDeck ?? d.sideboard ?? [];
  if (side.length) {
    parts.push("== Side Deck ==");
    for (const s of side) parts.push(`${s.quantity}x ${s.name}`);
  }
  return parts.join("\n");
}

interface BestEntry {
  legend: string;
  champion: string | null;
  player: string;
  placement: number;
  domains: string;
  tier: string;
  deckCode: string;
  count: number;
}

function collectBestOf(): BestEntry[] {
  const byLegend = new Map<string, DeckJson[]>();
  const legendDirs = fs.readdirSync(DECKLISTS).filter((d) =>
    fs.statSync(path.join(DECKLISTS, d)).isDirectory(),
  );
  for (const dir of legendDirs) {
    const dirPath = path.join(DECKLISTS, dir);
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.startsWith(FILE_PREFIX + "-") || !file.endsWith(".json")) continue;
      const data: DeckJson = JSON.parse(fs.readFileSync(path.join(dirPath, file), "utf8"));
      if (!data.legend) continue;
      const arr = byLegend.get(data.legend) ?? [];
      arr.push(data);
      byLegend.set(data.legend, arr);
    }
  }

  const entries: BestEntry[] = [];
  for (const [legend, decks] of byLegend) {
    const ranked = decks
      .filter((d) => d.placement != null)
      .sort((a, b) => a.placement! - b.placement!);
    const best = ranked[0] ?? decks[0];
    if (best.placement == null) continue;
    entries.push({
      legend,
      champion: best.champion,
      player: best.player,
      placement: best.placement,
      domains: (best.domains ?? []).join("/"),
      tier: tierFor(best.placement),
      deckCode: buildDeckCode(best),
      count: decks.length,
    });
  }
  entries.sort((a, b) => a.placement - b.placement);
  return entries;
}

async function main() {
  const BEST_OF = collectBestOf();
  console.log(`Best of Changsha: ${BEST_OF.length} légendes`);

  const blocks: Record<string, unknown>[] = [];
  blocks.push({
    type: "text",
    id: "intro",
    content: `## Best of Changsha — Regional Open

Le **Regional Open de Changsha**, étape majeure de la saison Unleashed, a rassemblé **640 joueurs**. **${BEST_OF[0]?.player ?? "Le vainqueur"}** s'impose avec **${BEST_OF[0]?.legend ?? ""}** au terme d'un week-end qui confirme l'ouverture totale du métagame chinois.

Voici le meilleur deck de **chaque légende** jouée à Changsha : pour chaque légende représentée, nous avons retenu la liste la mieux classée du tournoi. Les decks sont triés par classement obtenu.

---`,
  });

  const tierLabels: Record<string, string> = {
    S: "Tier 1 — Podium",
    A: "Tier 2 — Top 16",
    B: "Tier 3 — Top 64",
    C: "Tier 4 — Top 128",
    D: "Tier 5 — Reste du field",
  };

  let lastTier = "";
  for (let i = 0; i < BEST_OF.length; i++) {
    const d = BEST_OF[i];
    if (d.tier !== lastTier) {
      blocks.push({ type: "separator", id: `sep-${d.tier}` });
      blocks.push({ type: "text", id: `tier-${d.tier}`, content: `## ${tierLabels[d.tier] ?? d.tier}` });
      lastTier = d.tier;
    }
    blocks.push({
      type: "text",
      id: `note-${i}`,
      content: `Meilleur résultat de **${d.legend}** à Changsha : ${ordinal(d.placement)} place par ${d.player}, sur ${d.count} deck${d.count > 1 ? "s" : ""} de cette légende au tournoi.`,
    });
    blocks.push({
      type: "decklist",
      id: `deck-${i}`,
      deckCode: d.deckCode,
      deckName: `${d.legend} — Best of Changsha`,
      legendName: d.legend,
      playerName: d.player,
      context: `${ordinal(d.placement)} — Changsha Regional Open${d.domains ? ` (${d.domains})` : ""}`,
    });
  }

  const existingArticle = await prisma.article.findUnique({ where: { slug: ARTICLE_SLUG } });
  if (existingArticle) {
    await prisma.deck.updateMany({ where: { sourceArticleId: existingArticle.id }, data: { sourceArticleId: null } });
    await prisma.article.delete({ where: { id: existingArticle.id } });
    console.log("  Removed existing article (re-seeding)");
  }

  const article = await prisma.article.create({
    data: {
      title: "Best of Changsha — Toutes les légendes",
      slug: ARTICLE_SLUG,
      coverImage: "/img/articles/changsha.webp",
      excerpt: `Le meilleur deck de chaque légende au Regional Open de Changsha (640 joueurs, set Unleashed). ${BEST_OF[0]?.player ?? ""} champion avec ${BEST_OF[0]?.legend.split(",")[0] ?? ""}.`,
      category: "tournoi",
      tags: ["changsha", "regional-open", "best-of", "meta", "unleashed"],
      blocks: blocks as never,
      published: true,
      featured: true,
      publishedAt: new Date(DATE),
      tournamentName: TOURNAMENT_NAME,
      tournamentDate: new Date(DATE),
      tournamentLocation: "Changsha, Chine",
      tournamentPlayerCount: PLAYERS,
    },
  });
  console.log(`Article créé : /articles/${article.slug}`);

  const totalNotFound: string[] = [];
  for (const d of BEST_OF) {
    const legendCard = await prisma.card.findFirst({
      where: { type: "Legend", name: { contains: d.legend.split(",")[0].trim(), mode: "insensitive" } },
    });

    const slug = `best-of-changsha-${d.legend.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "")}`;
    const existingDeck = await prisma.deck.findUnique({ where: { slug } });
    if (existingDeck) {
      await prisma.deckCard.deleteMany({ where: { deckId: existingDeck.id } });
      await prisma.deck.delete({ where: { id: existingDeck.id } });
    }

    const deck = await prisma.deck.create({
      data: {
        title: `${d.legend} — Best of Changsha`,
        slug,
        legendId: legendCard?.riftboundId ?? d.legend,
        legendName: d.legend,
        description: `Meilleur classement ${d.legend} au Regional Open de Changsha : ${ordinal(d.placement)} par ${d.player}. ${d.domains}.`,
        format: "constructed",
        setTag: SET,
        tags: ["changsha", "regional-open", "best-of", d.tier.toLowerCase()],
        featured: true,
        published: true,
        sourceArticleId: article.id,
        tournamentContext: TOURNAMENT_CTX,
        tournamentTier: d.tier,
        placement: ordinal(d.placement),
        playerName: d.player,
      },
    });

    const parsed = parseDeckCode(d.deckCode);
    const seen = new Set<string>();
    let created = 0;

    if (legendCard) {
      await prisma.deckCard.create({
        data: { deckId: deck.id, cardId: legendCard.id, quantity: 1, section: "legend" },
      });
      seen.add(`${legendCard.id}:legend`);
      created++;
    }

    for (const entry of parsed.entries) {
      const section = entry.section === "champion" ? "legend" : entry.section;
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
        const key = `${card.id}:${section}`;
        if (seen.has(key)) continue;
        seen.add(key);
        await prisma.deckCard.create({
          data: { deckId: deck.id, cardId: card.id, quantity: entry.quantity, section },
        });
        created++;
      } else {
        totalNotFound.push(`${d.legend}: "${entry.name}"`);
      }
    }
    console.log(`  Deck: ${slug} (${created} cartes liées, ${d.tier})`);
  }

  if (totalNotFound.length) {
    console.log(`\n⚠️ ${totalNotFound.length} cartes non trouvées :`);
    for (const n of [...new Set(totalNotFound)]) console.log(`    ${n}`);
  }
  console.log(`\nDone! Article + ${BEST_OF.length} decks best-of Changsha créés.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
