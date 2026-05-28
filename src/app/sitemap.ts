export const revalidate = 3600;

import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const SITEMAP_LIMIT = 5000;

export async function generateSitemaps() {
  const deckCount = await prisma.deck.count({ where: { published: true } });
  const cardCount = await prisma.card.count();
  const totalDynamic = deckCount + cardCount;
  const numSitemaps = Math.ceil(totalDynamic / SITEMAP_LIMIT) + 1;
  return Array.from({ length: numSitemaps }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";

  if (id === 0) {
    const [articles, tournamentContexts] = await Promise.all([
      prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
      prisma.$queryRaw<{ tournamentContext: string }[]>`
        SELECT DISTINCT "tournamentContext" FROM "Deck"
        WHERE published = true AND "tournamentContext" IS NOT NULL
      `,
    ]);

    const staticPages: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
      { url: `${baseUrl}/cartes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/decks`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/tier-list`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/tournois`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/deckbuilder`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guides/debuter`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guides/deckbuilding`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guides/glossaire`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/guides/domaines`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/guides/jouer-en-ligne`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ];

    const tournamentPages: MetadataRoute.Sitemap = tournamentContexts.map((t) => ({
      url: `${baseUrl}/tournois/${slugify(t.tournamentContext)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...tournamentPages, ...articlePages];
  }

  const offset = (id - 1) * SITEMAP_LIMIT;
  const [decks, cards] = await Promise.all([
    prisma.deck.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
      orderBy: { id: "asc" },
      skip: offset,
      take: SITEMAP_LIMIT,
    }),
    offset === 0
      ? prisma.card.findMany({
          select: { riftboundId: true, updatedAt: true },
          orderBy: { id: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const deckPages: MetadataRoute.Sitemap = decks.map((deck) => ({
    url: `${baseUrl}/decks/${deck.slug}`,
    lastModified: deck.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const cardPages: MetadataRoute.Sitemap = cards.map((card) => ({
    url: `${baseUrl}/cartes/${card.riftboundId}`,
    lastModified: card.updatedAt,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...cardPages, ...deckPages];
}
