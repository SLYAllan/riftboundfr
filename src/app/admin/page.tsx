export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";
import { SyncButton } from "./sync-button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  await verifyAdmin();

  const [
    cardCount, articleCount, deckCount, eventCount,
    communityDeckCount, userCount, commentCount, tierListCount,
    recentArticles, recentDecks, recentCommunityDecks, recentComments,
    tournamentStats,
  ] = await Promise.all([
    prisma.card.count(),
    prisma.article.count({ where: { published: true } }),
    prisma.deck.count({ where: { published: true } }),
    prisma.event.count(),
    prisma.communityDeck.count({ where: { isPublic: true } }),
    prisma.user.count(),
    prisma.comment.count(),
    prisma.tierList.count({ where: { published: true } }),
    prisma.article.findMany({
      where: { published: true },
      select: { id: true, title: true, slug: true, category: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.deck.findMany({
      where: { published: true },
      select: { id: true, title: true, slug: true, tournamentContext: true, legendName: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.communityDeck.findMany({
      where: { isPublic: true },
      select: { shareCode: true, title: true, legendName: true, authorName: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.comment.findMany({
      select: { id: true, body: true, createdAt: true, user: { select: { username: true } }, article: { select: { title: true, slug: true } }, communityDeck: { select: { title: true, shareCode: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.deck.groupBy({
      by: ["tournamentContext"],
      where: { published: true, NOT: { tournamentContext: null } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
  ]);

  const stats = [
    { label: "Cartes", value: cardCount, href: null },
    { label: "Articles", value: articleCount, href: "/admin/articles" },
    { label: "Decks tournois", value: deckCount, href: "/admin/decks" },
    { label: "Decks communautaires", value: communityDeckCount, href: null },
    { label: "Utilisateurs", value: userCount, href: null },
    { label: "Commentaires", value: commentCount, href: null },
    { label: "Événements", value: eventCount, href: "/admin/events" },
    { label: "Tier Lists", value: tierListCount, href: "/admin/tier-list" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-rubik)" }}>
        Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const inner = (
            <>
              <p className="text-3xl font-bold text-arcane">{stat.value.toLocaleString("fr-FR")}</p>
              <p className="text-sm text-ink-secondary mt-1">{stat.label}</p>
            </>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className="p-5 rounded-xl bg-surface border border-hairline hover:border-arcane/30 transition-colors">
              {inner}
            </Link>
          ) : (
            <div key={stat.label} className="p-5 rounded-xl bg-surface border border-hairline">
              {inner}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Articles récents">
          {recentArticles.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucun article</p>
          ) : (
            <ul className="space-y-2">
              {recentArticles.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={`/admin/articles/${a.id}`} className="text-ink hover:text-arcane truncate">
                    {a.title}
                  </Link>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {a.publishedAt ? formatDate(a.publishedAt) : "-"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Derniers decks tournois">
          {recentDecks.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucun deck</p>
          ) : (
            <ul className="space-y-2">
              {recentDecks.map((d) => (
                <li key={d.id} className="text-sm">
                  <Link href={`/decks/${d.slug}`} className="text-ink hover:text-arcane">
                    {d.legendName.split(" - ")[0].split(",")[0]}
                  </Link>
                  {d.tournamentContext && (
                    <span className="ml-2 text-xs text-ink-muted">{d.tournamentContext}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Decks communautaires récents">
          {recentCommunityDecks.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucun deck</p>
          ) : (
            <ul className="space-y-2">
              {recentCommunityDecks.map((d) => (
                <li key={d.shareCode} className="flex items-center justify-between gap-2 text-sm">
                  <Link href={`/d/${d.shareCode}`} className="text-ink hover:text-arcane truncate">
                    {d.title}
                  </Link>
                  <span className="shrink-0 text-xs text-ink-muted">{d.authorName}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Commentaires récents">
          {recentComments.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucun commentaire</p>
          ) : (
            <ul className="space-y-2">
              {recentComments.map((c) => (
                <li key={c.id} className="text-sm">
                  <span className="font-medium text-ink">{c.user.username}</span>
                  <span className="text-ink-muted"> sur </span>
                  {c.article ? (
                    <Link href={`/articles/${c.article.slug}`} className="text-arcane hover:underline">
                      {c.article.title}
                    </Link>
                  ) : c.communityDeck ? (
                    <Link href={`/d/${c.communityDeck.shareCode}`} className="text-arcane hover:underline">
                      {c.communityDeck.title}
                    </Link>
                  ) : (
                    <span className="text-ink-muted">contenu supprimé</span>
                  )}
                  <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section title="Decks par tournoi">
        {tournamentStats.length === 0 ? (
          <p className="text-sm text-ink-muted">Aucun tournoi</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tournamentStats.map((t) => (
              <div key={t.tournamentContext} className="flex items-center justify-between gap-2 rounded-lg bg-surface-raised px-3 py-2 text-sm">
                <span className="text-ink truncate">{t.tournamentContext}</span>
                <span className="shrink-0 font-semibold text-arcane">{t._count.id}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Synchronisation Riftcodex">
        <p className="text-ink-secondary text-sm mb-4">
          Importe toutes les cartes et sets depuis l&apos;API Riftcodex.
        </p>
        <SyncButton />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-xl bg-surface border border-hairline">
      <h2 className="text-lg font-bold text-ink mb-3" style={{ fontFamily: "var(--font-rubik)" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
