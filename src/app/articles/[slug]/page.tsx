export const revalidate = 300;

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ArticleBlockRenderer } from "@/components/article-block-renderer";
import { BestOfDeckBrowser, type BestOfEntry } from "@/components/best-of-deck-browser";
import { parseDeckCode } from "@/lib/deck-code";
import { decodeDeck, encodeDeckBase64, type DeckCodeEntry } from "@/lib/deck-codec";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { Metadata } from "next";
import type { ArticleBlock, DecklistCard, DeckSection } from "@/types";
import { Calendar, MapPin, Users } from "lucide-react";
import { getTournamentCountryCode } from "@/lib/tournament-flags";
import { CountryBadge } from "@/components/country-badge";
import { CommentsSection } from "@/components/comments";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return { title: "Article introuvable" };
  const rawDescription = article.excerpt || `${article.title} - Riftbound France`;
  const description =
    rawDescription.length > 155 ? `${rawDescription.slice(0, 152).trimEnd()}…` : rawDescription;
  // Les images og:image / twitter:image sont fournies par les conventions de
  // fichiers opengraph-image.tsx / twitter-image.tsx (PNG généré à la volée,
  // car X ne rend pas le WebP des covers).
  return {
    title: article.title,
    description,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: { type: "article", title: article.title, description },
    twitter: { card: "summary_large_image", title: article.title, description },
  };
}

function isBinaryDeckCode(code: string): boolean {
  return !code.includes("\n") && !code.includes("==") && decodeDeck(code) !== null;
}

function toListCard(card: { id: string; name: string; imageUrl: string | null; type: string; energy: number | null; power: number | null; might: number | null; rarity: string; domains: string[]; textPlain: string | null }, quantity: number, section: DeckSection): DecklistCard {
  return {
    cardId: card.id,
    name: card.name,
    artUrl: card.imageUrl,
    type: card.type,
    cost: card.energy,
    power: card.power,
    energy: card.energy,
    might: card.might,
    rarity: card.rarity,
    domains: card.domains,
    description: card.textPlain,
    quantity,
    section,
  };
}

async function resolveBinaryDeck(block: Extract<ArticleBlock, { type: "decklist" }>): Promise<{ cards: DecklistCard[]; code: string }> {
  const decoded = decodeDeck(block.deckCode)!;
  const allIds: string[] = [];
  if (decoded.legend) allIds.push(decoded.legend.cardId);
  if (decoded.champion) allIds.push(decoded.champion.cardId);
  for (const e of [...decoded.main, ...decoded.rune, ...decoded.battlefield, ...decoded.side]) allIds.push(e.cardId);

  const cards = await prisma.card.findMany({ where: { riftboundId: { in: allIds } } });
  const cardMap = new Map(cards.map((c) => [c.riftboundId, c]));

  const deckCards: DecklistCard[] = [];
  let hasRealLegend = false;

  if (decoded.legend) {
    const c = cardMap.get(decoded.legend.cardId);
    if (c) {
      deckCards.push(toListCard(c, 1, "legend"));
      if (c.type === "Legend") hasRealLegend = true;
    }
  }
  if (decoded.champion) {
    const c = cardMap.get(decoded.champion.cardId);
    if (c) deckCards.push(toListCard(c, 1, "legend"));
  }

  if (!hasRealLegend && block.legendName) {
    const dashName = block.legendName.replace(", ", " - ");
    const legendCard = await prisma.card.findFirst({
      where: {
        type: "Legend",
        alternateArt: false,
        overnumbered: false,
        signature: false,
        OR: [
          { name: { equals: dashName, mode: "insensitive" } },
          { name: { equals: block.legendName, mode: "insensitive" } },
        ],
      },
    });
    if (legendCard) {
      deckCards.unshift(toListCard(legendCard, 1, "legend"));
    }
  }

  const sectionMap: [DeckCodeEntry[], DeckSection][] = [
    [decoded.main, "main"],
    [decoded.rune, "rune"],
    [decoded.battlefield, "battlefield"],
    [decoded.side, "side"],
  ];
  for (const [entries, section] of sectionMap) {
    for (const e of entries) {
      const c = cardMap.get(e.cardId);
      if (c) deckCards.push(toListCard(c, e.quantity, section));
    }
  }

  return { cards: deckCards, code: block.deckCode };
}

async function resolveDecklists(blocks: ArticleBlock[]): Promise<{ cards: Record<string, DecklistCard[]>; codes: Record<string, string> }> {
  const decklistBlocks = blocks.filter((b): b is Extract<ArticleBlock, { type: "decklist" }> => b.type === "decklist");
  if (decklistBlocks.length === 0) return { cards: {}, codes: {} };

  const resolved: Record<string, DecklistCard[]> = {};
  const codes: Record<string, string> = {};

  const textBlocks: typeof decklistBlocks = [];
  for (const block of decklistBlocks) {
    if (isBinaryDeckCode(block.deckCode)) {
      const result = await resolveBinaryDeck(block);
      resolved[block.id] = result.cards;
      codes[block.id] = result.code;
    } else {
      textBlocks.push(block);
    }
  }

  if (textBlocks.length === 0) return { cards: resolved, codes };

  const allCardNames = new Set<string>();
  for (const block of textBlocks) {
    const parsed = parseDeckCode(block.deckCode);
    for (const entry of parsed.entries) {
      allCardNames.add(entry.name.toLowerCase());
      allCardNames.add(entry.name.replace(/ - /g, ", ").toLowerCase());
      allCardNames.add(entry.name.replace(/, /g, " - ").toLowerCase());
    }
  }

  const nameList = [...allCardNames];
  const cards = await prisma.card.findMany({
    where: {
      OR: [
        { name: { in: nameList, mode: "insensitive" } },
        { cleanName: { in: nameList, mode: "insensitive" } },
      ],
    },
  });

  const cardByName = new Map<string, typeof cards[0]>();
  for (const c of cards) {
    cardByName.set(c.name.toLowerCase(), c);
    if (c.cleanName) cardByName.set(c.cleanName.toLowerCase(), c);
  }

  const riftboundIdMap = new Map(cards.map((c) => [c.id, c.riftboundId]));

  for (const block of textBlocks) {
    const parsed = parseDeckCode(block.deckCode);
    const deckCards: DecklistCard[] = [];

    for (const entry of parsed.entries) {
      const card = cardByName.get(entry.name.toLowerCase())
        ?? cardByName.get(entry.name.replace(/ - /g, ", ").toLowerCase())
        ?? cardByName.get(entry.name.replace(/, /g, " - ").toLowerCase());
      if (card) {
        deckCards.push(toListCard(card, entry.quantity, entry.section as DeckSection));
      } else {
        deckCards.push({
          cardId: `unknown-${entry.name}`,
          name: entry.name,
          artUrl: null,
          type: "Unknown",
          rarity: "Common",
          description: null,
          quantity: entry.quantity,
          section: entry.section as DeckSection,
        });
      }
    }

    const hasLegends = deckCards.some((c) => c.section === "legend" && c.type === "Legend");
    if (!hasLegends && block.legendName) {
      const dashName = block.legendName.replace(", ", " - ");
      const prefix = block.legendName.split(",")[0].split(" - ")[0].trim();
      let legendCard = await prisma.card.findFirst({
        where: {
          type: "Legend",
          OR: [
            { name: { equals: block.legendName, mode: "insensitive" } },
            { name: { equals: dashName, mode: "insensitive" } },
          ],
        },
      });
      if (!legendCard) {
        legendCard = await prisma.card.findFirst({
          where: {
            type: "Legend",
            name: { startsWith: prefix, mode: "insensitive" },
            NOT: { name: { contains: "Overnumbered" } },
          },
        });
      }
      // dedup uniquement sur la section "legend" (la légende/champion peut aussi
      // figurer en main/side - il faut quand même l'afficher en Légende/Champion).
      if (legendCard && !deckCards.some((c) => c.cardId === legendCard!.id && c.section === "legend")) {
        riftboundIdMap.set(legendCard.id, legendCard.riftboundId); // pour le deckbuilder
        deckCards.unshift(toListCard(legendCard, 1, "legend" as DeckSection));
      }
    }

    // Champion : il figure déjà dans le code deck soit en section "champion"
    // (en-tête « == Champion == »), soit en section "legend" (unité non-Légende).
    // Dans ces 2 cas il s'affiche déjà → NE PAS le rajouter (sinon doublon
    // Champion + Légende, ex. best-of Tianjin/Changsha). Sinon fallback via
    // championName (best-of où le champion n'est pas dans le code, ex. Vancouver).
    const hasChampion = deckCards.some(
      (c) => (c.section as string) === "champion" || (c.section === "legend" && c.type !== "Legend"),
    );
    if (!hasChampion && block.championName) {
      const dashChamp = block.championName.replace(", ", " - ");
      const champCard = await prisma.card.findFirst({
        where: {
          OR: [
            { name: { equals: block.championName, mode: "insensitive" } },
            { name: { equals: dashChamp, mode: "insensitive" } },
            { cleanName: { equals: block.championName, mode: "insensitive" } },
          ],
        },
      });
      if (champCard && !deckCards.some((c) => c.cardId === champCard.id && ((c.section as string) === "champion" || c.section === "legend"))) {
        riftboundIdMap.set(champCard.id, champCard.riftboundId); // pour le deckbuilder
        deckCards.push(toListCard(champCard, 1, "champion" as DeckSection));
      }
    }

    resolved[block.id] = deckCards;

    const legendEntry = deckCards.find((c) => c.section === "legend" && c.type === "Legend");
    const championEntry = deckCards.find((c) => (c.section as string) === "champion" || (c.section === "legend" && c.type !== "Legend"));
    const toEntry = (c: DecklistCard): DeckCodeEntry => ({
      cardId: riftboundIdMap.get(c.cardId) ?? c.cardId,
      quantity: c.quantity,
    });
    codes[block.id] = encodeDeckBase64({
      legend: legendEntry ? toEntry(legendEntry) : null,
      champion: championEntry ? toEntry(championEntry) : null,
      main: deckCards.filter((c) => c.section === "main").map(toEntry),
      rune: deckCards.filter((c) => c.section === "rune").map(toEntry),
      battlefield: deckCards.filter((c) => c.section === "battlefield").map(toEntry),
      side: deckCards.filter((c) => c.section === "side").map(toEntry),
    });
  }

  return { cards: resolved, codes };
}

// Best-of articles list one deck per Legend. Instead of a long linear page we
// render an intro + a searchable, collapsible deck browser. "Tier" heading
// blocks are dropped (we no longer rank decks by tier inside these articles).
function isTierHeading(content: string): boolean {
  return /(^|\n)\s*#{1,4}\s*tier\b/i.test(content) || /^\s*tier\s*\d/i.test(content);
}

function buildBestOf(
  blocks: ArticleBlock[],
  resolvedDecks: Record<string, DecklistCard[]>,
  deckbuilderCodes: Record<string, string>,
): { intro: ArticleBlock[]; entries: BestOfEntry[]; outro: ArticleBlock[] } {
  const intro: ArticleBlock[] = [];
  const outro: ArticleBlock[] = [];
  const entries: BestOfEntry[] = [];
  let phase: "intro" | "decks" = "intro";
  let pending: ArticleBlock[] = [];

  for (const b of blocks) {
    if (b.type === "decklist") {
      phase = "decks";
      let desc = pending
        .filter((t): t is Extract<ArticleBlock, { type: "text" }> => t.type === "text" && !isTierHeading(t.content))
        .map((t) => t.content)
        .join("\n\n")
        .trim()
        .replace(/^#{1,6}\s*[^\n]*\n?/, "") // drop heading line (redundant with the accordion header)
        .trim();
      entries.push({
        id: b.id,
        legendName: b.legendName,
        deckName: b.deckName,
        playerName: b.playerName,
        context: b.context,
        description: desc || undefined,
        cards: resolvedDecks[b.id] ?? [],
        deckbuilderCode: deckbuilderCodes[b.id],
      });
      pending = [];
      continue;
    }
    if (b.type === "separator") continue;
    if (b.type === "text" && isTierHeading(b.content)) continue; // drop tier labels
    if (b.type === "text" && /^\s*#{3}\s/.test(b.content)) {
      phase = "decks";
      pending.push(b);
      continue;
    }
    if (phase === "intro") intro.push(b);
    else pending.push(b);
  }
  outro.push(...pending.filter((b) => !(b.type === "text" && isTierHeading(b.content))));
  return { intro, entries, outro };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || !article.published) notFound();

  const blocks = (article.blocks as ArticleBlock[]) ?? [];
  const { cards: resolvedDecks, codes: deckbuilderCodes } = await resolveDecklists(blocks);

  // Maillage interne : transformer les [[carte]] des blocs texte en liens SSR vers
  // /cartes/[id]. Une seule requête pour tous les noms cités dans l'article.
  const CARD_REF_RE = /\[\[([^\]|]+?)(?:\|[^\]]+?)?\]\]/g;
  const refNames = new Set<string>();
  for (const b of blocks) {
    if (b.type === "text") {
      let m: RegExpExecArray | null;
      CARD_REF_RE.lastIndex = 0;
      while ((m = CARD_REF_RE.exec(b.content)) !== null) refNames.add(m[1].trim());
    }
  }
  const cardLinks: Record<string, string> = {};
  if (refNames.size > 0) {
    const names = [...refNames];
    const refCards = await prisma.card.findMany({
      where: { alternateArt: false, OR: [{ name: { in: names } }, { cleanName: { in: names } }] },
      select: { name: true, cleanName: true, riftboundId: true },
    });
    for (const c of refCards) {
      if (c.name) cardLinks[c.name.toLowerCase()] = c.riftboundId;
      if (c.cleanName) cardLinks[c.cleanName.toLowerCase()] = c.riftboundId;
    }
  }

  const isTournoi = article.category === "tournoi";
  const isBestOf = article.slug.startsWith("best-of");
  const bestOf = isBestOf ? buildBestOf(blocks, resolvedDecks, deckbuilderCodes) : null;

  // Articles connexes (maillage + engagement) : même catégorie, les plus récents.
  const relatedArticles = await prisma.article.findMany({
    where: { published: true, slug: { not: slug }, category: article.category },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { slug: true, title: true, coverImage: true, publishedAt: true },
  });

  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";
  const coverAbs = article.coverImage
    ? (article.coverImage.startsWith("http") ? article.coverImage : `${SITE}${article.coverImage}`)
    : undefined;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || `${article.title} - Riftbound France`,
    ...(coverAbs ? { image: [coverAbs] } : {}),
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt?.toISOString(),
    author: { "@type": "Person", name: "Allan", url: "https://twitter.com/solary_allan" },
    publisher: {
      "@type": "Organization",
      "@id": "https://riftboundfrance.fr/#organization",
      name: "Riftbound France",
      url: "https://riftboundfrance.fr",
      logo: { "@type": "ImageObject", url: "https://riftboundfrance.fr/logorbfr.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/articles/${slug}` },
    inLanguage: "fr",
  };
  // Le BreadcrumbList est émis par le composant <Breadcrumbs/> ci-dessous (évite le doublon).
  const jsonLdHtml = JSON.stringify(articleJsonLd).replace(/</g, "\\u003c");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml }} />
      <Breadcrumbs
        items={[
          { name: "Actualités", href: "/articles" },
          { name: article.title, href: `/articles/${slug}` },
        ]}
      />

      <article className="mt-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-violet">{article.category}</span>
          <span className="text-ink-muted">Par Allan</span>
          {article.publishedAt && <span className="text-ink-muted">{formatDate(article.publishedAt)}</span>}
        </div>

        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {article.title}
        </h1>

        {isTournoi && (article.tournamentName || article.tournamentLocation || article.tournamentPlayerCount) && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-card border border-gold/20 bg-gold/5 px-4 py-3 text-sm">
            {article.tournamentName && (() => {
              const cc = getTournamentCountryCode(article.tournamentName);
              return <span className="inline-flex items-center gap-1.5 font-semibold text-gold">{cc && <CountryBadge code={cc} />} {article.tournamentName}</span>;
            })()}
            {article.tournamentDate && (
              <span className="flex items-center gap-1 text-ink-secondary"><Calendar size={14} />{formatDate(article.tournamentDate)}</span>
            )}
            {article.tournamentLocation && (
              <span className="flex items-center gap-1 text-ink-secondary"><MapPin size={14} />{article.tournamentLocation}</span>
            )}
            {article.tournamentPlayerCount && (
              <span className="flex items-center gap-1 text-ink-secondary"><Users size={14} />{article.tournamentPlayerCount} joueurs</span>
            )}
          </div>
        )}

        <div className="mt-8">
          {bestOf ? (
            <>
              {bestOf.intro.length > 0 && (
                <ArticleBlockRenderer blocks={bestOf.intro} resolvedDecks={resolvedDecks} deckbuilderCodes={deckbuilderCodes} cardLinks={cardLinks} />
              )}
              <BestOfDeckBrowser entries={bestOf.entries} />
              {bestOf.outro.length > 0 && (
                <ArticleBlockRenderer blocks={bestOf.outro} resolvedDecks={resolvedDecks} deckbuilderCodes={deckbuilderCodes} cardLinks={cardLinks} />
              )}
            </>
          ) : (
            <ArticleBlockRenderer blocks={blocks} resolvedDecks={resolvedDecks} deckbuilderCodes={deckbuilderCodes} cardLinks={cardLinks} />
          )}
        </div>

        {relatedArticles.length > 0 && (
          <section className="mt-12 border-t border-hairline pt-8">
            <h2 className="mb-4 text-xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>À lire aussi</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((r) => (
                <Link key={r.slug} href={`/articles/${r.slug}`} className="card-hover overflow-hidden rounded-card border border-hairline bg-surface">
                  {r.coverImage && (
                    <div className="relative aspect-video bg-surface-raised">
                      <Image src={r.coverImage} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover object-top" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold leading-snug" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{r.title}</h3>
                    {r.publishedAt && <span className="mt-1 block text-xs text-ink-muted">{formatDate(r.publishedAt)}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <CommentsSection articleId={article.id} />
      </article>
    </div>
  );
}
