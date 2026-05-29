/**
 * Fix best-of articles that float to the top of the article list because
 * they have no publishedAt (NULLs sort first in Postgres DESC ordering) and
 * are mis-categorized as "tournois" (plural) instead of "tournoi".
 *
 *  - Normalizes category "tournois" -> "tournoi" (so they match the filter + label)
 *  - Backfills publishedAt = tournamentDate when publishedAt is null
 *
 * Idempotent. Usage: npx tsx scripts/fix-bestof-dates.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const articles = await prisma.article.findMany({
    where: {
      OR: [{ category: "tournois" }, { publishedAt: null, tournamentDate: { not: null } }],
    },
    select: { id: true, slug: true, category: true, publishedAt: true, tournamentDate: true },
  });

  console.log(`Found ${articles.length} article(s) to fix.\n`);

  for (const a of articles) {
    const data: { category?: string; publishedAt?: Date } = {};
    if (a.category === "tournois") data.category = "tournoi";
    if (!a.publishedAt && a.tournamentDate) data.publishedAt = a.tournamentDate;

    if (Object.keys(data).length === 0) continue;

    await prisma.article.update({ where: { id: a.id }, data });
    console.log(
      `✓ ${a.slug}` +
        (data.category ? `  category->${data.category}` : "") +
        (data.publishedAt ? `  publishedAt->${data.publishedAt.toISOString().slice(0, 10)}` : "")
    );
  }

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
