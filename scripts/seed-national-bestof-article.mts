/**
 * Article « Best of » du S3 National Open : pour chaque Légende jouée, sa liste la
 * mieux classée du tournoi. Aucune decklist fabriquée, tout vient de
 * data/decklists/**\/s3-national-*.json, eux-mêmes issus du scrape brut.
 *
 * Usage : npx tsx scripts/seed-national-bestof-article.mts
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();
const SLUG = "best-of-national-open-s3";
const CONTEXT = "S3 National Open (2026-07-19)";

type DeckJson = {
  id: string; legend: string; champion: string | null; player: string | null;
  placement: number | null; domains: string[]; record?: string | null;
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>; battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
};

const DOMAIN_FR: Record<string, string> = {
  Fury: "Furie", Calm: "Calme", Mind: "Esprit", Body: "Corps", Chaos: "Chaos", Order: "Ordre",
};
const ordinal = (n: number) => (n === 1 ? "1er" : `${n}e`);

function buildDeckCode(d: DeckJson): string {
  const parts: string[] = [];
  if (d.champion) parts.push("== Champion ==", `1x ${d.champion}`);
  parts.push("== Main Deck ==");
  for (const c of d.mainDeck) {
    if ((c.type ?? "").toLowerCase() === "champion") continue;
    parts.push(`${c.quantity}x ${c.name}`);
  }
  const runes = Object.entries(d.runes ?? {}).map(
    ([n, q]) => `${q}x ${n.endsWith(" Rune") ? n : n + " Rune"}`,
  );
  if (runes.length) parts.push("== Runes ==", ...runes);
  if (d.battlefields.length) parts.push("== Battlefield ==", ...d.battlefields.map((b) => `1x ${b}`));
  const side = d.sideDeck ?? [];
  if (side.length) parts.push("== Side Deck ==", ...side.map((s) => `${s.quantity}x ${s.name}`));
  return parts.join("\n");
}

function load(): DeckJson[] {
  const root = join(process.cwd(), "data", "decklists");
  const out: DeckJson[] = [];
  for (const dir of readdirSync(root)) {
    let files: string[] = [];
    try {
      files = readdirSync(join(root, dir)).filter((f) => f.startsWith("s3-national-") && f.endsWith(".json"));
    } catch { continue; }
    for (const f of files) out.push(JSON.parse(readFileSync(join(root, dir, f), "utf-8")));
  }
  return out;
}

// Regroupement par palier de classement, comme l'article de Hartford.
const GROUPS = [
  { key: "S", label: "## Top 8", max: 8 },
  { key: "A", label: "## Top 32", max: 32 },
  { key: "B", label: "## Top 128", max: 128 },
  { key: "C", label: "## Le reste du field", max: Infinity },
];

async function main() {
  const all = load();

  // Meilleure liste par Légende : le plus petit classement. Les decks sans
  // classement sont écartés, on ne saurait pas dire qu'ils sont « les meilleurs ».
  const best = new Map<string, DeckJson>();
  for (const d of all) {
    if (d.placement == null) continue;
    const cur = best.get(d.legend);
    if (!cur || d.placement < cur.placement!) best.set(d.legend, d);
  }
  const picked = [...best.values()].sort((a, b) => a.placement! - b.placement!);
  console.log(`${picked.length} Légendes, sur ${all.length} listes du tournoi`);

  const blocks: Prisma.InputJsonValue[] = [
    {
      id: "intro",
      type: "text",
      content: [
        "## Best of du National Open S3",
        "",
        "Avec **2 048 joueurs**, le National Open du 19 juillet 2026 est le plus gros tournoi jamais joué sur le format Unleashed. **1 957 decklists** ont été publiées, soit près de l'intégralité du field : c'est la photo la plus complète du méta dont on dispose.",
        "",
        "La finale a opposé **deux Irelia**. Diana prend les deux places suivantes. Master Yi, Fine lame Wuju reste la Légende la plus jouée de très loin avec **307 listes**, mais sa meilleure place est une 7e : très choisi, moins payant.",
        "",
        `Voici la meilleure liste de chacune des ${picked.length} Légendes classées, regroupées par palier.`,
        "",
        "---",
      ].join("\n"),
    },
  ];

  let i = 0;
  for (const g of GROUPS) {
    const inGroup = picked.filter(
      (d) => d.placement! <= g.max && d.placement! > (GROUPS[GROUPS.indexOf(g) - 1]?.max ?? 0),
    );
    if (!inGroup.length) continue;
    blocks.push({ id: `sep-${g.key}`, type: "separator" });
    blocks.push({ id: `tier-${g.key}`, type: "text", content: g.label });
    for (const d of inGroup) {
      const doms = (d.domains ?? []).map((x) => DOMAIN_FR[x] ?? x).join("/");
      blocks.push({
        id: `deck-${i++}`,
        type: "decklist",
        context: `${ordinal(d.placement!)} - National Open S3${doms ? ` (${doms})` : ""}`,
        deckCode: buildDeckCode(d),
        deckName: `${d.legend} - Best of National Open S3`,
        legendName: d.legend,
        playerName: d.player ?? undefined,
        championName: d.champion ?? undefined,
      });
    }
  }

  const data = {
    title: "Best of du National Open S3 - Toutes les légendes",
    excerpt:
      "La meilleure decklist de chaque Légende au National Open S3, le plus gros tournoi Unleashed jamais joué : 2 048 joueurs, 1 957 listes publiées, une finale entre deux Irelia.",
    coverImage: "/img/articles/S3-national.webp",
    category: "tournoi",
    tags: ["national-open", "s3", "best-of", "meta", "unleashed"],
    tournamentName: "S3 National Open",
    tournamentLocation: "Chine",
    tournamentPlayerCount: 2048,
    tournamentDate: new Date("2026-07-19T00:00:00.000Z"),
    published: true,
    featured: true,
    publishedAt: new Date("2026-07-21T00:00:00.000Z"),
    blocks,
  };

  const existing = await prisma.article.findUnique({ where: { slug: SLUG } });
  if (existing) {
    await prisma.article.update({ where: { slug: SLUG }, data });
    console.log(`article mis à jour : ${SLUG} (${blocks.length} blocs)`);
  } else {
    await prisma.article.create({ data: { slug: SLUG, ...data } });
    console.log(`article créé : ${SLUG} (${blocks.length} blocs)`);
  }
  console.log(`contexte tournoi des decks : ${CONTEXT}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
