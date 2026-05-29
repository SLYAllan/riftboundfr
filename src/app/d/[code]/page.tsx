export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { displayLegendName } from "@/lib/utils";
import { decodeDeck, encodeDeckBase64 } from "@/lib/deck-codec";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { DeckStatsPanel } from "@/components/deck-stats-panel";
import { CommentsSection } from "@/components/comments";
import { CommunityDeckGuide } from "./guide-editor";
import { VersionHistory } from "./version-history";
import { UpdateDeckButton } from "./update-deck";
import { LikeButton } from "./like-button";
import { VisibilityToggle } from "./visibility-toggle";
import { ShareDecklistButton } from "@/components/share-decklist-button";
import { getUserFromSession } from "@/lib/session";
import Link from "next/link";
import type { Metadata } from "next";
import type { DecklistCard, DeckSection } from "@/types";

interface PageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const deck = await prisma.communityDeck.findUnique({
    where: { shareCode: code },
    select: { title: true, legendName: true, description: true, authorName: true, domains: true },
  });
  if (!deck) return { title: "Deck introuvable" };
  const title = `${deck.title} — ${displayLegendName(deck.legendName)}`;
  const description = deck.description || `Deck ${deck.title} par ${deck.authorName}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CommunityDeckPage({ params }: PageProps) {
  const { code } = await params;

  const deck = await prisma.communityDeck.findUnique({
    where: { shareCode: code },
    include: {
      history: { orderBy: { version: "desc" }, take: 10 },
    },
  });
  if (!deck) notFound();

  await prisma.communityDeck.update({
    where: { id: deck.id },
    data: { views: { increment: 1 } },
  });

  const decoded = decodeDeck(deck.deckCode);
  if (!decoded) notFound();

  const allIdentifiers: string[] = [];
  if (decoded.legend) allIdentifiers.push(decoded.legend.cardId);
  if (decoded.champion) allIdentifiers.push(decoded.champion.cardId);
  for (const e of [...decoded.main, ...decoded.rune, ...decoded.battlefield, ...decoded.side]) {
    allIdentifiers.push(e.cardId);
  }

  const isNameFormat = allIdentifiers.some((id) => id.includes(" ") || id.includes(","));

  const cards = await prisma.card.findMany({
    where: isNameFormat
      ? { name: { in: allIdentifiers, mode: "insensitive" }, alternateArt: false }
      : { riftboundId: { in: allIdentifiers } },
  });

  const cardMap = new Map<string, typeof cards[number]>();
  for (const c of cards) {
    cardMap.set(c.riftboundId, c);
    cardMap.set(c.name, c);
    cardMap.set(c.name.toLowerCase(), c);
  }

  function toListCards(
    entries: { cardId: string; quantity: number }[],
    section: DeckSection,
  ): DecklistCard[] {
    const result: DecklistCard[] = [];
    for (const e of entries) {
      const card = cardMap.get(e.cardId) ?? cardMap.get(e.cardId.toLowerCase());
      if (!card) continue;
      result.push({
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
        quantity: e.quantity,
        section,
      });
    }
    return result;
  }

  const decklistCards: DecklistCard[] = [
    ...toListCards(decoded.legend ? [decoded.legend] : [], "legend"),
    ...toListCards(decoded.champion ? [decoded.champion] : [], "legend"),
    ...toListCards(decoded.main, "main"),
    ...toListCards(decoded.rune, "rune"),
    ...toListCards(decoded.battlefield, "battlefield"),
    ...toListCards(decoded.side, "side"),
  ];

  const user = await getUserFromSession();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/decks?cat=community" className="text-sm text-ink-muted hover:text-arcane">
        &larr; Retour aux decks communautaires
      </Link>
      <div className="mt-6">
        <h1
          className="text-3xl font-bold leading-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          {deck.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-lg text-arcane">
            {displayLegendName(deck.legendName)}
          </span>
          <span className="text-sm text-ink-muted">
            par <strong className="text-ink-secondary">{deck.authorName}</strong>
          </span>
          <LikeButton
            shareCode={deck.shareCode}
            initialLikes={deck.likes}
            isLoggedIn={!!user}
          />
          {user && deck.userId === user.id && (
            <VisibilityToggle
              shareCode={deck.shareCode}
              initialIsPublic={deck.isPublic}
            />
          )}
        </div>
        <div className="mt-3">
          <ShareDecklistButton
            shareCode={deck.shareCode}
            deckTitle={deck.title}
            legendName={displayLegendName(deck.legendName)}
            playerName={deck.authorName}
          />
        </div>
        {deck.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {deck.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-violet/15 px-2.5 py-0.5 text-xs font-semibold text-violet border border-violet/30"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {deck.description && (
          <p className="mt-3 text-ink-secondary">{deck.description}</p>
        )}
        {deck.version > 1 && (
          <p className="mt-2 text-xs text-ink-muted">
            Version {deck.version} — mis à jour le {new Date(deck.updatedAt).toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <DecklistInteractive
          cards={decklistCards}
          deckName={deck.title}
          legendName={deck.legendName}
          playerName={deck.authorName}
          showCopyCode
          showExportPng
          deckbuilderCode={(() => {
            function toRiftboundId(id: string) {
              const c = cardMap.get(id) ?? cardMap.get(id.toLowerCase());
              return c ? c.riftboundId : id;
            }
            return encodeDeckBase64({
              legend: decoded.legend ? { cardId: toRiftboundId(decoded.legend.cardId), quantity: 1 } : null,
              champion: decoded.champion ? { cardId: toRiftboundId(decoded.champion.cardId), quantity: 1 } : null,
              main: decoded.main.map((e) => ({ cardId: toRiftboundId(e.cardId), quantity: e.quantity })),
              rune: decoded.rune.map((e) => ({ cardId: toRiftboundId(e.cardId), quantity: e.quantity })),
              battlefield: decoded.battlefield.map((e) => ({ cardId: toRiftboundId(e.cardId), quantity: e.quantity })),
              side: decoded.side.map((e) => ({ cardId: toRiftboundId(e.cardId), quantity: e.quantity })),
            });
          })()}
        />
        <div className="space-y-4">
          <DeckStatsPanel cards={decklistCards} />
          <VersionHistory
            currentVersion={deck.version}
            history={deck.history.map((h) => ({
              id: h.id,
              version: h.version,
              changelog: h.changelog,
              createdAt: h.createdAt.toISOString(),
            }))}
          />
          <UpdateDeckButton shareCode={deck.shareCode} ownerId={deck.userId} />
        </div>
      </div>

      <CommunityDeckGuide
        shareCode={deck.shareCode}
        initialGuide={deck.guide}
        ownerId={deck.userId}
      />

      <CommentsSection communityDeckId={deck.id} />
    </div>
  );
}
