export const revalidate = 60;

import type { Metadata } from "next";
import Link from "@/components/lien";
import { BoutonLien } from "@/components/bouton";
import Image from "next/image";

const metadata: Metadata = {
  alternates: { canonical: "/" },
};
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookOpen, Layers, BookText, Shield, ArrowRight, Gamepad2, Newspaper, Trophy, Library, Search, Upload } from "lucide-react";
import { getBannerUrl, getLegendIconUrl } from "@/lib/banners";
import { legendFicheSlug, legendsWithDecks } from "@/lib/legend-fiche";
import { cn, displayLegendName, formatDate, slugify } from "@/lib/utils";
import { getTournamentInfo } from "@/lib/tournament-flags";
import { CountryBadge } from "@/components/country-badge";
import { HomeTierList } from "@/components/home-tier-list";
import { etiquetteLocale, traduire } from "@/lib/i18n";
import { langueCourante, metaTraduite } from "@/lib/i18n-server";
import { SET_EN_COURS } from "@/lib/tournament-order";
import { tournoiLePlusRecent, vainqueur } from "@/lib/card-play";
import { partsDuSet } from "@/lib/parts-classement";
import { afficherPlacement } from "@/lib/deck-listing-params";
import { TIER_TEXT_CLASS } from "@/lib/tier-colors";

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
        take: 3,
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
    // Le vainqueur de chaque tournoi affiché, quand sa liste est publiée : la ligne
    // ne disait que le nom et la date, et il fallait ouvrir le tournoi pour savoir
    // qui avait gagné, et avec quoi.
    const contextes = derniersTournoisRaw.map((g) => g.tournamentContext!);
    const listesClassees = contextes.length
      ? await prisma.deck.findMany({
          where: { published: true, tournamentContext: { in: contextes }, placement: { not: null } },
          select: { slug: true, legendName: true, playerName: true, placement: true, tournamentContext: true },
        })
      : [];
    const derniersTournois = derniersTournoisRaw.map((groupe) => {
      const context = groupe.tournamentContext!;
      const info = getTournamentInfo(context);
      const ajouteLe = groupe._max.createdAt;
      const gagnant = vainqueur(listesClassees.filter((d) => d.tournamentContext === context));
      return {
        slug: slugify(context),
        nom: info?.name ?? context,
        countryCode: info?.countryCode ?? null,
        date: info?.date ?? null,
        joueurs: info?.playerCount ?? null,
        vainqueur: gagnant
          ? { slug: gagnant.slug, legendName: gagnant.legendName, playerName: gagnant.playerName, icone: getLegendIconUrl(gagnant.legendName) }
          : null,
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
    // Les six Légendes du FORMAT EN COURS, comptées sur les joueurs classés.
    //
    // `legendsWithDecks()` classe toutes ères confondues : l'accueil ouvrait donc
    // sur Kai'Sa, Master Yi, Draven, Irelia, Viktor et Fiora, c'est-à-dire le méta
    // d'Origines et de Spiritforged. Kennen, qui domine Vendetta, n'y figurait
    // même pas. La page d'accueil annonçait un méta mort.
    //
    // `meta-parts.json` est la même source que /meta : les joueurs classés, pas
    // les decklists publiées. Une Légende sans page (aucun deck publié) est
    // écartée, sinon le lien mènerait nulle part.
    const parSlug = new Map(legends.map((l) => [l.slug, l]));
    const parts = partsDuSet(SET_EN_COURS);
    // Le tier affiché à côté d'une Légende est celui de la tier list du set en cours.
    const tierListDuSet = tierLists.find((tl) => tl.setContext === SET_EN_COURS) ?? null;
    const tierParSlug = new Map((tierListDuSet?.entries ?? []).map((e) => [legendFicheSlug(e.legendName), e.tier]));
    const topLegends = parts.lignes
      .flatMap((p) => {
        const l = parSlug.get(p.slug);
        return l ? [{ ...l, joueurs: p.joueurs, part: p.part, tier: tierParSlug.get(p.slug) ?? null }] : [];
      })
      .slice(0, 6);

    // Les Légendes de la tier list qui ont une page : la vignette n'y mène que si la
    // page existe, sinon le lien tomberait sur une 404.
    const pagesLegendes: [string, string][] = tierLists.flatMap((tl) =>
      tl.entries.flatMap((e): [string, string][] => {
        const slug = legendFicheSlug(e.legendName);
        return parSlug.has(slug) ? [[e.legendId, slug]] : [];
      }),
    );

    // À la une : la liste du dernier vainqueur connu. Ni prix ni bouton d'achat ici
    // (choix d'Allan, 12 novembre 2026) : l'achat vit sur la page du deck.
    // « Dernier » se lit sur la date du tournoi : la liste arrive triée par date d'import.
    const tournoiGagne = tournoiLePlusRecent(derniersTournois.filter((t) => t.vainqueur));
    const une = tournoiGagne?.vainqueur
      ? {
          slug: tournoiGagne.vainqueur.slug,
          legendName: tournoiGagne.vainqueur.legendName,
          playerName: tournoiGagne.vainqueur.playerName,
          banniere: getBannerUrl(tournoiGagne.vainqueur.legendName),
          tournoi: tournoiGagne.nom,
          date: tournoiGagne.date,
          joueurs: tournoiGagne.joueurs,
        }
      : null;

    return {
      tierLists, topLegends, legendEntries, latestArticles, derniersTournois, cardCount, pagesLegendes, une,
      chiffres: { joueurs: parts.total, tournois: parts.tournois, tierListLe: tierListDuSet?.updatedAt ?? null },
    };
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
    href: "/guides/ban-list",
    icon: Trophy,
    title: "Liste des bans",
    description: "Les cartes interdites en tournoi, et depuis quand.",
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


const rubik = { fontFamily: "var(--font-rubik), sans-serif" };
const PANNEAU = "flex flex-col overflow-hidden rounded-card border border-hairline bg-surface";
const LIEN_TETE = "min-h-11 sm:min-h-6 flex items-center gap-1 text-xs text-arcane hover:text-arcane-light";

export default async function HomePage() {
  let donnees: Awaited<ReturnType<typeof getHomeData>> | null = null;
  try {
    donnees = await getHomeData();
  } catch {
    donnees = null;
  }
  const chargementEchoue = donnees === null;
  const tierLists = donnees?.tierLists ?? [];
  const topLegends = donnees?.topLegends ?? [];
  const latestArticles = donnees?.latestArticles ?? [];
  const derniersTournois = donnees?.derniersTournois ?? [];
  const cardCount = donnees?.cardCount ?? 0;
  const legendMap = new Map(donnees?.legendEntries ?? []);
  const une = donnees?.une ?? null;
  const chiffres = donnees?.chiffres ?? null;

  const langue = await langueCourante();
  const t = (texte: string) => traduire(texte, langue);
  const locale = etiquetteLocale(langue);
  const partMax = Math.max(0.01, ...topLegends.map((l) => l.part));

  return (
    <div>
      {/* Haut de page : le logo, le titre, la recherche et les chiffres du set à gauche,
          le deck du dernier vainqueur à droite. Le logo reste ici en grand, en plus de
          celui de la barre (demande d'Allan, 12 novembre 2026). */}
      <section className="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-stretch">
          <div className="flex flex-col justify-center gap-4 lg:py-4">
            <Link href="/" className="self-start">
              <Image
                src="/logorbfr.png"
                alt="Riftbound France"
                width={224}
                height={112}
                priority
                className="h-20 w-auto drop-shadow-lg sm:h-24"
              />
            </Link>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl" style={rubik}>
              {t("Riftbound France, la référence du TCG en français")}
            </h1>
            {/* Sous-titre : deux liens à ancre forte qui envoient l'intention « deck »
                vers /decks et « tier list » vers /tier-list. Sans ça, l'accueil captait
                « riftbound deck » (pos 7) sans jamais laisser /decks (pos 13) gagner. */}
            <p className="text-sm text-ink-secondary sm:text-base">
              <Link href="/decks" className="text-arcane hover:underline">{t("Decks de tournoi")}</Link>
              {", "}
              <Link href="/tier-list" className="text-arcane hover:underline">{t("tier list du méta")}</Link>
              {t(" et base de cartes Riftbound, en français.")}
            </p>
            {/* Une vraie recherche : elle mène aux résultats de /decks. */}
            <form action="/decks" method="get" role="search" className="flex h-12 max-w-xl items-center gap-3 rounded-lg border border-hairline-field bg-surface px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-arcane">
              <Search size={18} className="shrink-0 text-ink-muted" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder={t("Chercher un deck, une Légende, un joueur")}
                aria-label={t("Chercher un deck, une Légende, un joueur")}
                className="h-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-muted"
              />
            </form>
            {/* Empilés sous 640 px : deux par rangée, « Trouver un deck » tenait dans
                168 px pour 182 de libellé et touchait sa pastille. */}
            <div className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
              <BoutonLien href="/decks" className="sm:flex-1">{t("Trouver un deck")}</BoutonLien>
              <BoutonLien href="/cartes" variante="contour" className="sm:flex-1">{t("Voir les cartes")}</BoutonLien>
              <BoutonLien href="/guides/debuter" variante="neutre" className="sm:flex-1">{t("Débuter")}</BoutonLien>
            </div>
            {chiffres && chiffres.joueurs > 0 && (
              <dl className="flex flex-wrap gap-x-8 gap-y-2 pt-1">
                {[
                  [chiffres.joueurs.toLocaleString(locale), `${t("joueurs classés en")} ${SET_EN_COURS}`],
                  [String(chiffres.tournois), t("tournois comptés")],
                  ...(chiffres.tierListLe ? [[formatDate(chiffres.tierListLe, locale), t("tier list à jour")]] : []),
                ].map(([valeur, libelle]) => (
                  <div key={libelle}>
                    <dd className="text-xl font-bold text-ink" style={rubik}>{valeur}</dd>
                    <dt className="text-xs text-ink-muted">{libelle}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {une && (
            <article className={PANNEAU}>
              <Link href={`/decks/${une.slug}`} className="group relative block aspect-[7/3] overflow-hidden">
                {une.banniere && (
                  <Image src={une.banniere} alt="" width={700} height={300} priority sizes="(max-width: 1024px) 100vw, 512px"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="text-xs text-white/80">{t("Le deck du dernier vainqueur")}</div>
                  <div className="text-xl font-bold text-white drop-shadow" style={rubik}>
                    {[une.playerName, displayLegendName(une.legendName)].filter(Boolean).join(", ")}
                  </div>
                </div>
              </Link>
              <div className="flex flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4">
                <p className="min-w-0 flex-1 basis-56 text-sm text-ink-secondary">
                  {[
                    `${afficherPlacement("1st", langue)}, ${une.tournoi}`,
                    une.date ? formatDate(une.date, locale) : null,
                    une.joueurs ? `${une.joueurs.toLocaleString(locale)} ${t("joueurs")}` : null,
                  ].filter(Boolean).join(" · ")}
                </p>
                <Link href={`/decks/${une.slug}`} className={LIEN_TETE}>{t("Voir la liste")} <ArrowRight size={14} /></Link>
              </div>
            </article>
          )}
        </div>
      </section>

      {chargementEchoue && (
        <p role="alert" className="mx-4 mb-6 rounded-lg border border-hairline bg-surface px-4 py-3 text-center text-sm text-ink-secondary sm:mx-6 lg:mx-8">
          {t("Les données n’ont pas pu se charger.")}
        </p>
      )}

      {/* La tier list passe en premier et prend la place : « riftbound meta » et
          « tier list riftbound » sont les requêtes de tête. À droite, les Légendes les
          plus jouées puis les guides, empilés. */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {!chargementEchoue && <HomeTierList tierLists={tierLists} legendMap={legendMap} pages={Object.fromEntries(donnees?.pagesLegendes ?? [])} />}
          </div>

          <div className="grid gap-6 lg:col-span-5">
            <div className={PANNEAU}>
              <div className="border-b border-hairline px-4 py-3 flex items-center justify-between">
                <h2 className="titre-bloc text-lg font-bold" style={rubik}>{t("Légendes les plus jouées")}</h2>
                <Link href="/decks" className={LIEN_TETE}>{t("Tous les decks Riftbound")} <ArrowRight size={14} /></Link>
              </div>
              {/* Une ligne par Légende, avec son rang, sa part des joueurs classés et
                  son tier : la ligne ne disait que le nombre de joueurs, sur 105 px de
                  haut. `meta-parts.json` est la même source que /meta. */}
              <div className="flex flex-col divide-y divide-hairline">
                {topLegends.map((legend, i) => {
                  const imgUrl = getLegendIconUrl(legend.legendName) ?? getBannerUrl(legend.legendName);
                  return (
                    <Link key={legend.slug} href={`/legendes/${legend.slug}`} className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-raised">
                      <span className="w-4 shrink-0 text-center text-sm tabular-nums text-ink-muted">{i + 1}</span>
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-raised">
                        {imgUrl && <Image src={imgUrl} alt="" fill sizes="44px" loading="lazy" className="object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="truncate text-sm font-bold text-ink transition-colors group-hover:text-arcane" style={rubik}>{displayLegendName(legend.legendName)}</span>
                          {legend.tier && <span className={cn("shrink-0 text-xs font-bold", TIER_TEXT_CLASS[legend.tier])}>Tier {legend.tier}</span>}
                        </div>
                        <div className="mt-1.5 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
                            <div className="h-full rounded-full bg-arcane" style={{ width: `${(legend.part / partMax) * 100}%` }} />
                          </div>
                          <span className="shrink-0 text-xs tabular-nums text-ink-muted">
                            {legend.joueurs.toLocaleString(locale)} {t("joueurs")}, {(legend.part * 100).toLocaleString(locale, { maximumFractionDigits: 1 })} %
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {!chargementEchoue && topLegends.length === 0 && <p className="px-4 py-6 text-sm text-ink-muted">{t("Aucun deck pour le moment.")}</p>}
              </div>
            </div>

            <div className={PANNEAU}>
              <div className="border-b border-hairline px-4 py-3 flex items-center justify-between">
                <h2 className="titre-bloc text-lg font-bold" style={rubik}>Guides</h2>
                <Link href="/guides" className={LIEN_TETE}>{t("Tous")} <ArrowRight size={14} /></Link>
              </div>
              <div className="grid sm:grid-cols-2">
                {guides.map((guide) => (
                  <Link key={guide.href} href={guide.href} className="group flex min-h-14 items-center gap-3 border-b border-hairline px-4 py-2.5 transition-colors hover:bg-surface-raised sm:odd:border-r">
                    <guide.icon className="shrink-0 text-arcane" size={20} aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-ink group-hover:text-arcane" style={rubik}>{t(guide.title)}</div>
                      <div className="truncate text-xs text-ink-muted">{t(guide.description)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tournois et articles */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-6 lg:grid-cols-12">
          <div className={cn(PANNEAU, "lg:col-span-5")}>
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="titre-bloc flex items-center gap-2 text-lg font-bold" style={rubik}>
                <Trophy size={18} className="text-gold" /> {t("Tournois")}
              </h2>
              <Link href="/tournois" className={LIEN_TETE}>{t("Tous")} <ArrowRight size={14} /></Link>
            </div>
            {!chargementEchoue && derniersTournois.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-muted">{t("Aucun tournoi pour le moment.")}</p>
            ) : (
              <div className="flex flex-1 flex-col divide-y divide-hairline">
                {derniersTournois.map((tournoi) => (
                  <Link key={tournoi.slug} href={`/tournois/${tournoi.slug}`} className="group flex flex-1 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-raised">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-surface-raised">
                      {tournoi.countryCode ? <CountryBadge code={tournoi.countryCode} /> : <Trophy size={15} className="text-gold" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold text-ink transition-colors group-hover:text-arcane" style={rubik}>{tournoi.nom}</span>
                        {tournoi.recent && <span className="shrink-0 rounded-full bg-arcane px-1.5 py-0.5 text-[10px] font-bold text-canvas">{t("Nouveau")}</span>}
                      </div>
                      <div className="truncate text-xs text-ink-muted">
                        {[tournoi.date ? formatDate(tournoi.date, locale) : null, tournoi.joueurs ? `${tournoi.joueurs.toLocaleString(locale)} ${t("joueurs")}` : null].filter(Boolean).join(", ")}
                      </div>
                    </div>
                    {tournoi.vainqueur && (
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="hidden text-right sm:block">
                          <div className="max-w-32 truncate text-xs font-semibold text-ink-secondary">{tournoi.vainqueur.playerName ?? t("Vainqueur")}</div>
                          <div className="text-xs text-ink-muted">{displayLegendName(tournoi.vainqueur.legendName).split(",")[0]}</div>
                        </div>
                        {tournoi.vainqueur.icone && (
                          <Image src={tournoi.vainqueur.icone} alt={`${t("Vainqueur")} : ${displayLegendName(tournoi.vainqueur.legendName)}`} width={36} height={36} className="h-9 w-9 rounded-lg object-cover" />
                        )}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={cn(PANNEAU, "lg:col-span-7")}>
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <h2 className="titre-bloc flex items-center gap-2 text-lg font-bold" style={rubik}>
                <Newspaper size={18} className="text-violet-light" /> {t("Derniers articles")}
              </h2>
              <Link href="/articles" className={LIEN_TETE}>{t("Tous")} <ArrowRight size={14} /></Link>
            </div>
            {!chargementEchoue && latestArticles.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-muted">{t("Aucun article pour le moment.")}</p>
            ) : (
              // Trois cartes à couverture : le titre tenait sur une ligne tronquée à
              // côté d'une vignette de 64 px.
              <div className="grid flex-1 gap-4 p-4 sm:grid-cols-3">
                {latestArticles.map((a) => (
                  <Link key={a.slug} href={`/articles/${a.slug}`} className="group flex min-w-0 flex-col">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-surface-raised">
                      {a.coverImage ? (
                        <Image src={a.coverImage} alt="" fill sizes="(max-width: 640px) 100vw, 260px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ink-muted"><Newspaper size={20} /></div>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-violet-light">
                      {t(categoryLabels[a.category] ?? a.category)}
                      {a.publishedAt && <span className="font-normal normal-case text-ink-muted">{formatDate(a.publishedAt, locale)}</span>}
                    </div>
                    <div className="mt-1 line-clamp-3 text-sm font-bold leading-snug text-ink group-hover:text-arcane" style={rubik}>{t(a.title)}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Collection : une bande, plus une colonne entière. */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="titre-bloc flex items-center gap-2 text-lg font-bold" style={rubik}>
              <Library size={18} className="text-arcane" /> {t("Ma collection")}
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              {t("Suivez votre collection Riftbound en classeurs, repérez les cartes qui vous manquent et voyez quels decks méta vous pouvez déjà jouer.")}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {cardCount > 0 && (
              <div className="rounded-lg border border-hairline bg-canvas/60 px-3 py-2">
                <div className="text-lg font-bold leading-tight text-arcane" style={rubik}>{cardCount.toLocaleString(locale)}</div>
                <div className="text-[11px] uppercase tracking-wider text-ink-muted">{t("cartes à collectionner")}</div>
              </div>
            )}
            <div className="rounded-lg border border-hairline bg-canvas/60 px-3 py-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold"><Upload size={14} className="text-arcane" /> Import CSV</div>
              <div className="text-[11px] uppercase tracking-wider text-ink-muted">Piltover Archive</div>
            </div>
            <BoutonLien href="/collection">{t("Gérer ma collection")}</BoutonLien>
          </div>
        </div>
      </section>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
