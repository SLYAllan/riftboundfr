export const revalidate = 300;

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify, displayLegendName } from "@/lib/utils";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { encodeDeckBase64 } from "@/lib/deck-codec";
import { legendHref as legendPageHref } from "@/lib/legend-fiche";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getTournamentCountryCode } from "@/lib/tournament-flags";
import { CountryBadge } from "@/components/country-badge";
import { DeckLikeButton } from "@/components/deck-like-button";
import { ShareDecklistButton } from "@/components/share-decklist-button";
import { DeckCoveragePanel } from "@/components/collection/deck-coverage-panel";
import type { Metadata } from "next";
import type { DecklistCard, DeckSection } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const deck = await prisma.deck.findUnique({ where: { slug } });
  if (!deck) return { title: "Deck introuvable" };
  const legend = displayLegendName(deck.legendName);
  const title = `Deck ${deck.title}`;
  const rawDesc =
    deck.description ||
    `Decklist ${legend}${deck.playerName ? ` par ${deck.playerName}` : ""}${deck.tournamentContext ? ` - ${deck.tournamentContext}` : ""}. Guide complet : gameplan, mulligan et matchups.`;
  const description = rawDesc.length > 155 ? `${rawDesc.slice(0, 152).trimEnd()}…` : rawDesc;
  const image = `/api/decklist-image?slug=${slug}`;
  return {
    title,
    description,
    alternates: { canonical: `/decks/${slug}` },
    openGraph: { type: "article", siteName: "Riftbound France", locale: "fr_FR", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function DeckDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: {
      cards: { include: { card: true }, orderBy: [{ section: "asc" }, { card: { name: "asc" } }] },
      sourceArticle: { select: { slug: true, title: true } },
    },
  });
  if (!deck || !deck.published) notFound();

  const [setTagRow] = await prisma.$queryRaw<Array<{ setTag: string }>>`
    SELECT "setTag" FROM "Deck" WHERE id = ${deck.id}
  `;
  const setTag = setTagRow?.setTag ?? "Unleashed";

  const hasLegendSection = deck.cards.some((dc) => dc.section === "legend" && dc.card.type === "Legend");

  let decklistCards: DecklistCard[] = deck.cards.map((dc) => ({
    cardId: dc.card.id,
    name: dc.card.name,
    artUrl: dc.card.imageUrl,
    type: dc.card.type,
    cost: dc.card.energy,
    power: dc.card.power,
    energy: dc.card.energy,
    might: dc.card.might,
    rarity: dc.card.rarity,
    domains: dc.card.domains,
    description: dc.card.textPlain,
    quantity: dc.quantity,
    section: dc.section as DeckSection,
  }));

  if (!hasLegendSection) {
    const dashName = deck.legendName.replace(", ", " - ");
    const prefix = deck.legendName.split(",")[0].split(" - ")[0].trim();
    let legendCard = await prisma.card.findFirst({
      where: {
        OR: [
          { riftboundId: deck.legendId },
          { type: "Legend", name: { equals: deck.legendName, mode: "insensitive" } },
          { type: "Legend", name: { equals: dashName, mode: "insensitive" } },
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
    if (legendCard && !decklistCards.some((c) => c.cardId === legendCard.id)) {
      decklistCards = [
        {
          cardId: legendCard.id,
          name: legendCard.name,
          artUrl: legendCard.imageUrl,
          type: legendCard.type,
          cost: legendCard.energy,
          power: legendCard.power,
          energy: legendCard.energy,
          might: legendCard.might,
          rarity: legendCard.rarity,
          domains: legendCard.domains,
          description: legendCard.textPlain,
          quantity: 1,
          section: "legend" as DeckSection,
        },
        ...decklistCards,
      ];
    }
  }

  // Decks liés (même Légende) : retient les visiteurs organiques qui repartent après la liste.
  const relatedDecks = await prisma.deck.findMany({
    where: { published: true, legendName: deck.legendName, NOT: { id: deck.id } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, slug: true, title: true, playerName: true, placement: true, tournamentContext: true },
  });

  // Lien vers la page de la Légende : c'est le chemin interne des pages deck vers
  // /legendes, qui vise les requêtes "deck <légende>". Toujours valide, puisque ce deck
  // est publié et que toute Légende avec un deck publié a une page.
  const legendHref = legendPageHref(deck.legendName);
  const legendCard = deck.cards.find((dc) => dc.section === "legend");
  // Champion = carte supertype "Champion" qui n'est PAS la Légende (certaines Légendes,
  // ex. Annie, ont elles aussi supertype "Champion" → on distingue par type).
  const championCard = deck.cards.find((dc) => dc.section === "legend" && dc.card.supertype === "Champion" && dc.card.type !== "Legend");
  const actualLegend = deck.cards.find((dc) => dc.section === "legend" && dc.card.type === "Legend") ?? legendCard;
  const deckbuilderCode = encodeDeckBase64({
    legend: actualLegend ? { cardId: actualLegend.card.riftboundId, quantity: 1 } : null,
    champion: championCard ? { cardId: championCard.card.riftboundId, quantity: championCard.quantity } : null,
    main: deck.cards.filter((dc) => dc.section === "main").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
    rune: deck.cards.filter((dc) => dc.section === "rune").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
    battlefield: deck.cards.filter((dc) => dc.section === "battlefield").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
    side: deck.cards.filter((dc) => dc.section === "side").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
  });

  // JSON-LD d'entité (M14) : deck = CreativeWork citable.
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";
  const deckJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: deck.title,
    url: `${SITE}/decks/${slug}`,
    about: `Deck Riftbound ${displayLegendName(deck.legendName)} (${deck.format})`,
    inLanguage: "fr",
    isPartOf: { "@type": "WebSite", name: "Riftbound France", url: SITE },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(deckJsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs
        items={[
          { name: "Decks", href: "/decks" },
          { name: deck.title, href: `/decks/${slug}` },
        ]}
      />
      <div className="mt-6">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{deck.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {legendHref ? (
            <Link href={legendHref} className="text-lg text-arcane hover:underline">
              {displayLegendName(deck.legendName)}
            </Link>
          ) : (
            <span className="text-lg text-arcane">{displayLegendName(deck.legendName)}</span>
          )}
          <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs text-ink-secondary">{deck.format}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            setTag === "Unleashed" ? "bg-arcane text-canvas"
              : setTag === "Spiritforged" ? "bg-emerald-500 text-canvas"
              : setTag === "Origins" ? "bg-amber-500 text-canvas"
              : "bg-surface-raised text-ink-secondary"
          }`}>
            {setTag}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          {(deck.playerName || deck.authorName) && <span>par <strong className="text-ink-secondary">{deck.playerName || deck.authorName}</strong></span>}
          {deck.placement && <span>&middot; {deck.placement}</span>}
          {deck.record && <span className="text-arcane">({deck.record})</span>}
          {deck.tournamentContext && (() => {
            const cc = getTournamentCountryCode(deck.tournamentContext);
            return <Link href={`/tournois/${slugify(deck.tournamentContext)}`} className="inline-flex items-center gap-1 hover:text-arcane transition-colors">&middot; {cc && <CountryBadge code={cc} />} {deck.tournamentContext}</Link>;
          })()}
          {deck.tournamentTier && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              deck.tournamentTier === "P" ? "bg-gold text-canvas"
                : deck.tournamentTier === "S" ? "bg-arcane text-canvas"
                : deck.tournamentTier === "A" ? "bg-violet-dark text-white"
                : "bg-surface-raised text-ink-secondary"
            }`}>
              {deck.tournamentTier} Tier
            </span>
          )}
          {deck.sourceUrl && (
            <a href={deck.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-arcane hover:underline">Source</a>
          )}
        </div>
        {deck.description && <p className="mt-4 text-ink-secondary">{deck.description}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <DeckLikeButton slug={deck.slug} initialLikes={deck.likes} />
          <ShareDecklistButton
            slug={deck.slug}
            deckTitle={deck.title}
            legendName={displayLegendName(deck.legendName)}
            playerName={deck.playerName ?? deck.authorName ?? undefined}
            tournamentContext={deck.tournamentContext ?? undefined}
          />
        </div>
      </div>

      <div className="mt-8">
        <DecklistInteractive
          cards={decklistCards}
          deckName={deck.title}
          legendName={deck.legendName}
          playerName={deck.playerName ?? deck.authorName ?? undefined}
          context={deck.tournamentContext ?? undefined}
          showCopyCode
          showExportPng
          sourceArticleSlug={deck.sourceArticle?.slug}
          deckbuilderCode={deckbuilderCode}
        />
      </div>

      <div className="mt-6">
        <DeckCoveragePanel
          items={decklistCards.map((c) => ({
            cardId: c.cardId,
            quantity: c.quantity,
            section: c.section,
            name: c.name,
          }))}
        />
      </div>

      {deck.guide && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Guide du deck</h2>
          <div className="mt-4"><MarkdownRenderer content={deck.guide} /></div>
        </div>
      )}

      {relatedDecks.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              Autres decks {displayLegendName(deck.legendName)}
            </h2>
            <Link href="/decks" className="text-sm text-arcane hover:text-arcane-light">Tous les decks</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedDecks.map((rd) => (
              <Link
                key={rd.id}
                href={`/decks/${rd.slug}`}
                // min-w-0 : sans lui, une cellule de grille garde la largeur de son
                // texte le plus long, truncate ne s'applique pas et la page déborde.
                className="min-w-0 rounded-card border border-hairline bg-surface px-4 py-3 transition-colors hover:bg-surface-raised/50"
              >
                <div className="truncate text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{rd.title}</div>
                <div className="mt-1 truncate text-xs text-ink-muted">
                  {[rd.playerName, rd.placement, rd.tournamentContext].filter(Boolean).join(" · ")}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
