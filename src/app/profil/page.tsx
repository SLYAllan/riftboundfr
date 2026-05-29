export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { formatDate, displayLegendName } from "@/lib/utils";
import { getBannerUrl } from "@/lib/banners";
import Link from "next/link";
import Image from "next/image";
import { Hammer, Eye, Heart, Clock, Shield } from "lucide-react";
import { ProfileActions } from "./profile-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil",
};

type DeckCardData = {
  shareCode: string;
  legendName: string;
  title: string;
  views: number;
  likes: number;
  isPublic: boolean;
  authorName: string;
  createdAt: Date;
};

function DeckCard({ deck, showAuthor = false }: { deck: DeckCardData; showAuthor?: boolean }) {
  const bannerUrl = getBannerUrl(deck.legendName);
  return (
    <Link
      href={`/d/${deck.shareCode}`}
      className="card-hover rounded-card border border-hairline overflow-hidden group relative"
    >
      <div className="relative h-28">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt={deck.legendName}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={75}
          />
        ) : (
          <div className="absolute inset-0 bg-surface-raised" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/70 via-canvas/30 to-transparent" />
        <div className="relative z-10 flex h-full flex-col justify-end p-3">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div
                className="text-lg font-bold leading-tight text-ink drop-shadow-md"
                style={{ fontFamily: "var(--font-rubik), sans-serif" }}
              >
                {deck.title}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-arcane drop-shadow-sm">{displayLegendName(deck.legendName)}</span>
                {showAuthor && <span className="text-white/80 drop-shadow-sm">par {deck.authorName}</span>}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-[10px] text-white drop-shadow-md">
                <span className="flex items-center gap-0.5"><Eye size={10} /> {deck.views}</span>
                <span className="flex items-center gap-0.5"><Heart size={10} /> {deck.likes}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!deck.isPublic && (
                  <span className="rounded bg-surface/80 px-1.5 py-0.5 text-[10px] text-white">
                    Privé
                  </span>
                )}
                <span className="text-[10px] text-white/75 drop-shadow-md">
                  {formatDate(deck.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function ProfilPage() {
  const user = await getUserFromSession();
  if (!user) redirect("/api/auth/discord");

  const decks = await prisma.communityDeck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Favoris : decks que l'utilisateur a likés (accessibles : publics ou les siens)
  const likedRows = await prisma.communityDeckLike.findMany({
    where: { userId: user.id },
    include: { communityDeck: true },
    orderBy: { id: "desc" },
  });
  const favoriteDecks = likedRows
    .map((row) => row.communityDeck)
    .filter((d) => d.isPublic || d.userId === user.id);

  const totalViews = decks.reduce((sum, d) => sum + d.views, 0);
  const totalLikes = decks.reduce((sum, d) => sum + d.likes, 0);
  const publicDecks = decks.filter((d) => d.isPublic);

  const legendCounts: Record<string, number> = {};
  for (const d of decks) {
    legendCounts[d.legendName] = (legendCounts[d.legendName] || 0) + 1;
  }
  const topLegends = Object.entries(legendCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="shrink-0">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.username}
              width={80}
              height={80}
              className="rounded-full border-2 border-arcane"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-raised border-2 border-hairline">
              <Shield size={32} className="text-ink-muted" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          >
            {user.username}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            {user.discordName && (
              <span className="flex items-center gap-1">
                <svg width="14" height="11" viewBox="0 0 71 55" fill="currentColor" className="text-[#5865F2]">
                  <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18 -.9 30.6.3 43a.3.3 0 00.1.2 58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.6 43a.2.2 0 00.1-.2c1.4-14.5-2.4-27-10.1-38.2a.2.2 0 00-.1 0zM23.7 35.2c-3.3 0-6-3-6-6.7s2.7-6.7 6-6.7c3.4 0 6.1 3 6 6.7 0 3.7-2.6 6.7-6 6.7zm22.2 0c-3.3 0-6-3-6-6.7s2.6-6.7 6-6.7c3.3 0 6 3 6 6.7 0 3.7-2.6 6.7-6 6.7z" />
                </svg>
                {user.discordName}
              </span>
            )}
            {user.riotGameName && (
              <span className="text-gold">
                {user.riotGameName}{user.riotTagLine ? `#${user.riotTagLine}` : ""}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Membre depuis {formatDate(user.createdAt)}
            </span>
          </div>
          <div className="mt-3">
            <ProfileActions userId={user.id} username={user.username} riotGameName={user.riotGameName} riotTagLine={user.riotTagLine} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-card border border-hairline bg-surface p-4 text-center">
          <div className="text-2xl font-bold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {decks.length}
          </div>
          <div className="mt-1 text-xs text-ink-muted">Decks créés</div>
        </div>
        <div className="rounded-card border border-hairline bg-surface p-4 text-center">
          <div className="text-2xl font-bold text-gold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {publicDecks.length}
          </div>
          <div className="mt-1 text-xs text-ink-muted">Decks publics</div>
        </div>
        <div className="rounded-card border border-hairline bg-surface p-4 text-center">
          <div className="text-2xl font-bold text-violet" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {totalViews}
          </div>
          <div className="mt-1 text-xs text-ink-muted">Vues totales</div>
        </div>
        <div className="rounded-card border border-hairline bg-surface p-4 text-center">
          <div className="text-2xl font-bold text-red-400" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {totalLikes}
          </div>
          <div className="mt-1 text-xs text-ink-muted">J&apos;aime reçus</div>
        </div>
      </div>

      {/* Top legends */}
      {topLegends.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">
            Légendes favorites
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {topLegends.map(([legend, count]) => (
              <div
                key={legend}
                className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5"
              >
                <span className="text-sm font-medium text-arcane">{displayLegendName(legend)}</span>
                <span className="text-xs text-ink-muted">{count} deck{count > 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decks */}
      <div id="mes-decks" className="mt-8 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          >
            Mes decks
          </h2>
          <Link
            href="/deckbuilder"
            className="flex items-center gap-1.5 rounded-lg bg-violet/10 px-3 py-1.5 text-sm font-medium text-violet hover:bg-violet/20 transition-colors"
          >
            <Hammer size={14} /> Créer un deck
          </Link>
        </div>

        {decks.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-ink-muted">Vous n&apos;avez pas encore créé de deck.</p>
            <Link
              href="/deckbuilder"
              className="mt-3 inline-flex items-center gap-2 text-sm text-violet hover:underline"
            >
              <Hammer size={14} /> Créer votre premier deck
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </div>

      {/* Favoris */}
      <div id="favoris" className="mt-10 scroll-mt-24">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-red-400" />
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          >
            Favoris
          </h2>
          <span className="text-sm text-ink-muted">({favoriteDecks.length})</span>
        </div>

        {favoriteDecks.length === 0 ? (
          <div className="mt-6 rounded-card border border-hairline bg-surface p-6 text-center">
            <p className="text-ink-muted">Vous n&apos;avez pas encore de deck en favori.</p>
            <Link
              href="/decks"
              className="mt-3 inline-flex items-center gap-2 text-sm text-violet hover:underline"
            >
              <Heart size={14} /> Découvrir les decks de la communauté
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteDecks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} showAuthor />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
