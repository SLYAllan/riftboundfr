/**
 * L'article Best-Of du Regional Qualifier de Barcelone.
 *
 *   npx tsx scripts/seed-barcelone-bestof.mts
 *
 * Un Best-Of, c'est le meilleur deck de CHAQUE Légende jouée au tournoi. Rien
 * n'est choisi à la main : le script reprend les decks que
 * `mark-bestof-tournois.mts` a marqués `featured` en base, et les regroupe par
 * rang de la tier list Vendetta.
 *
 * Deux Légendes manquent volontairement, Annie et Viktor : leurs vrais n°1
 * (#148 et #69) n'ont pas publié leur liste, et le mieux classé publié finit
 * #683 et #107. Le présenter comme un Best-Of serait faux. Voir l'option
 * `--sauf` de `mark-bestof-tournois.mts`.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

type DeckJson = {
  id: string; legend: string; champion: string | null; player: string;
  placement: number | null;
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>; battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
};

function buildDeckCode(d: DeckJson): string {
  const parts: string[] = [];
  if (d.champion) { parts.push("== Champion =="); parts.push(`1x ${d.champion}`); }
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

const ordinal = (n: number) => (n === 1 ? "1re" : `${n}e`);

async function main() {
  // Les decks marqués best-of en base, source unique.
  const featured = await prisma.deck.findMany({
    where: { tournamentContext: "Barcelona Regional Qualifier", featured: true, published: true },
    select: { slug: true, legendName: true, playerName: true, placement: true },
  });
  const parSlug = new Map(featured.map((d) => [d.slug, d]));

  // Les fichiers de decklist, seule source des cartes.
  const racine = "data/decklists";
  const fichiers: DeckJson[] = [];
  for (const dossier of readdirSync(racine)) {
    const p = join(racine, dossier);
    if (!statSync(p).isDirectory()) continue;
    for (const f of readdirSync(p)) {
      if (!f.startsWith("barcelona-rq-") || !f.endsWith(".json")) continue;
      const d: DeckJson = JSON.parse(readFileSync(join(p, f), "utf-8"));
      if (parSlug.has(d.id)) fichiers.push(d);
    }
  }
  if (fichiers.length !== featured.length) {
    throw new Error(`${featured.length} best-of en base mais ${fichiers.length} fichiers retrouvés : ne pas publier un article incomplet.`);
  }

  // Le rang de chaque Légende, lu dans la tier list Vendetta déjà seedée.
  const rangs = new Map<string, string>();
  const seed = readFileSync("scripts/seed-tier-lists.ts", "utf-8");
  const bloc = seed.slice(seed.indexOf("const vendettaTier"), seed.indexOf("async function seedTierList"));
  for (const m of bloc.matchAll(/legendName:\s*"([^"]+)",\s*tier:\s*"([SABCD])"/g)) {
    rangs.set(m[1].toLowerCase().replace(/[^a-z0-9]/g, ""), m[2]);
  }
  const rangDe = (nom: string) => rangs.get(nom.toLowerCase().replace(/[^a-z0-9]/g, "")) ?? "D";

  fichiers.sort((a, b) => (a.placement ?? 9999) - (b.placement ?? 9999));

  const GROUPES: { tier: string; titre: string; intro: string }[] = [
    { tier: "S", titre: "Tier S", intro: "Les deux Légendes dont l'écart à la moyenne du format tient un test statistique. Elles convertissent mieux que le champ, et pas d'un peu." },
    { tier: "A", titre: "Tier A", intro: "Au-dessus de la moyenne, sans que l'échantillon permette de le prouver. Des choix solides, souvent moins joués que le trio de tête." },
    { tier: "B", titre: "Tier B", intro: "Autour de la moyenne du format, 10 % de conversion. Ces Légendes rendent ce qu'on leur donne." },
    { tier: "C", titre: "Tier C", intro: "Sous la moyenne, ou trop peu jouées pour qu'on puisse trancher." },
    { tier: "D", titre: "Tier D", intro: "Les écarts en dessous les mieux établis du format." },
  ];

  const blocks: object[] = [
    {
      type: "text",
      id: "intro",
      content: `## Best of Barcelone, Regional Qualifier

Le **Regional Qualifier de Barcelone** a réuni **2 224 inscrits** le 23 août 2026, dont 2 131 classés et 379 au dimanche. C'est le plus gros tournoi de l'ère Vendetta.

Voici le meilleur deck de chaque Légende jouée à Barcelone : pour chacune, la liste la mieux classée. Les decks sont regroupés par rang de la tier list Vendetta.

> 💡 Survolez les noms de cartes surlignés pour voir la carte. Sur mobile, touchez-les pour ouvrir la fiche.`,
    },
  ];

  let total = 0;
  for (const g of GROUPES) {
    const lot = fichiers.filter((d) => rangDe(d.legend) === g.tier);
    if (!lot.length) continue;
    blocks.push({ type: "separator", id: `sep-${g.tier}` });
    blocks.push({
      type: "text",
      id: `titre-${g.tier}`,
      content: `## ${g.titre}\n\n${g.intro}`,
    });
    for (const d of lot) {
      const meta = parSlug.get(d.id)!;
      blocks.push({
        type: "decklist",
        id: `deck-${d.id}`,
        deckCode: buildDeckCode(d),
        deckName: `${d.legend.split(",")[0]} · ${d.player}`,
        legendName: d.legend,
        playerName: d.player,
        context: `${d.placement ? `${ordinal(d.placement)} place` : "classement inconnu"} · ${meta.legendName}`,
      });
      total++;
    }
  }

  const data = {
    title: "Best of Barcelone : le meilleur deck de chaque Légende",
    slug: "best-of-barcelone-rq",
    excerpt: `Les ${total} meilleures decklists, une par Légende, au Regional Qualifier de Barcelone (2 224 joueurs). Ornn champion devant Kennen.`,
    coverImage: "/img/articles/barcelone2.webp",
    category: "tournoi",
    tags: ["barcelone", "rq", "best-of", "meta", "vendetta"],
    blocks,
    tournamentName: "Barcelona Regional Qualifier",
    tournamentDate: new Date("2026-08-23"),
    tournamentLocation: "Barcelone, Espagne",
    tournamentPlayerCount: 2224,
    published: true,
    featured: true,
    publishedAt: new Date("2026-08-27"),
  };

  const article = await prisma.article.upsert({ where: { slug: data.slug }, update: data, create: data });
  console.log(`Article Best-Of seedé : /articles/${article.slug} — ${total} decks, ${blocks.length} blocs.`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
