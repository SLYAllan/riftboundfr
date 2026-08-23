export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { formatDate, displayLegendName } from "@/lib/utils";
import { getBannerUrl } from "@/lib/banners";
import { getBinders, getCollectionMap } from "@/lib/collection-server";
import Link from "@/components/lien";
import Image from "next/image";
import { Hammer, Eye, Heart, Clock, Shield, Library, ArrowRight, Radio, BarChart3, UserCog } from "lucide-react";
import { ProfileActions } from "./profile-actions";
import { DeckActions, BoutonDeconnexion } from "./deck-actions";
import { lienFiltreProfil, type FiltresProfil } from "./filtres";
import { DiscordAvatar } from "@/components/discord-avatar";
import type { Metadata } from "next";
import { metaTraduite, tr } from "@/lib/i18n-server";

const metadata: Metadata = {
  title: "Mon profil",
};

type DeckCardData = {
  href: string;
  legendName: string;
  title: string;
  likes: number;
  views?: number;
  isPrivate?: boolean;
  authorName?: string | null;
  createdAt: Date;
};

async function DeckCard({ deck, showAuthor = false, actions }: { deck: DeckCardData; showAuthor?: boolean; actions?: React.ReactNode }) {
  const t = await tr();
  const bannerUrl = getBannerUrl(deck.legendName);
  return (
    <div className="flex flex-col">
    <Link
      href={deck.href}
      className="card-hover rounded-card border border-hairline overflow-hidden group relative"
    >
      <div className="relative h-28">
        {bannerUrl ? (
          <Image
            src={bannerUrl}
            alt=""
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
              <div className="texte-sur-art mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-arcane">{displayLegendName(deck.legendName)}</span>
                {showAuthor && deck.authorName && <span className="text-white">par {deck.authorName}</span>}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-white">
              <div className="flex items-center gap-1">
                {deck.views !== undefined && (
                  <span className="flex items-center gap-0.5 rounded bg-surface/80 px-1.5 py-0.5">
                    <Eye size={12} aria-hidden="true" /> {deck.views}
                    <span className="sr-only">{t("vues")}</span>
                  </span>
                )}
                <span className="flex items-center gap-0.5 rounded bg-surface/80 px-1.5 py-0.5">
                  <Heart size={12} aria-hidden="true" /> {deck.likes}
                  <span className="sr-only">{t("j'aime")}</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                {deck.isPrivate && (
                  <span className="rounded bg-surface/80 px-1.5 py-0.5">{t("Privé")}</span>
                )}
                <span className="rounded bg-surface/80 px-1.5 py-0.5">{formatDate(deck.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
    {actions}
    </div>
  );
}

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const t = await tr();
  const user = await getUserFromSession();
  if (!user) redirect("/api/auth/discord");

  const params = await searchParams;
  const visibilite =
    params.visibilite === "public" || params.visibilite === "prive" ? params.visibilite : undefined;
  const legendeFiltre = params.legende || undefined;

  const decks = await prisma.communityDeck.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Favoris : decks likés par l'utilisateur, depuis les deux systèmes de like
  // (communautaires via CommunityDeckLike + officiels/tournois via DeckLike).
  const [communityLikes, officialLikes] = await Promise.all([
    prisma.communityDeckLike.findMany({
      where: { userId: user.id },
      include: { communityDeck: true },
      orderBy: { id: "desc" },
    }),
    prisma.deckLike.findMany({
      where: { userId: user.id },
      include: { deck: true },
      orderBy: { id: "desc" },
    }),
  ]);

  const favoriteDecks: (DeckCardData & { likeId: string })[] = [
    ...communityLikes
      .filter((row) => row.communityDeck.isPublic || row.communityDeck.userId === user.id)
      .map((row) => ({
        likeId: row.id,
        href: `/d/${row.communityDeck.shareCode}`,
        legendName: row.communityDeck.legendName,
        title: row.communityDeck.title,
        likes: row.communityDeck.likes,
        views: row.communityDeck.views,
        authorName: row.communityDeck.authorName,
        createdAt: row.communityDeck.createdAt,
      })),
    ...officialLikes
      .filter((row) => row.deck.published)
      .map((row) => ({
        likeId: row.id,
        href: `/decks/${row.deck.slug}`,
        legendName: row.deck.legendName,
        title: row.deck.title,
        likes: row.deck.likes,
        authorName: row.deck.playerName || row.deck.authorName,
        createdAt: row.deck.createdAt,
      })),
  ].sort((a, b) => b.likeId.localeCompare(a.likeId));

  // Collection : classeurs + cartes possédées + completion globale.
  const [binders, collectionMap, totalCards] = await Promise.all([
    getBinders(user.id),
    getCollectionMap(user.id),
    prisma.card.count(),
  ]);
  const ownedDistinct = Object.keys(collectionMap).length;
  const totalCopies = Object.values(collectionMap).reduce((s, v) => s + v, 0);
  const completion = totalCards ? Math.round((ownedDistinct / totalCards) * 100) : 0;

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

  // Les Légendes favorites étaient trois pastilles inertes : elles filtrent
  // maintenant la grille, ce qui leur donne une raison d'exister.
  const decksAffiches = decks.filter(
    (d) =>
      (!visibilite || (visibilite === "public" ? d.isPublic : !d.isPublic)) &&
      (!legendeFiltre || d.legendName === legendeFiltre),
  );

  const lienFiltre = (maj: FiltresProfil) =>
    lienFiltreProfil({ visibilite, legende: legendeFiltre }, maj);

  const pastille = (actif: boolean) =>
    `inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
      actif ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-secondary hover:text-ink"
    }`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* En-tête d'identité */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="shrink-0">
          <DiscordAvatar
            src={user.avatarUrl}
            alt=""
            size={80}
            className="h-20 w-20 rounded-full border-2 border-arcane object-cover"
            fallback={
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-raised border-2 border-hairline">
                <Shield size={32} className="text-ink-muted" aria-hidden="true" />
              </div>
            }
          />
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
                <svg width="14" height="11" viewBox="0 0 71 55" fill="currentColor" className="text-[#5865F2]" aria-hidden="true">
                  <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18 -.9 30.6.3 43a.3.3 0 00.1.2 58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.6 43a.2.2 0 00.1-.2c1.4-14.5-2.4-27-10.1-38.2a.2.2 0 00-.1 0zM23.7 35.2c-3.3 0-6-3-6-6.7s2.7-6.7 6-6.7c3.4 0 6.1 3 6 6.7 0 3.7-2.6 6.7-6 6.7zm22.2 0c-3.3 0-6-3-6-6.7s2.6-6.7 6-6.7c3.3 0 6 3 6 6.7 0 3.7-2.6 6.7-6 6.7z" />
                </svg>
                <span className="sr-only">Discord : </span>
                {user.discordName}
              </span>
            )}
            {user.riotGameName && (
              <span className="text-gold">
                <span className="sr-only">Riot ID : </span>
                {user.riotGameName}{user.riotTagLine ? `#${user.riotTagLine}` : ""}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={12} aria-hidden="true" />
              {t("Membre depuis")} {formatDate(user.createdAt)}
            </span>
          </div>
          <div className="mt-3">
            <ProfileActions username={user.username} riotGameName={user.riotGameName} riotTagLine={user.riotTagLine} />
          </div>
        </div>
      </div>

      {/* Raccourcis. Les trois destinations du compte, dont l'overlay : il n'était
          atteignable que par la barre de navigation alors que c'est une page fille
          du profil. Une rangée de destinations sert plus qu'une rangée de nombres. */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Link href="/collection" className="card-hover rounded-card border border-hairline bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-arcane to-violet">
              <Library size={22} className="text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Ma collection")}</div>
              <p className="truncate text-xs text-ink-muted">
                {ownedDistinct}/{totalCards} {t("cartes")} &middot; {binders.length} {binders.length > 1 ? t("classeurs") : t("classeur")}
              </p>
            </div>
            <span className="ml-auto text-xl font-bold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{completion}%</span>
          </div>
          {/* La valeur est écrite juste au-dessus : la barre ne porte rien de plus. */}
          <div className="mt-3 h-1.5 overflow-hidden rounded bg-surface-raised" aria-hidden="true">
            <div className="h-full rounded bg-gradient-to-r from-arcane to-violet" style={{ width: `${completion}%` }} />
          </div>
        </Link>

        <Link href="/profil/overlay" className="card-hover flex items-center gap-3 rounded-card border border-hairline bg-surface p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-violet-dark">
            <Radio size={22} className="text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Overlay de stream")}</div>
            <p className="truncate text-xs text-ink-muted">{t("Scores, décor et lien compagnon")}</p>
          </div>
          <ArrowRight size={16} className="ml-auto shrink-0 text-ink-muted" aria-hidden="true" />
        </Link>

        <Link href="/deckbuilder" className="card-hover flex items-center gap-3 rounded-card border border-hairline bg-surface p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-red-400">
            <Hammer size={22} className="text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Créer un deck")}</div>
            <p className="truncate text-xs text-ink-muted">{decks.length} {decks.length > 1 ? t("decks créés") : t("deck créé")}</p>
          </div>
          <ArrowRight size={16} className="ml-auto shrink-0 text-ink-muted" aria-hidden="true" />
        </Link>
      </div>

      {/* Mes decks. Remonté au-dessus des compteurs : c'est ce qu'on vient faire ici. */}
      <section id="mes-decks" className="mt-10 scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {t("Mes decks")}
          </h2>
          <Link href="/deckbuilder" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-violet-dark px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
            <Hammer size={14} aria-hidden="true" /> {t("Créer un deck")}
          </Link>
        </div>

        {decks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={lienFiltre({ visibilite: undefined })} className={pastille(!visibilite)}>
              {t("Tous")} ({decks.length})
            </Link>
            <Link href={lienFiltre({ visibilite: "public" })} className={pastille(visibilite === "public")}>
              {t("Publics")} ({publicDecks.length})
            </Link>
            <Link href={lienFiltre({ visibilite: "prive" })} className={pastille(visibilite === "prive")}>
              {t("Privés")} ({decks.length - publicDecks.length})
            </Link>
            {topLegends.map(([legend, count]) => (
              <Link
                key={legend}
                href={lienFiltre({ legende: legendeFiltre === legend ? undefined : legend })}
                className={pastille(legendeFiltre === legend)}
              >
                {displayLegendName(legend)} ({count})
              </Link>
            ))}
          </div>
        )}

        {decks.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-ink-muted">{t("Vous n’avez pas encore créé de deck.")}</p>
            <Link href="/deckbuilder" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-violet-light hover:underline">
              <Hammer size={14} aria-hidden="true" /> {t("Créer votre premier deck")}
            </Link>
          </div>
        ) : decksAffiches.length === 0 ? (
          <div className="mt-6 rounded-card border border-hairline bg-surface p-6 text-center">
            <p className="text-ink-muted">{t("Aucun deck pour ce filtre.")}</p>
            <Link href="/profil#mes-decks" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-violet-light hover:underline">
              {t("Voir tous mes decks")}
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decksAffiches.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={{
                  href: `/d/${deck.shareCode}`,
                  legendName: deck.legendName,
                  title: deck.title,
                  likes: deck.likes,
                  views: deck.views,
                  isPrivate: !deck.isPublic,
                  authorName: deck.authorName,
                  createdAt: deck.createdAt,
                }}
                actions={<DeckActions shareCode={deck.shareCode} isPublic={deck.isPublic} titre={deck.title} />}
              />
            ))}
          </div>
        )}
      </section>

      {/* Favoris : contenu des autres, donc après le sien. */}
      <section id="favoris" className="mt-10 scroll-mt-24">
        <div className="flex items-center gap-2">
          <Heart size={18} className="text-red-400" aria-hidden="true" />
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {t("Favoris")}
          </h2>
          <span className="text-sm text-ink-muted">({favoriteDecks.length})</span>
        </div>

        {favoriteDecks.length === 0 ? (
          <div className="mt-6 rounded-card border border-hairline bg-surface p-6 text-center">
            <p className="text-ink-muted">{t("Vous n’avez pas encore de deck en favori.")}</p>
            <Link href="/decks" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-violet-light hover:underline">
              <Heart size={14} aria-hidden="true" /> {t("Découvrir les decks de la communauté")}
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteDecks.map((deck) => (
              <DeckCard key={deck.likeId} deck={deck} showAuthor />
            ))}
          </div>
        )}
      </section>

      {/* Statistiques : des chiffres qu'on regarde, jamais des actions. Ils
          occupaient le premier écran, ils passent en bas. */}
      <section id="statistiques" className="mt-10 scroll-mt-24">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-ink-muted" aria-hidden="true" />
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {t("Statistiques")}
          </h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { valeur: decks.length, libelle: t("Decks créés"), couleur: "text-arcane" },
            { valeur: publicDecks.length, libelle: t("Decks publics"), couleur: "text-gold" },
            { valeur: totalViews, libelle: t("Vues totales"), couleur: "text-violet-light" },
            { valeur: totalLikes, libelle: t("J’aime reçus"), couleur: "text-red-400" },
          ].map((stat) => (
            <div key={stat.libelle} className="rounded-card border border-hairline bg-surface p-4 text-center">
              <div className={`text-2xl font-bold ${stat.couleur}`} style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                {stat.valeur}
              </div>
              <div className="mt-1 text-xs text-ink-muted">{stat.libelle}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          {totalCopies.toLocaleString("fr-FR")} {t("exemplaires en collection")}
        </p>
      </section>

      {/* Compte : la déconnexion n'existait que dans le menu de la barre. */}
      <section id="compte" className="mt-10 scroll-mt-24">
        <div className="flex items-center gap-2">
          <UserCog size={18} className="text-ink-muted" aria-hidden="true" />
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {t("Compte")}
          </h2>
        </div>
        <div className="mt-4 rounded-card border border-hairline bg-surface p-4">
          <BoutonDeconnexion />
        </div>
      </section>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
