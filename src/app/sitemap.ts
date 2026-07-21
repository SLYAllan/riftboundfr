// Dynamic so it renders against the live DB at request time. With `revalidate`
// the route was statically generated at Docker build (no DB available) and got
// frozen to just the base URL - see deployment lessons. ~9k URLs fits well
// within a single sitemap (limit: 50 000 URLs / 50 MB).
export const dynamic = "force-dynamic";

import { promises as fs } from "fs";
import path from "path";
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/cartes`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/decks`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/articles`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/legendes`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tier-list`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tournois`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/deckbuilder`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/debuter`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/deckbuilding`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/meta`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/guides/glossaire`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/guides/domaines`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/jouer-en-ligne`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/guides/ban-list`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Fiches Légendes : générées depuis data/fiches/*.json (système de fichiers,
  // toujours dispo, même sans DB). Une URL /legendes/<slug> par fiche.
  let legendPages: MetadataRoute.Sitemap = [];
  try {
    const ficheFiles = await fs.readdir(path.join(process.cwd(), "data", "fiches"));
    legendPages = ficheFiles
      .filter((f) => f.endsWith(".json"))
      .map((f) => ({
        url: `${baseUrl}/legendes/${f.replace(/\.json$/, "")}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
  } catch {
    /* dossier indispo : on s'en passe. */
  }

  try {
    const [articles, tournamentContexts, decks, cards] = await Promise.all([
      prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.$queryRaw<{ tournamentContext: string }[]>`
        SELECT DISTINCT "tournamentContext" FROM "Deck"
        WHERE published = true AND "tournamentContext" IS NOT NULL
      `,
      // Curation : seuls les decks à valeur SEO entrent au sitemap (best-of,
      // guide rédigé, ou résultat de tournoi). Les decklists scrappées « brutes »
      // restent accessibles mais ne sont plus poussées - sinon Google découvre
      // ~19k pages fines/quasi-dupliquées qu'il refuse d'indexer (budget de crawl).
      prisma.deck.findMany({
        where: {
          published: true,
          OR: [
            { featured: true },
            { guide: { not: null } },
            { tournamentContext: { not: null } },
            { placement: { not: null } },
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
      lastModified: now,
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

    return [...staticPages, ...legendPages, ...articlePages, ...tournamentPages, ...cardPages, ...deckPages];
  } catch {
    // DB unavailable (e.g. Docker build): emit at least the static + legend pages.
    return [...staticPages, ...legendPages];
  }
}
