// Dynamic so it renders against the live DB at request time. With `revalidate`
// the route was statically generated at Docker build (no DB available) and got
// frozen to just the base URL - see deployment lessons. ~9k URLs fits well
// within a single sitemap (limit: 50 000 URLs / 50 MB).
export const dynamic = "force-dynamic";

import { promises as fs } from "fs";
import path from "path";
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { legendsWithDecks } from "@/lib/legend-fiche";
import { slugify } from "@/lib/utils";
import { avecAnglais } from "@/lib/sitemap";

// Graphies telles qu'elles arrivent du scrape : ordinaux anglais, y compris quand ils
// sont fautifs plus loin dans le classement (« 1373th »).
const TOP8_PLACEMENTS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/cartes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/decks`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/articles`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/legendes`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tier-list`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/meta`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/tournois`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/deckbuilder`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/debuter`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/deckbuilding`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/glossaire`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/outils/regles`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/guides/domaines`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/jouer-en-ligne`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/guides/ban-list`, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Pages Légendes : une par fiche rédigée (data/fiches/*.json, toujours lisible même
  // sans DB) PLUS une par Légende qui a des decks publiés sans fiche. Priorité haute :
  // ce sont les pages qui visent les requêtes "deck <légende>".
  const legendSlugs = new Set<string>();
  try {
    const ficheFiles = await fs.readdir(path.join(process.cwd(), "data", "fiches"));
    for (const f of ficheFiles) {
      if (f.endsWith(".json")) legendSlugs.add(f.replace(/\.json$/, ""));
    }
  } catch {
    /* dossier indispo : on s'en passe. */
  }
  for (const l of await legendsWithDecks()) legendSlugs.add(l.slug);
  const legendPages: MetadataRoute.Sitemap = [...legendSlugs].map((slug) => ({
    url: `${baseUrl}/legendes/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  try {
    const [articles, tournamentContexts, decks, cards] = await Promise.all([
      prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.$queryRaw<{ tournamentContext: string }[]>`
        SELECT DISTINCT "tournamentContext" FROM "Deck"
        WHERE published = true AND "tournamentContext" IS NOT NULL
      `,
      // Curation : seuls les decks à valeur SEO entrent au sitemap (best-of, guide
      // rédigé, ou Top 8 de tournoi). Les decklists scrappées « brutes » restent en
      // ligne et liées depuis les pages de tournoi, mais ne sont plus poussées.
      //
      // Les deux conditions précédentes, `tournamentContext` et `placement` non nuls,
      // ne filtraient rien : 22 511 decks publiés sur 22 511 ont un contexte de
      // tournoi, et 22 450 ont un classement (jusqu'à « 1373th »). Le sitemap
      // déclarait donc 22 512 pages de decks pour 23 751 URL, alors que Google n'en
      // indexe qu'un quart et qu'elles rapportent 0,12 clic chacune. D'où le Top 8
      // en toutes lettres : c'est le seul classement qui fasse une page à part.
      prisma.deck.findMany({
        where: {
          published: true,
          OR: [
            { featured: true },
            { guide: { not: null } },
            { placement: { in: TOP8_PLACEMENTS } },
          ],
        },
        select: { slug: true, updatedAt: true },
        orderBy: { id: "asc" },
      }),
      // Anti index-bloat : on exclut les variantes (alt-art / overnumbered /
      // signature) qui sont en `noindex` sur la page - les lister contredisait le
      // robots et gaspillait du crawl.
      prisma.card.findMany({
        where: { alternateArt: false, overnumbered: false, signature: false },
        select: { riftboundId: true, updatedAt: true },
        orderBy: { id: "asc" },
      }),
    ]);

    const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${baseUrl}/articles/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const tournamentPages: MetadataRoute.Sitemap = tournamentContexts.map((t) => ({
      url: `${baseUrl}/tournois/${slugify(t.tournamentContext)}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const deckPages: MetadataRoute.Sitemap = decks.map((d) => ({
      url: `${baseUrl}/decks/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    const cardPages: MetadataRoute.Sitemap = cards.map((c) => ({
      url: `${baseUrl}/cartes/${c.riftboundId}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

    return avecAnglais([...staticPages, ...legendPages, ...articlePages, ...tournamentPages, ...cardPages, ...deckPages], baseUrl);
  } catch {
    // DB unavailable (e.g. Docker build): emit at least the static + legend pages.
    return avecAnglais([...staticPages, ...legendPages], baseUrl);
  }
}
