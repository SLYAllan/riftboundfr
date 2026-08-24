export const revalidate = 60;

import type { Metadata } from "next";
import Link from "@/components/lien";
import Image from "next/image";

const metadata: Metadata = {
  alternates: { canonical: "/" },
};
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookOpen, Layers, BookText, Shield, ArrowRight, Gamepad2, Newspaper, Trophy, Library, Upload } from "lucide-react";
import { getBannerUrl, getLegendIconUrl } from "@/lib/banners";
import { legendsWithDecks } from "@/lib/legend-fiche";
import { displayLegendName, formatDate, slugify } from "@/lib/utils";
import { getTournamentInfo } from "@/lib/tournament-flags";
import { CountryBadge } from "@/components/country-badge";
import { HomeTierList } from "@/components/home-tier-list";
import { etiquetteLocale, traduire } from "@/lib/i18n";
import { langueCourante, metaTraduite } from "@/lib/i18n-server";

const getHomeData = unstable_cache(
  async () => {
    const [tierLists, legends, latestArticles, cardCount, derniersTournoisRaw] = await Promise.all([
      prisma.tierList.findMany({
        where: { published: true },
        include: { entries: { orderBy: { position: "asc" } } },
        orderBy: { createdAt: "asc" },
      }),
      legendsWithDecks(),
      prisma.article.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: { slug: true, title: true, coverImage: true, category: true, publishedAt: true },
      }),
      prisma.card.count(),
      // Derniers tournois AJOUTÉS, pas les plus récents par date de jeu : on trie
      // par date de seed (createdAt), pour que la carte signale ce qui vient
      // d'arriver sur le site, même sans article de récap (les City Challenges
      // n'en ont pas). Se met à jour tout seul à chaque seed.
      prisma.deck.groupBy({
        by: ["tournamentContext"],
        where: { published: true, tournamentContext: { not: null } },
        _max: { createdAt: true },
        orderBy: { _max: { createdAt: "desc" } },
        take: 6,
      }),
    ]);

    // « Nouveau » se décide ICI, au chargement des données, et pas dans le rendu :
    // `Date.now()` pendant le rendu est une lecture impure, refusée par le lint.
    const maintenant = Date.now();
    const derniersTournois = derniersTournoisRaw.map((groupe) => {
      const context = groupe.tournamentContext!;
      const info = getTournamentInfo(context);
      const ajouteLe = groupe._max.createdAt;
      return {
        slug: slugify(context),
        nom: info?.name ?? context,
        countryCode: info?.countryCode ?? null,
        date: info?.date ?? null,
        ajouteLe: ajouteLe?.toISOString() ?? null,
        // Ajouté au site il y a moins de 7 jours (date de seed), pas la date du
        // tournoi : c'est ce qui vient d'arriver qu'on signale.
        recent: ajouteLe ? maintenant - ajouteLe.getTime() < 7 * 24 * 3600 * 1000 : false,
      };
    });

    const legendIds = [
      ...new Set(tierLists.flatMap((tl) => tl.entries.map((e) => e.legendId))),
    ];
    const legendCards = legendIds.length
      ? await prisma.card.findMany({
          where: { riftboundId: { in: legendIds } },
        })
      : [];
    const legendEntries: [string, { imageUrl: string | null; domains: string[] }][] =
      legendCards.map((c) => [
        c.riftboundId,
        { imageUrl: getLegendIconUrl(c.name) ?? c.imageUrl, domains: c.domains },
      ]);

    // Six Légendes les plus jouées, pas six decks au hasard. Search Console (juillet
    // 2026) : l'accueil est en position 8,6 sur « riftbound deck » et n'y convertit pas,
    // pendant que `/decks` reste bloqué en 13,5 derrière elle. Le bloc renvoyait vers
    // six decklists tirées au sort, sans rapport avec la recherche. Il renvoie
    // maintenant vers les pages de Légende, qui visent « deck <légende> ».
    const topLegends = legends.slice(0, 6);

    return { tierLists, topLegends, legendEntries, latestArticles, derniersTournois, cardCount };
  },
  ["home-data"],
  { revalidate: 60, tags: ["home"] },
);

const categoryLabels: Record<string, string> = {
  actualite: "Actualité",
  guide: "Guide",
  tournoi: "Tournoi",
  meta: "Méta",
  "patch-notes": "Notes de patch",
};

const guides = [
  {
    href: "/guides/debuter",
    icon: BookOpen,
    title: "Guide du débutant",
    description: "Règles, phases de tour, ressources et conditions de victoire.",
  },
  {
    href: "/guides/deckbuilding",
    icon: Layers,
    title: "Guide de deckbuilding",
    description: "Courbe d'énergie, ratios et synergies de domaines.",
  },
  {
    href: "/guides/meta",
    icon: Trophy,
    title: "Méta & Tier List",
    description: "Résultats de tournois, tendances et lecture du méta.",
  },
  {
    href: "/guides/domaines",
    icon: Shield,
    title: "Les 6 Domaines",
    description: "Furie, Calme, Esprit, Corps, Chaos, Ordre : forces et légendes.",
  },
  {
    href: "/guides/glossaire",
    icon: BookText,
    title: "Glossaire",
    description: "Tous les mots-clés et termes du jeu en français.",
  },
  {
    href: "/guides/jouer-en-ligne",
    icon: Gamepad2,
    title: "Jouer en ligne",
    description: "TCG Arena et RiftAtlas : comment jouer depuis chez vous.",
  },
];

export default async function HomePage() {
  let tierLists: Awaited<ReturnType<typeof getHomeData>>["tierLists"] = [];
  let topLegends: Awaited<ReturnType<typeof getHomeData>>["topLegends"] = [];
  let latestArticles: Awaited<ReturnType<typeof getHomeData>>["latestArticles"] = [];
  let derniersTournois: Awaited<ReturnType<typeof getHomeData>>["derniersTournois"] = [];
  let cardCount = 0;
  let legendMap = new Map<string, { imageUrl: string | null; domains: string[] }>();
  try {
    const data = await getHomeData();
    tierLists = data.tierLists;
    topLegends = data.topLegends;
    latestArticles = data.latestArticles;
    derniersTournois = data.derniersTournois;
    cardCount = data.cardCount;
    legendMap = new Map(data.legendEntries);
  } catch {}

  const langue = await langueCourante();
  const t = (texte: string) => traduire(texte, langue);
  const locale = etiquetteLocale(langue);

  return (
    <div>
      {/* Hero - Logo centered */}
      <section className="flex flex-col items-center gap-3 px-4 pt-10 pb-6">
        <Link href="/">
          <Image
            src="/logorbfr.png"
            alt="Riftbound France"
            width={224}
            height={112}
            priority
            className="h-20 sm:h-28 w-auto drop-shadow-lg"
          />
        </Link>
        <h1
          className="text-center text-2xl font-bold sm:text-3xl"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          {t("Riftbound France, la référence du TCG en français")}
        </h1>
        {/* Sous-titre : deux liens à ancre forte qui envoient l'intention « deck »
            vers /decks et « tier list » vers /tier-list. Sans ça, l'accueil captait
            « riftbound deck » (pos 7) sans jamais laisser /decks (pos 13) gagner. */}
        <p className="max-w-xl text-center text-sm text-ink-secondary sm:text-base">
          <Link href="/decks" className="text-arcane hover:underline">{t("Decks de tournoi")}</Link>
          {", "}
          <Link href="/tier-list" className="text-arcane hover:underline">{t("tier list du méta")}</Link>
          {t(" et base de cartes Riftbound, en français.")}
        </p>
      </section>

      {/* 3-column layout */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr] items-stretch">
          {/* Left - Légendes les plus jouées */}
          <div className="flex flex-col rounded-card border border-hairline bg-surface overflow-hidden">
            <div className="border-b border-hairline px-4 py-3 flex items-center justify-between">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-rubik), sans-serif" }}
              >
                {t("Légendes les plus jouées")}
              </h2>
              <Link
                href="/decks"
                className="flex items-center gap-1 text-xs text-arcane hover:text-arcane-light"
              >
                {t("Tous les decks Riftbound")} <ArrowRight size={14} />
              </Link>
            </div>
            {/* Des lignes, pas des pavés. En vignettes carrées sur deux colonnes,
                chaque Légende occupait 207 px alors que la même icône fait 48 px
                dans la tier list juste à droite : la colonne écrasait ses deux
                voisines, et les deux dernières Légendes sortaient du cadre. Une
                ligne par Légende reprend le rythme de la colonne Guides et la
                taille d'icône de la tier list. */}
            <div className="flex flex-1 flex-col divide-y divide-hairline">
              {topLegends.map((legend) => {
                // Icône de légende = image source carrée (800×800), nette en petit ;
                // fallback bannière large si pas d'icône.
                const imgUrl = getLegendIconUrl(legend.legendName) ?? getBannerUrl(legend.legendName);
                return (
                  <Link
                    key={legend.slug}
                    href={`/legendes/${legend.slug}`}
                    className="group flex flex-1 items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-raised"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-raised">
                      {imgUrl && (
                        <Image
                          src={imgUrl}
                          alt={legend.legendName}
                          fill
                          sizes="48px"
                          loading="lazy"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className="block truncate text-sm font-bold text-ink transition-colors group-hover:text-arcane"
                        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                      >
                        {displayLegendName(legend.legendName)}
                      </span>
                      <div className="mt-0.5 truncate text-xs text-ink-muted">
                        {legend.deckCount.toLocaleString(locale)} {t("decks")}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center - Guides list */}
          <div className="rounded-card border border-hairline bg-surface overflow-hidden flex flex-col">
            <div className="border-b border-hairline px-5 py-3">
              <h2
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-rubik), sans-serif" }}
              >
                Guides
              </h2>
            </div>
            <div className="divide-y divide-hairline flex-1">
              {guides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="flex items-start gap-4 px-5 py-5 transition-colors hover:bg-surface-raised/50"
                >
                  <guide.icon className="mt-0.5 shrink-0 text-arcane" size={22} />
                  <div>
                    <div
                      className="font-bold text-base"
                      style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                    >
                      {t(guide.title)}
                    </div>
                    <p className="mt-1 text-sm text-ink-secondary leading-relaxed">
                      {t(guide.description)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right - Tier list */}
          <HomeTierList tierLists={tierLists} legendMap={legendMap} />
        </div>
      </section>

      {/* Encarts - Articles · Collection · Tournois */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {/* Articles */}
          <div className="rounded-card border border-hairline bg-surface overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                <Newspaper size={18} className="text-violet-light" /> {t("Derniers articles")}
              </h2>
              <Link href="/articles" className="flex items-center gap-1 text-xs text-arcane hover:text-arcane-light">
                {t("Tous")} <ArrowRight size={14} />
              </Link>
            </div>
            {latestArticles.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-muted">{t("Aucun article pour le moment.")}</p>
            ) : (
              <div className="divide-y divide-hairline flex-1">
                {latestArticles.map((a) => (
                  <Link key={a.slug} href={`/articles/${a.slug}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-raised/50">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-surface-raised">
                      {a.coverImage ? (
                        <Image src={a.coverImage} alt="" fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ink-muted"><Newspaper size={16} /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-violet-light">
                        {t(categoryLabels[a.category] ?? a.category)}
                        {a.publishedAt && <span className="font-normal normal-case text-ink-muted">{formatDate(a.publishedAt, locale)}</span>}
                      </div>
                      <div className="mt-0.5 truncate text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t(a.title)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Collection */}
          <div className="rounded-card border border-hairline bg-surface overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                <Library size={18} className="text-arcane" /> {t("Ma collection")}
              </h2>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <p className="text-sm text-ink-secondary leading-relaxed">
                {t("Suivez votre collection Riftbound en classeurs, repérez les cartes qui vous manquent et voyez quels decks méta vous pouvez déjà jouer.")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-hairline bg-canvas/60 px-3 py-2.5">
                  <div className="text-xl font-bold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{cardCount.toLocaleString(locale)}</div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-muted">{t("cartes à collectionner")}</div>
                </div>
                <div className="rounded-lg border border-hairline bg-canvas/60 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 text-sm font-semibold"><Upload size={14} className="text-arcane" /> Import CSV</div>
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-ink-muted">Piltover Archive</div>
                </div>
              </div>
              <Link href="/collection" className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-arcane px-4 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-arcane/90">
                {t("Gérer ma collection")} <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Tournois */}
          <div className="rounded-card border border-hairline bg-surface overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                <Trophy size={18} className="text-gold" /> {t("Tournois")}
              </h2>
              <Link href="/tournois" className="flex items-center gap-1 text-xs text-arcane hover:text-arcane-light">
                {t("Tous")} <ArrowRight size={14} />
              </Link>
            </div>
            {derniersTournois.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-muted">{t("Aucun tournoi pour le moment.")}</p>
            ) : (
              <div className="divide-y divide-hairline flex-1">
                {derniersTournois.map((tournoi) => {
                  const recent = tournoi.recent;
                  return (
                    <Link key={tournoi.slug} href={`/tournois/${tournoi.slug}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-raised/50">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-raised">
                        {tournoi.countryCode ? <CountryBadge code={tournoi.countryCode} /> : <Trophy size={15} className="text-gold" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{tournoi.nom}</span>
                          {recent && <span className="shrink-0 rounded-full bg-arcane px-1.5 py-0.5 text-[10px] font-bold text-canvas">{t("Nouveau")}</span>}
                        </div>
                        {tournoi.date && <div className="text-[11px] text-ink-muted">{formatDate(tournoi.date, locale)}</div>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
