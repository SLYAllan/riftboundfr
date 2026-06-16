import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { entriesToDeckCode } from "../src/lib/deck-code";

const prisma = new PrismaClient();

interface DeckJson {
  legend: string;
  champion: string | null;
  player: string;
  placement: number | null;
  tournament: string;
  domains: string[];
  mainDeck: { name: string; quantity: number; type: string }[];
  runes: { name: string; quantity: number }[];
  battlefields: string[];
  sideboard: { name: string; quantity: number }[];
}

function buildDeckCode(deck: DeckJson): string {
  const entries: { quantity: number; name: string; section: "legend" | "main" | "rune" | "battlefield" | "side" }[] = [];

  if (deck.champion) entries.push({ quantity: 1, name: deck.champion, section: "legend" });

  for (const c of deck.mainDeck) entries.push({ quantity: c.quantity, name: c.name, section: "main" });
  for (const r of deck.runes) entries.push({ quantity: r.quantity, name: r.name, section: "rune" });
  for (const bf of deck.battlefields) entries.push({ quantity: 1, name: bf, section: "battlefield" });
  for (const s of deck.sideboard) entries.push({ quantity: s.quantity, name: s.name, section: "side" });

  return entriesToDeckCode(entries);
}

function loadTop8(tournament: string, prefix: string): DeckJson[] {
  const decklistsDir = path.join(__dirname, "../data/decklists");
  const results: DeckJson[] = [];

  const legendDirs = fs.readdirSync(decklistsDir).filter(f =>
    fs.statSync(path.join(decklistsDir, f)).isDirectory()
  );

  for (const dir of legendDirs) {
    const files = fs.readdirSync(path.join(decklistsDir, dir)).filter(f => f.startsWith(prefix) && f.endsWith(".json"));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(decklistsDir, dir, file), "utf-8");
        const deck: DeckJson = JSON.parse(raw);
        if (deck.placement !== null && deck.placement <= 8) {
          results.push(deck);
        }
      } catch {}
    }
  }

  return results.sort((a, b) => (a.placement || 99) - (b.placement || 99));
}

interface TournamentConfig {
  title: string;
  slug: string;
  excerpt: string;
  prefix: string;
  tournament: string;
  name: string;
  date: string;
  location: string;
  players: number;
  set: string;
  intro: string;
  coverImage: string;
}

const tournaments: TournamentConfig[] = [
  {
    title: "Top 8 Houston Regional Qualifier 2025",
    slug: "top-8-houston-rq-2025",
    coverImage: "/img/articles/houston-2.webp",
    excerpt: "Les 8 decklists du Top 8 au Regional Qualifier de Houston 2025 — 1347 joueurs, format Origins. Annie domine avec 4/8 top 8.",
    prefix: "houston-rq-",
    tournament: "Houston Regional Qualifier",
    name: "Houston Regional Qualifier 2025",
    date: "2025-12-07",
    location: "Houston, TX, USA",
    players: 1347,
    set: "Origins",
    intro: `Le **Top 8 du Regional Qualifier de Houston** — 1347 joueurs, format Origins. Le dernier Regional du set Origins.

**Annie** domine totalement : **4/8 top 8**, dont les positions 1, 3, 4 et 8. **Dhawally** remporte le titre.

Le reste du top 8 est partagé entre **Kai'Sa** (5e et 7e) et **Master Yi** (2e et 6e) — les 3 légendes les plus fortes d'Origins.

- **Kai'Sa** était la légende la plus jouée (30% du field) mais ne convertit pas au sommet
- **Annie** = 18% du field mais 50% du top 8 — meilleure conversion du tournoi
- **Chaos/Fury** représente 50% du top 8`,
  },
  {
    title: "Top 8 Bologna Regional Qualifier 2026",
    slug: "top-8-bologna-rq-2026",
    coverImage: "/img/articles/bologna-1.jpg",
    excerpt: "Les 8 decklists du Top 8 au Regional Qualifier de Bologne 2026 — 1719 joueurs, format Spiritforged. Ezreal champion (Alanzq).",
    prefix: "bologna-rq-",
    tournament: "Bologna Regional Qualifier",
    name: "Bologna Regional Qualifier 2026",
    date: "2026-02-21",
    location: "Bologna, Italie",
    players: 1719,
    set: "Spiritforged",
    intro: `Le **Top 8 du Regional Qualifier de Bologne** — 1719 joueurs, le plus gros tournoi Riftbound occidental à ce jour. Format Spiritforged.

**Ezreal** remporte le titre grâce à **Alanzq** — un résultat surprise qui place le contrôle Chaos/Mind au sommet. **Miss Fortune** (Sebiq) en finale confirme la viabilité de l'archétype Aurora.

- **Draven** (3/8 top 8) reste dominant (14% du field) mais ne gagne pas
- **5 légendes différentes** en top 8 — méta diversifié
- **Chaos** présent dans **7/8 decks** du top 8
- **Viktor** (4e) = le meilleur résultat du contrôle Mind/Order en Regional`,
  },
  {
    title: "Top 8 Las Vegas Regional Qualifier 2026",
    slug: "top-8-las-vegas-rq-2026",
    coverImage: "/img/articles/lasvegas-2.webp",
    excerpt: "Les 8 decklists du Top 8 au Regional Qualifier de Las Vegas 2026 — 1670 joueurs. Draven écrase tout : TOP 5 entièrement Draven.",
    prefix: "las-vegas-rq-",
    tournament: "Las Vegas Regional Qualifier",
    name: "Las Vegas Regional Qualifier 2026",
    date: "2026-03-01",
    location: "Las Vegas, NV, USA",
    players: 1670,
    set: "Spiritforged",
    intro: `Le **Top 8 du Regional Qualifier de Las Vegas** — 1670 joueurs, format Spiritforged. Le pic de domination de **Draven**.

**Les 5 premiers sont tous Draven Chaos/Fury** — du jamais vu dans l'histoire compétitive de Riftbound. Samdsherman remporte le titre.

Points clés :
- **Draven** = 18% du field (24/129 decklists publiées), **5/8 top 8**, 62.4% WR global
- **Chaos/Fury** = 23% du field total
- Seuls **Irelia** (6e), **Jax** (7e) et **Ezreal** (8e) brisent la domination
- Ce résultat extrême mène directement aux **7 bans d'avril 2026** ciblant les builds Miracle/Detonate`,
  },
  {
    title: "Top 8 Lille Regional Qualifier 2026",
    slug: "top-8-lille-rq-2026",
    coverImage: "/img/articles/lille.webp",
    excerpt: "Les 8 decklists du Top 8 au Regional Qualifier de Lille 2026 — 1949 joueurs, post-ban. Azir champion invaincu (14-0-2).",
    prefix: "lille-rq-",
    tournament: "Lille Regional Qualifier",
    name: "Lille Regional Qualifier 2026",
    date: "2026-04-18",
    location: "Lille, France",
    players: 1949,
    set: "Spiritforged (Post-Ban)",
    intro: `Le **Top 8 du Regional Qualifier de Lille** — 1949 joueurs, le plus gros RQ Spiritforged jamais organisé. Premier Regional post-ban.

**Azir** (Pedro B / Squirtle) remporte le titre **invaincu à 14-0-2** — une performance légendaire avec l'archétype Equipment Tokens (Calm/Order). C'est le premier résultat majeur d'Azir.

- **Irelia** domine le top 8 (3/8) mais ne gagne pas — 5e, 6e et 7e
- **Master Yi** finaliste (2e et 8e) confirme sa montée post-ban
- **Draven** toujours présent (3e) malgré les bans
- **Annie** (4e) — Prismaticismism qui gagnera Atlanta la semaine suivante
- **5 légendes différentes** — la diversité est de retour post-ban`,
  },
];

async function createTop8FromData(config: TournamentConfig) {
  const existing = await prisma.article.findUnique({ where: { slug: config.slug } });
  if (existing) {
    console.log(`Article already exists: ${config.slug}, skipping`);
    return;
  }

  const top8 = loadTop8(config.tournament, config.prefix);
  if (top8.length === 0) {
    console.log(`No top 8 found for ${config.tournament}`);
    return;
  }

  console.log(`Building article for ${config.slug} with ${top8.length} decks`);

  const blocks: any[] = [
    { type: "text", id: "intro", content: config.intro },
  ];

  for (let i = 0; i < top8.length; i++) {
    const d = top8[i];
    const deckCode = buildDeckCode(d);
    const domainsStr = d.domains.join("/");
    const placementStr = d.placement === 1 ? "1st" : d.placement === 2 ? "2nd" : d.placement === 3 ? "3rd" : `${d.placement}th`;

    blocks.push({ type: "separator", id: `sep-${i}` });
    blocks.push({
      type: "text",
      id: `header-${i}`,
      content: `### ${placementStr} — ${d.legend}\n**${d.player}** — ${domainsStr}`,
    });
    blocks.push({
      type: "decklist",
      id: `deck-${i}`,
      deckCode,
      deckName: `${d.legend} — Top 8 ${config.name.split(" ")[0]}`,
      legendName: d.legend,
      playerName: d.player,
      context: `${placementStr} — ${config.name} (${domainsStr})`,
    });
  }

  await prisma.article.create({
    data: {
      title: config.title,
      slug: config.slug,
      coverImage: config.coverImage,
      excerpt: config.excerpt,
      category: "tournoi",
      tags: [config.slug.replace("top-8-", "").replace("-2025", "").replace("-2026", ""), "rq", "top-8", config.set.toLowerCase().split(" ")[0], "2026"],
      blocks: blocks as any,
      published: true,
      featured: false,
      publishedAt: new Date(config.date),
      tournamentName: config.name,
      tournamentDate: new Date(config.date),
      tournamentLocation: config.location,
      tournamentPlayerCount: config.players,
    },
  });

  console.log(`Created: /articles/${config.slug}`);
}

async function main() {
  for (const config of tournaments) {
    await createTop8FromData(config);
  }
  console.log("\nDone!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
