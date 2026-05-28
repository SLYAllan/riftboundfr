import { prisma } from "@/lib/prisma";

const SITE_URL = "https://riftboundfrance.fr";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
    },
  });

  const lastBuildDate = articles[0]?.publishedAt?.toUTCString() ?? new Date().toUTCString();

  const items = articles
    .map((article) => {
      const link = `${SITE_URL}/articles/${article.slug}`;
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${link}</link>
      <description>${escapeXml(article.excerpt ?? "")}</description>
      <pubDate>${article.publishedAt?.toUTCString() ?? ""}</pubDate>
      <guid isPermaLink="true">${link}</guid>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Riftbound France</title>
    <link>${SITE_URL}</link>
    <description>La communauté francophone de Riftbound</description>
    <language>fr</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
