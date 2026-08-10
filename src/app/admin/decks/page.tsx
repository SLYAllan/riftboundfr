export const dynamic = "force-dynamic";

import Link from "@/components/lien";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { formatDate, displayLegendName } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { DeckFilters } from "./deck-filters";
import { CommunityActions } from "./community-actions";
import type { Prisma } from "@prisma/client";

const PER_PAGE = 30;

type Tab = "globale" | "decks" | "communautaire";

interface Props {
  searchParams: Promise<{ tab?: string; page?: string; q?: string; legend?: string; tournament?: string }>;
}

export default async function AdminDecksPage({ searchParams }: Props) {
  await verifyAdmin();

  const sp = await searchParams;
  const tab: Tab = (["globale", "decks", "communautaire"].includes(sp.tab ?? "") ? sp.tab : "globale") as Tab;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const skip = (page - 1) * PER_PAGE;
  const q = sp.q?.trim() ?? "";
  const legendFilter = sp.legend ?? "";
  const tournamentFilter = sp.tournament ?? "";

  const [tournamentCount, editorialCount, communityCount] = await Promise.all([
    prisma.deck.count({ where: { tournamentContext: { not: null } } }),
    prisma.deck.count({ where: { published: true, tournamentContext: null } }),
    prisma.communityDeck.count(),
  ]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "globale", label: "Globale", count: tournamentCount },
    { key: "decks", label: "Decks", count: editorialCount },
    { key: "communautaire", label: "Communautaire", count: communityCount },
  ];

  if (tab === "communautaire") {
    const where: Prisma.CommunityDeckWhereInput = {};
    const andClauses: Prisma.CommunityDeckWhereInput[] = [];
    if (q) {
      andClauses.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { legendName: { contains: q, mode: "insensitive" } },
          { authorName: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    if (legendFilter) andClauses.push({ legendName: legendFilter });
    if (andClauses.length > 0) where.AND = andClauses;

    const [communityDecks, total, distinctLegends] = await Promise.all([
      prisma.communityDeck.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: PER_PAGE,
        select: {
          id: true,
          shareCode: true,
          title: true,
          legendName: true,
          authorName: true,
          isPublic: true,
          views: true,
          likes: true,
          createdAt: true,
          user: { select: { username: true } },
        },
      }),
      prisma.communityDeck.count({ where }),
      prisma.communityDeck.findMany({
        distinct: ["legendName"],
        select: { legendName: true },
        orderBy: { legendName: "asc" },
      }),
    ]);

    const legends = distinctLegends.map((d) => d.legendName);
    const totalPages = Math.ceil(total / PER_PAGE);

    return (
      <div className="space-y-6">
        <Header tabs={tabs} activeTab={tab} />
        <DeckFilters tab={tab} legends={legends} />
        <div className="rounded-xl bg-surface border border-hairline overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[24%]">Titre</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[16%]">Légende</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[11%]">Auteur</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[6%]">Vues</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[6%]">Likes</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[9%]">Statut</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[12%]">Date</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[14%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {communityDecks.map((deck) => (
                <tr key={deck.id} className="border-b border-hairline last:border-0 hover:bg-surface-raised">
                  <td className="px-4 py-3">
                    <Link href={`/d/${deck.shareCode}`} className="text-ink hover:text-arcane transition-colors truncate block">
                      {deck.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-arcane truncate">{displayLegendName(deck.legendName)}</td>
                  <td className="px-4 py-3 text-sm text-ink-secondary truncate">
                    {deck.user?.username ?? deck.authorName}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">{deck.views}</td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">{deck.likes}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${deck.isPublic ? "bg-success/10 text-success" : "bg-surface-overlay text-ink-muted"}`}>
                      {deck.isPublic ? "Public" : "Privé"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted whitespace-nowrap">{formatDate(deck.createdAt)}</td>
                  <td className="px-4 py-3">
                    <CommunityActions shareCode={deck.shareCode} title={deck.title} isPublic={deck.isPublic} />
                  </td>
                </tr>
              ))}
              {communityDecks.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-ink-muted">Aucun deck communautaire</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} tab={tab} q={q} legend={legendFilter} tournament={tournamentFilter} />
      </div>
    );
  }

  if (tab === "decks") {
    const where: Prisma.DeckWhereInput = { published: true, tournamentContext: null };
    const andClauses: Prisma.DeckWhereInput[] = [];
    if (q) {
      andClauses.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { legendName: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    if (legendFilter) andClauses.push({ legendName: legendFilter });
    if (andClauses.length > 0) where.AND = andClauses;

    const [decks, total, distinctLegends] = await Promise.all([
      prisma.deck.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: PER_PAGE,
        select: {
          id: true,
          slug: true,
          title: true,
          legendName: true,
          published: true,
          featured: true,
          createdAt: true,
          cards: { select: { quantity: true } },
        },
      }),
      prisma.deck.count({ where }),
      prisma.deck.findMany({
        where: { published: true, tournamentContext: null },
        distinct: ["legendName"],
        select: { legendName: true },
        orderBy: { legendName: "asc" },
      }),
    ]);

    const legends = distinctLegends.map((d) => d.legendName);
    const totalPages = Math.ceil(total / PER_PAGE);

    return (
      <div className="space-y-6">
        <Header tabs={tabs} activeTab={tab} />
        <DeckFilters tab={tab} legends={legends} />
        <div className="rounded-xl bg-surface border border-hairline overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[35%]">Nom</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[25%]">Légende</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[8%]">Cartes</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[10%]">Statut</th>
                <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[12%]">Date</th>
              </tr>
            </thead>
            <tbody>
              {decks.map((deck) => {
                const cardTotal = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
                return (
                <tr key={deck.id} className="border-b border-hairline last:border-0 hover:bg-surface-raised">
                  <td className="px-4 py-3">
                    <Link href={`/decks/${deck.slug}`} className="text-ink hover:text-arcane transition-colors truncate block">
                      {deck.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-arcane truncate">{displayLegendName(deck.legendName)}</td>
                  <td className="px-4 py-3 text-sm text-ink-secondary">{cardTotal}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${deck.published ? "bg-success/10 text-success" : "bg-surface-overlay text-ink-muted"}`}>
                        {deck.published ? "Publié" : "Brouillon"}
                      </span>
                      {deck.featured && (
                        <span className="text-xs px-2 py-1 rounded-full whitespace-nowrap bg-gold/10 text-gold">
                          Vedette
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-muted whitespace-nowrap">{formatDate(deck.createdAt)}</td>
                </tr>
                );
              })}
              {decks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">Aucun deck best-of / éditorial</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} total={total} tab={tab} q={q} legend={legendFilter} tournament={tournamentFilter} />
      </div>
    );
  }

  // Default: globale (tournament decks)
  const where: Prisma.DeckWhereInput = { tournamentContext: { not: null as string | null } };
  const andClauses: Prisma.DeckWhereInput[] = [];
  if (q) {
    andClauses.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { legendName: { contains: q, mode: "insensitive" } },
        { playerName: { contains: q, mode: "insensitive" } },
        { tournamentContext: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (legendFilter) andClauses.push({ legendName: legendFilter });
  if (tournamentFilter) andClauses.push({ tournamentContext: tournamentFilter });
  if (andClauses.length > 0) where.AND = andClauses;

  const [decks, total, distinctLegends, distinctTournaments] = await Promise.all([
    prisma.deck.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
      select: {
        id: true,
        slug: true,
        title: true,
        legendName: true,
        published: true,
        tournamentContext: true,
        placement: true,
        playerName: true,
        createdAt: true,
        cards: { select: { quantity: true } },
      },
    }),
    prisma.deck.count({ where }),
    prisma.deck.findMany({
      where: { tournamentContext: { not: null } },
      distinct: ["legendName"],
      select: { legendName: true },
      orderBy: { legendName: "asc" },
    }),
    prisma.deck.findMany({
      where: { tournamentContext: { not: null } },
      distinct: ["tournamentContext"],
      select: { tournamentContext: true },
      orderBy: { tournamentContext: "asc" },
    }),
  ]);

  const legends = distinctLegends.map((d) => d.legendName);
  const tournaments = distinctTournaments.map((d) => d.tournamentContext!).filter(Boolean);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-6">
      <Header tabs={tabs} activeTab={tab} />
      <DeckFilters tab={tab} legends={legends} tournaments={tournaments} />
      <div className="rounded-xl bg-surface border border-hairline overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b border-hairline">
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[22%]">Joueur</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[18%]">Légende</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[20%]">Tournoi</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[6%]">Place</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[6%]">Cartes</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[12%]">Statut</th>
              <th className="text-left px-4 py-3 text-sm text-ink-muted font-medium w-[14%]">Date</th>
            </tr>
          </thead>
          <tbody>
            {decks.map((deck) => {
              const cardTotal = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
              return (
              <tr key={deck.id} className="border-b border-hairline last:border-0 hover:bg-surface-raised">
                <td className="px-4 py-3">
                  <Link href={`/decks/${deck.slug}`} className="text-ink hover:text-arcane transition-colors truncate block">
                    {deck.playerName ?? deck.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-arcane truncate">{displayLegendName(deck.legendName)}</td>
                <td className="px-4 py-3 text-sm text-ink-secondary truncate">{deck.tournamentContext}</td>
                <td className="px-4 py-3 text-sm text-ink-secondary">{deck.placement ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-ink-secondary">{cardTotal}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${deck.published ? "bg-success/10 text-success" : "bg-surface-overlay text-ink-muted"}`}>
                    {deck.published ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-ink-muted whitespace-nowrap">{formatDate(deck.createdAt)}</td>
              </tr>
              );
            })}
            {decks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">Aucun deck tournoi</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} total={total} tab={tab} q={q} legend={legendFilter} tournament={tournamentFilter} />
    </div>
  );
}

function Header({ tabs, activeTab }: { tabs: { key: Tab; label: string; count: number }[]; activeTab: Tab }) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-rubik)" }}>
          Decks
        </h1>
        {/* flex-wrap : les onglets avec leur compteur dépassaient de 20px à 390px. */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-surface-raised p-1">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/admin/decks?tab=${t.key}`}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                activeTab === t.key
                  ? "bg-arcane text-canvas"
                  : "text-ink-secondary hover:text-ink",
              )}
            >
              {t.label}
              <span className={cn(
                "text-xs rounded-full px-1.5 py-0.5",
                activeTab === t.key ? "bg-white/20" : "bg-surface text-ink-muted",
              )}>
                {t.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
      <Link
        href="/admin/decks/import"
        className="flex items-center gap-2 rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:brightness-110"
      >
        Importer un deck
      </Link>
    </div>
  );
}

function Pagination({ page, totalPages, total, tab, q, legend, tournament }: { page: number; totalPages: number; total: number; tab: Tab; q: string; legend: string; tournament: string }) {
  if (totalPages <= 1) return null;

  function buildHref(p: number) {
    const params = new URLSearchParams();
    params.set("tab", tab);
    params.set("page", String(p));
    if (q) params.set("q", q);
    if (legend) params.set("legend", legend);
    if (tournament) params.set("tournament", tournament);
    return `/admin/decks?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-muted">{total} résultats</span>
      <div className="flex items-center gap-2">
        {page > 1 && (
          <Link
            href={buildHref(page - 1)}
            className="rounded-lg bg-surface border border-hairline px-3 py-1.5 text-sm text-ink-secondary hover:text-ink"
          >
            Précédent
          </Link>
        )}
        <span className="text-sm text-ink-muted">
          Page {page} / {totalPages}
        </span>
        {page < totalPages && (
          <Link
            href={buildHref(page + 1)}
            className="rounded-lg bg-surface border border-hairline px-3 py-1.5 text-sm text-ink-secondary hover:text-ink"
          >
            Suivant
          </Link>
        )}
      </div>
    </div>
  );
}
