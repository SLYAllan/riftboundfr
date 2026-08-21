export const dynamic = "force-dynamic";

import Link from "@/components/lien";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDate, displayLegendName } from "@/lib/utils";
import { getTournamentCountryCode } from "@/lib/tournament-flags";
import { CountryBadge } from "@/components/country-badge";
import type { Metadata } from "next";
import type { ArticleBlock } from "@/types";
import { metaTraduite, tr } from "@/lib/i18n-server";

const metadata: Metadata = {
  title: { absolute: "Actualités Riftbound - News, analyses méta et résultats" },
  description:
    "Toute l'actualité Riftbound en français : analyses de méta, résultats de tournois, guides et annonces.",
  alternates: { canonical: "/articles" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Actualités Riftbound - News, analyses méta et résultats",
    description:
      "Analyses de méta, résultats de tournois, guides et annonces Riftbound en français.",
    images: ["/img/og-default.png"],
  },
};

const categoryLabels: Record<string, string> = {
  actualite: "Actualité",
  guide: "Guide",
  tournoi: "Tournoi",
  meta: "Méta",
  "patch-notes": "Patch Notes",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {

  const t = await tr();
  const { category } = await searchParams;

  const where: Record<string, unknown> = { published: true };
  if (category) where.category = category;

  const articles = await prisma.article.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      category: true,
      blocks: true,
      tournamentName: true,
      publishedAt: true,
    },
  });

  const categories = ["actualite", "guide", "tournoi", "meta", "patch-notes"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Actualités Riftbound")}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/articles"
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${!category ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-secondary hover:text-ink"}`}
        >{t("Tous")}</Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/articles?category=${cat}`}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${category === cat ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-secondary hover:text-ink"}`}
          >
            {t(categoryLabels[cat] ?? cat)}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <p className="mt-12 text-center text-ink-muted">{t("Aucun article publié pour le moment.")}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const blocks = (article.blocks as ArticleBlock[]) ?? [];
            const legends = [
              ...new Set(
                blocks
                  .filter((b): b is Extract<ArticleBlock, { type: "decklist" }> => b.type === "decklist")
                  .map((b) => displayLegendName(b.legendName))
              ),
            ];
            const cc = article.tournamentName ? getTournamentCountryCode(article.tournamentName) : null;
            return (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="card-hover rounded-card border border-hairline bg-surface overflow-hidden"
            >
              {article.coverImage && (
                <div className="relative aspect-video bg-surface-raised">
                  <Image src={article.coverImage} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover object-top" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-violet-light">
                    {t(categoryLabels[article.category] ?? article.category)}
                  </span>
                  {cc && <CountryBadge code={cc} />}
                  {article.publishedAt && (
                    <span className="text-xs text-ink-muted">{formatDate(article.publishedAt)}</span>
                  )}
                </div>
                {/* Deux lignes réservées : un titre court faisait remonter la
                    description et les pastilles, et plus rien ne s'alignait
                    d'une carte à l'autre. */}
                <h2 className="mt-2 line-clamp-2 min-h-[3.5rem] text-lg font-semibold leading-snug" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  {t(article.title)}
                </h2>
                {article.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-secondary">{t(article.excerpt)}</p>
                )}
                {legends.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {legends.slice(0, 8).map((l) => (
                      <span key={l} className="rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-semibold text-arcane">
                        {l}
                      </span>
                    ))}
                    {legends.length > 8 && (
                      <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[10px] text-ink-muted">
                        +{legends.length - 8}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
