import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify, displayLegendName } from "@/lib/utils";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { encodeDeckBase64 } from "@/lib/deck-codec";
import Link from "next/link";
import { getTournamentCountryCode } from "@/lib/tournament-flags";
import { CountryBadge } from "@/components/country-badge";
import { DeckLikeButton } from "@/components/deck-like-button";
import type { Metadata } from "next";
import type { DecklistCard, DeckSection } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const deck = await prisma.deck.findUnique({ where: { slug } });
  if (!deck) return { title: "Deck introuvable" };
  return { title: `${deck.title} — ${displayLegendName(deck.legendName)}`, description: deck.description || `Decklist ${deck.title} pour le TCG Riftbound` };
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

  const legendCard = deck.cards.find((dc) => dc.section === "legend");
  const championCard = deck.cards.find((dc) => dc.section === "legend" && dc.card.supertype === "Champion");
  const actualLegend = deck.cards.find((dc) => dc.section === "legend" && dc.card.supertype !== "Champion") ?? legendCard;
  const deckbuilderCode = encodeDeckBase64({
    legend: actualLegend ? { cardId: actualLegend.card.riftboundId, quantity: 1 } : null,
    champion: championCard ? { cardId: championCard.card.riftboundId, quantity: 1 } : null,
    main: deck.cards.filter((dc) => dc.section === "main").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
    rune: deck.cards.filter((dc) => dc.section === "rune").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
    battlefield: deck.cards.filter((dc) => dc.section === "battlefield").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
    side: deck.cards.filter((dc) => dc.section === "side").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/decks" className="text-sm text-ink-muted hover:text-arcane">&larr; Retour aux decks</Link>
      <div className="mt-6">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{deck.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-lg text-arcane">{displayLegendName(deck.legendName)}</span>
          <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs text-ink-secondary">{deck.format}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            setTag === "Unleashed" ? "bg-arcane/10 text-arcane"
              : setTag === "Spiritforged" ? "bg-emerald-500/10 text-emerald-400"
              : setTag === "Origins" ? "bg-amber-500/10 text-amber-400"
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
              deck.tournamentTier === "P" ? "bg-gold/10 text-gold"
                : deck.tournamentTier === "S" ? "bg-arcane/10 text-arcane"
                : deck.tournamentTier === "A" ? "bg-violet/10 text-violet"
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
        <div className="mt-4">
          <DeckLikeButton slug={deck.slug} initialLikes={deck.likes} />
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

      {deck.guide && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Guide du deck</h2>
          <div className="mt-4"><MarkdownRenderer content={deck.guide} /></div>
        </div>
      )}
    </div>
  );
}
