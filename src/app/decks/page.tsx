export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "@/components/lien";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Hammer, Users, Trophy, Star, Eye, Heart, Search, SlidersHorizontal } from "lucide-react";
import { cn, formatDate, displayLegendName } from "@/lib/utils";
import { DeckLegendFilter } from "@/components/deck-legend-filter";
import { DeckFiltreSelect } from "@/components/deck-filtre-select";
import { DeckTournamentFilter } from "@/components/deck-tournament-filter";
import { DeckLikeButton } from "@/components/deck-like-button";
import { getBannerUrl } from "@/lib/banners";
import { getTournamentCountryCode, getTournamentInfo } from "@/lib/tournament-flags";
import { getUserFromSession } from "@/lib/session";
import { getOwnedByName } from "@/lib/collection-server";
import { computeDeckCoverage, type DeckCardLike } from "@/lib/collection";
import { decodeDeck } from "@/lib/deck-codec";
import { deckCoverageItems } from "@/lib/deck-cards";
import { CountryBadge } from "@/components/country-badge";
import type { Metadata } from "next";
import { metaTraduite, tr, langueCourante } from "@/lib/i18n-server";
import { etiquetteLocale } from "@/lib/i18n";
import { construireWhere, lireFiltresDecks, listerDecks, modifierParametresDecks } from "@/lib/deck-listing";
import { DecksProgressifs } from "./decks-progressifs";

const metadata: Metadata = {
  title: { absolute: "Decks Riftbound en français - decklists de tournois et guides" },
  description:
    "Decklists Riftbound en français : decks gagnants de tournois (Regional Opens, RQ), builds compétitifs et guides par Légende.",
  alternates: { canonical: "/decks" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Decks Riftbound en français - decklists de tournois et guides",
    description:
      "Decklists de tournois, builds compétitifs et guides pour chaque Légende Riftbound.",
    images: ["/img/og-default.png"],
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

// Classes littérales : Tailwind ne génère que ce qu'il voit écrit en toutes lettres,
// une classe construite (`bg-tier-${x}`) ne sort jamais.
const TIER_BG: Record<string, string> = {
  S: "bg-tier-s", A: "bg-tier-a", B: "bg-tier-b", C: "bg-tier-c", D: "bg-tier-d",
};

const CATEGORIES = [
  { key: "community", label: "Communautaires", href: "/decks?cat=community", icon: Users, isLink: false },
  { key: "bestof", label: "Best of", href: "/decks?cat=bestof", icon: Star, isLink: false },
  // Pas d'onglet « Avec guide » : aucun deck publié ne porte de guide aujourd'hui,
  // l'onglet ne menait qu'à une page vide.
] as const;

export default async function DecksPage({ searchParams }: PageProps) {
  const t = await tr();
  const locale = etiquetteLocale(await langueCourante());
  const params = await searchParams;
  const parametresCourants = new URLSearchParams(
    Object.entries(params).filter((entree): entree is [string, string] => typeof entree[1] === "string"),
  );
  const hrefDecks = (changements: Record<string, string | null>) => {
    const suivants = modifierParametresDecks(parametresCourants, changements);
    return suivants.size ? `/decks?${suivants}` : "/decks";
  };
  const cat = params.cat;
  const legendFilter = params.legend;
  const setParam = params.set;
  const setFilter = setParam === "all" ? undefined : setParam ?? "Vendetta";
  const tournamentFilter = params.tournament;
  const sortParam = params.sort;
  const search = (params.q ?? "").trim();
  const isCommunity = cat === "community";

  if (isCommunity) {
    const domainFilter = params.domain;
    const tagFilter = params.tag;
    const comWhere: Record<string, unknown> = { isPublic: true };
    if (legendFilter) comWhere.legendName = { contains: legendFilter, mode: "insensitive" };
    if (domainFilter) comWhere.domains = { has: domainFilter };
    if (tagFilter) comWhere.tags = { has: tagFilter };
    if (search) comWhere.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { legendName: { contains: search, mode: "insensitive" } },
      { authorName: { contains: search, mode: "insensitive" } },
    ];

    const comOrderBy = sortParam === "popular" ? { likes: "desc" as const }
      : sortParam === "views" ? { views: "desc" as const }
      : { createdAt: "desc" as const };

    const communityDecks = await prisma.communityDeck.findMany({
      where: comWhere,
      orderBy: comOrderBy,
      take: 60,
    });

    const comLegends = await prisma.communityDeck.findMany({
      where: { isPublic: true },
      select: { legendName: true },
      distinct: ["legendName"],
      orderBy: { legendName: "asc" },
    });

    // Couverture collection sur les bannières des decks communautaires (comme les
    // decks officiels). On décode chaque deckCode → cartes → comparaison à la collection.
    const comSessionUser = await getUserFromSession();
    const comCoverage = new Map<string, { owned: number; required: number; missing: number }>();
    if (comSessionUser && communityDecks.length) {
      const owned = await getOwnedByName(comSessionUser.id);
      const decodedByDeck = new Map<string, { ident: string; qty: number }[]>();
      const allIdents = new Set<string>();
      for (const d of communityDecks) {
        const dec = decodeDeck(d.deckCode);
        if (!dec) continue;
        // deckCoverageItems inclut la réserve, qui manquait ici : le même deck
        // annonçait moins de cartes manquantes que sur sa propre page.
        const entries = deckCoverageItems(dec);
        decodedByDeck.set(d.id, entries.map((e) => ({ ident: e.cardId, qty: e.quantity })));
        for (const e of entries) allIdents.add(e.cardId);
      }
      if (allIdents.size) {
        const idents = [...allIdents];
        const cards = await prisma.card.findMany({
          where: { OR: [{ riftboundId: { in: idents } }, { name: { in: idents, mode: "insensitive" } }] },
          select: { id: true, name: true, cleanName: true, riftboundId: true },
        });
        const byIdent = new Map<string, { id: string; name: string; cleanName: string | null }>();
        for (const c of cards) { byIdent.set(c.riftboundId, c); byIdent.set(c.name, c); byIdent.set(c.name.toLowerCase(), c); }
        for (const d of communityDecks) {
          const list = decodedByDeck.get(d.id);
          if (!list?.length) continue;
          const deckCards: DeckCardLike[] = [];
          for (const e of list) {
            const c = byIdent.get(e.ident) ?? byIdent.get(e.ident.toLowerCase());
            if (c) deckCards.push({ cardId: c.id, name: c.name, cleanName: c.cleanName, section: "main", quantity: e.qty });
          }
          if (deckCards.length) {
            const t = computeDeckCoverage(owned, deckCards).totals;
            comCoverage.set(d.id, { owned: t.owned, required: t.required, missing: t.missing });
          }
        }
      }
    }

    const DOMAIN_OPTIONS = ["Fury", "Calm", "Mind", "Body", "Chaos", "Order"];
    const TAG_OPTIONS = ["aggro", "contrôle", "combo", "midrange", "tempo", "budget", "compétitif"];

    function comLink(overrides: Record<string, string | null>) {
      return hrefDecks({ cat: "community", ...overrides });
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-arcane">{t("Decklists Riftbound")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Trouvez un deck à jouer")}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary sm:text-base">{t("Parcourez les listes de tournoi et les decks partagés par la communauté.")}</p>
        </div>
      {/* Texte d'entrée : /decks n'avait que des filtres, Google renvoyait l'accueil
          sur « riftbound deck » (86 impressions, 1 clic, GSC juillet 2026). */}
      <details className="group mt-3 max-w-3xl text-sm text-ink-secondary">
        <summary className="min-h-11 cursor-pointer list-none py-3 text-xs font-semibold text-ink-muted hover:text-ink [&::-webkit-details-marker]:hidden">{t("Comment choisir un deck ?")} <span aria-hidden="true" className="ml-1 inline-block transition-transform group-open:rotate-180">↓</span></summary>
        <p className="pb-2 leading-relaxed">
        {t("On garde ici le meilleur deck de chaque Légende par tournoi, les decks avec guide et ceux de la communauté.")} {t("Pour toutes les listes d’un tournoi, allez sur sa page dans les")} {" "}
        <Link href="/tournois" className="text-arcane hover:underline">{t("tournois")}</Link>.
        {" "}{t("Pour savoir quoi jouer, commencez par la")} {" "}
        <Link href="/tier-list" className="text-arcane hover:underline">{t("tier list Riftbound")}</Link>{" "}
        {t("puis choisissez votre")}{" "}
        <Link href="/legendes" className="text-arcane hover:underline">{t("Légende")}</Link>. {t("Vous pouvez aussi partir d’une liste et la modifier dans le")} {" "}
        <Link href="/deckbuilder" className="text-arcane hover:underline">{t("deckbuilder")}</Link>.
        </p>
      </details>

        <form method="get" action="/decks" className="mt-5 flex max-w-2xl gap-2 rounded-xl border border-hairline bg-surface p-1.5 focus-within:border-arcane/70">
          {Object.entries(params).map(([nom, valeur]) => nom !== "q" && nom !== "offset" && valeur ? <input key={nom} type="hidden" name={nom} value={valeur} /> : null)}
          <input type="search" name="q" defaultValue={search} placeholder={t("Chercher un deck, une Légende ou un auteur")} aria-label={t("Chercher un deck, une Légende ou un auteur")} className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink-muted" />
          <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-arcane px-4 text-sm font-semibold text-canvas transition-[opacity,scale] hover:opacity-90 active:scale-[0.96]"><Search size={16} aria-hidden="true" /> <span className="hidden sm:inline">{t("Chercher")}</span></button>
        </form>
        {search && <p className="mt-2 text-sm text-ink-secondary">{t("Résultats pour")} <strong>{search}</strong>. <Link href={hrefDecks({ q: null })} className="text-arcane hover:underline">{t("Effacer la recherche")}</Link></p>}

        <nav aria-label={t("Catégories de decks")} className="mt-6 grid grid-cols-1 gap-1 rounded-xl border border-hairline bg-surface p-1.5 sm:flex sm:flex-wrap">
          <Link href={hrefDecks({ cat: null, domain: null, tag: null })} className={cn("inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors", !cat ? "bg-arcane text-canvas" : "text-ink-secondary hover:bg-surface-raised hover:text-ink")}>{t("Compétitifs")}</Link>
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isActive = !c.isLink && cat === c.key;
            return (
              <Link key={c.key} href={hrefDecks({ cat: c.key, domain: c.key === "community" ? domainFilter ?? null : null, tag: c.key === "community" ? tagFilter ?? null : null, set: c.key === "community" ? null : setParam ?? null, tournament: c.key === "community" ? null : tournamentFilter ?? null })} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors", isActive ? "bg-arcane text-canvas" : "text-ink-secondary hover:bg-surface-raised hover:text-ink")}>
                <Icon size={15} /> {t(c.label)}
              </Link>
            );
          })}
          <Link href="/deckbuilder" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-violet-light transition-colors hover:bg-surface-raised hover:text-white sm:ml-auto"><Hammer size={15} /> {t("Créer un deck")}</Link>
        </nav>

        <div className="mt-4 rounded-xl border border-hairline bg-surface p-3">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted"><SlidersHorizontal size={14} /> {t("Affiner les résultats")}</div>
        {/* Domain filters */}
        <div className="flex flex-wrap gap-1.5">
          <Link href={comLink({ domain: null })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", !domainFilter ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink")}>{t("Tous domaines")}</Link>
          {DOMAIN_OPTIONS.map((d) => (
            <Link key={d} href={comLink({ domain: domainFilter === d ? null : d })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", domainFilter === d ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              {d}
            </Link>
          ))}
        </div>

        {/* Tag filters */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Link href={comLink({ tag: null })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", !tagFilter ? "bg-violet-dark text-white" : "bg-surface-raised text-ink-muted hover:text-ink")}>{t("Tous styles")}</Link>
          {TAG_OPTIONS.map((tag) => (
            <Link key={tag} href={comLink({ tag: tagFilter === tag ? null : tag })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-colors capitalize", tagFilter === tag ? "bg-violet-dark text-white" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              {t(tag)}
            </Link>
          ))}
        </div>

        {/* Legend filter + sort */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Suspense>
            <DeckLegendFilter legends={comLegends.map((l) => l.legendName)} />
          </Suspense>
          <div className="flex w-full flex-wrap items-center gap-1.5 sm:ml-auto sm:w-auto">
            <span className="text-xs text-ink-muted">{t("Tri")} :</span>
            <Link href={comLink({ sort: null })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", !sortParam ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink")}>{t("Récent")}</Link>
            <Link href={comLink({ sort: "popular" })} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", sortParam === "popular" ? "bg-red-500 text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              <Heart size={10} /> {t("Populaire")}
            </Link>
            <Link href={comLink({ sort: "views" })} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", sortParam === "views" ? "bg-blue-500 text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              <Eye size={10} /> {t("Vues")}
            </Link>
          </div>
        </div>
        </div>

        <div className="mt-4 text-sm text-ink-muted">
          {communityDecks.length} {t(communityDecks.length === 1 ? "deck communautaire" : "decks communautaires")}
          {legendFilter && <span>{" "}{t("pour")}{" "}<strong className="text-arcane">{legendFilter}</strong></span>}
          {domainFilter && <span> &middot; <strong>{domainFilter}</strong></span>}
          {tagFilter && <span> &middot; <strong className="capitalize">{t(tagFilter)}</strong></span>}
        </div>

        {communityDecks.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-ink-muted">{t("Aucun deck communautaire pour ces filtres.")}</p>
            <Link href="/deckbuilder" className="mt-4 inline-flex items-center gap-2 text-sm text-violet-light hover:underline">
              <Hammer size={14} />{" "}{t("Soyez le premier à partager un deck !")}</Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {communityDecks.map((deck) => {
              const bannerUrl = getBannerUrl(deck.legendName);
              return (
                <Link key={deck.id} href={`/d/${deck.shareCode}`} className="card-hover rounded-card border border-hairline overflow-hidden group relative flex flex-col">
                  <div className="relative flex h-44 flex-col justify-end">
                    {bannerUrl ? (
                      <Image src={bannerUrl} alt={deck.legendName} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} />
                    ) : (
                      <div className="absolute inset-0 bg-surface-raised" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />
                    {(() => {
                      const cov = comCoverage.get(deck.id);
                      if (!cov) return null;
                      const ok = cov.missing === 0;
                      return (
                        <span
                          className={cn(
                            "absolute right-2 top-2 z-20 rounded-full px-2 py-0.5 text-[11px] font-bold shadow",
                            ok ? "bg-emerald-500/90 text-white" : "bg-canvas/85 text-amber-300 ring-1 ring-amber-400/40",
                          )}
                          title={ok ? t("Jouable avec votre collection") : `${t("Il vous manque")} ${cov.missing} ${t(cov.missing > 1 ? "cartes" : "carte")}`}
                        >
                          {ok ? `✓ ${t("Complet")}` : `${cov.owned}/${cov.required}`}
                        </span>
                      );
                    })()}
                    <div className="relative z-10 p-4">
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <div className="line-clamp-2 text-xl font-bold leading-tight text-ink drop-shadow-md" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                            {deck.title}
                          </div>
                          <div
                            className="texte-sur-art mt-0.5 flex flex-wrap items-center gap-2 text-xs"
                          >
                            <span className="text-arcane-light">{displayLegendName(deck.legendName)}</span>
                            <span className="text-white/80">{t("par")} {deck.authorName}</span>
                          </div>
                          {deck.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {deck.tags.map((t) => (
                                <span key={t} className="rounded-full bg-violet-dark px-1.5 py-0.5 text-[9px] font-semibold text-white capitalize">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 text-[10px] text-white drop-shadow-md">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-0.5"><Heart size={10} /> {deck.likes}</span>
                            <span className="flex items-center gap-0.5"><Eye size={10} /> {deck.views}</span>
                          </div>
                          <span className="text-white/75">{formatDate(deck.createdAt, locale)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Boutons « best of par tournoi » : lus dans les decks marqués best-of, libellé et
  // date pris dans le registre des tournois. Un nouveau best-of apparaît donc tout
  // seul, plus de liste à tenir à la main.
  const featuredTournaments = await prisma.deck.groupBy({
    by: ["tournamentContext"],
    where: { published: true, featured: true, tournamentContext: { not: null } },
  });
  const TOURNAMENT_FILTERS = featuredTournaments
    .map((t) => {
      const ctx = t.tournamentContext!;
      const info = getTournamentInfo(ctx);
      return { ctx, label: info?.shortName ?? ctx, date: info?.date ?? "", set: info?.set, countryCode: getTournamentCountryCode(ctx) };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const filtres = lireFiltresDecks(params);
  const [lotInitial, legends, sessionUser] = await Promise.all([
    listerDecks(filtres),
    prisma.deck.findMany({
      // Même filtre que la liste, sinon le menu propose des Légendes qui n'ont
      // que des decks écartés par l'onglet en cours et renvoient "Aucun deck".
      // `legend: undefined` : sans ça le menu se réduirait au choix déjà fait.
      where: construireWhere({ ...filtres, legend: undefined }),
      select: { legendName: true },
      distinct: ["legendName"],
      orderBy: { legendName: "asc" },
    }),
    getUserFromSession(),
  ]);

  const ownedOnly = filtres.owned;
  const decks = lotInitial.decks;
  const coverageByDeck = new Map(decks.map((deck) => [deck.id, deck.coverage]));
  const legendNames = legends.map((l) => l.legendName);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-arcane">{t("Decklists Riftbound")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Trouvez un deck à jouer")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary sm:text-base">{t("Parcourez les listes qui gagnent en tournoi, puis filtrez par Légende, set ou événement.")}</p>
      </div>
      {/* Texte d'entrée : /decks n'avait que des filtres, Google renvoyait l'accueil
          sur « riftbound deck » (86 impressions, 1 clic, GSC juillet 2026). */}
      <details className="group mt-3 max-w-3xl text-sm text-ink-secondary">
        <summary className="min-h-11 cursor-pointer list-none py-3 text-xs font-semibold text-ink-muted hover:text-ink [&::-webkit-details-marker]:hidden">{t("Comment choisir un deck ?")} <span aria-hidden="true" className="ml-1 inline-block transition-transform group-open:rotate-180">↓</span></summary>
        <p className="pb-2 leading-relaxed">
        {t("On garde ici le meilleur deck de chaque Légende par tournoi, les decks avec guide et ceux de la communauté.")} {t("Pour toutes les listes d’un tournoi, allez sur sa page dans les")} {" "}
        <Link href="/tournois" className="text-arcane hover:underline">{t("tournois")}</Link>.
        {" "}{t("Pour savoir quoi jouer, commencez par la")} {" "}
        <Link href="/tier-list" className="text-arcane hover:underline">{t("tier list Riftbound")}</Link>{" "}
        {t("puis choisissez votre")}{" "}
        <Link href="/legendes" className="text-arcane hover:underline">{t("Légende")}</Link>. {t("Vous pouvez aussi partir d’une liste et la modifier dans le")} {" "}
        <Link href="/deckbuilder" className="text-arcane hover:underline">{t("deckbuilder")}</Link>.
        </p>
      </details>

      {/* Recherche : formulaire GET, les filtres en cours partent en champs cachés
          pour ne pas être perdus à la soumission. */}
      <form method="get" action="/decks" className="mt-5 flex max-w-2xl gap-2 rounded-xl border border-hairline bg-surface p-1.5 focus-within:border-arcane/70">
        {Object.entries(params).map(([nom, valeur]) => nom !== "q" && nom !== "offset" && valeur ? <input key={nom} type="hidden" name={nom} value={valeur} /> : null)}
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder={t("Chercher un deck, une Légende, un joueur ou une carte")}
          aria-label={t("Chercher un deck, une Légende, un joueur ou une carte")}
          className="min-h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink-muted"
        />
        <button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-arcane px-4 text-sm font-semibold text-canvas transition-[opacity,scale] hover:opacity-90 active:scale-[0.96]">
          <Search size={16} aria-hidden="true" /> <span className="hidden sm:inline">{t("Chercher")}</span>
        </button>
      </form>
      {search && (
        <p className="mt-2 text-sm text-ink-secondary">{t("Résultats pour")}{" "}<strong>{search}</strong>.{" "}
          <Link href={hrefDecks({ q: null })} className="text-arcane hover:underline">{t("Effacer la recherche")}</Link>
        </p>
      )}

      <nav aria-label={t("Catégories de decks")} className="mt-6 grid grid-cols-1 gap-1 rounded-xl border border-hairline bg-surface p-1.5 sm:flex sm:flex-wrap">
        <Link
          href={hrefDecks({ cat: null, domain: null, tag: null })}
          className={cn(
            "inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors",
            !cat ? "bg-arcane text-canvas" : "text-ink-secondary hover:bg-surface-raised hover:text-ink",
          )}
        >{t("Tous")}</Link>
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = !c.isLink && cat === c.key;
          return (
            <Link
              key={c.key}
              href={hrefDecks({ cat: c.key, domain: null, tag: null, set: c.key === "community" ? null : setParam ?? null, tournament: c.key === "community" ? null : tournamentFilter ?? null })}
              className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors",
                isActive ? "bg-arcane text-canvas" : "text-ink-secondary hover:bg-surface-raised hover:text-ink",
              )}
            >
              <Icon size={15} /> {t(c.label)}
            </Link>
          );
        })}
        <Link href="/deckbuilder" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-violet-light transition-colors hover:bg-surface-raised hover:text-white sm:ml-auto"><Hammer size={15} /> {t("Créer un deck")}</Link>
      </nav>

      {/* Filtre collection : n'apparaît qu'une fois connecté (sinon aucune
          couverture à calculer). Garde tous les autres filtres dans l'URL. */}
      {sessionUser && (
        <div className="mt-3">
          <Link
            href={hrefDecks({ owned: ownedOnly ? null : "1" })}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              ownedOnly ? "bg-emerald-500 text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink",
            )}
          >
            <Hammer size={12} /> {t(ownedOnly ? "Voir tous les decks" : "Decks que je peux jouer avec mes cartes")}
          </Link>
        </div>
      )}

      {/* Une seule ligne de filtres. Avant, trois rangées de pastilles construisaient
          leur lien à la main : changer de set effaçait le tournoi en cours, et
          l'ensemble tenait en moins de hauteur qu'une carte de deck. */}
      <div className="mt-4 rounded-xl border border-hairline bg-surface p-3">
        <div className="mb-3 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          <span className="flex items-center gap-2"><SlidersHorizontal size={14} /> {t("Affiner les résultats")}</span>
          <Link href="/decks?set=all" className="inline-flex min-h-11 items-center text-arcane hover:underline sm:min-h-6">{t("Effacer les filtres")}</Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <Suspense>
          <DeckLegendFilter legends={legendNames} />
        </Suspense>
        <Suspense>
          <DeckFiltreSelect
            nom="set"
            libelle={t("Filtrer par set")}
            toutes={t("Tous les sets")}
            valeurParDefaut="Vendetta"
            options={(["Vendetta", "Unleashed", "Spiritforged", "Origins"] as const).map((s) => ({ valeur: s, libelle: s }))}
          />
        </Suspense>
        <Suspense>
          <DeckTournamentFilter options={TOURNAMENT_FILTERS.map((tf) => ({ valeur: tf.ctx, libelle: tf.label, pays: tf.countryCode }))} />
        </Suspense>
        <div className="flex w-full flex-wrap items-center gap-1.5 sm:ml-auto sm:w-auto">
          <span className="text-xs text-ink-muted">{t("Tri")}</span>
          <Link
            href={hrefDecks({ sort: null })}
            className={cn("inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors",
              !sortParam || sortParam === "placement" ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink"
            )}
          ><Trophy size={12} aria-hidden="true" /> {t("Placement")}</Link>
          <Link
            href={hrefDecks({ sort: "recent" })}
            className={cn("inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors",
              sortParam === "recent" ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink"
            )}
          >{t("Récents")}</Link>
          <Link
            href={hrefDecks({ sort: "popular" })}
            className={cn("inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors",
              sortParam === "popular" ? "bg-red-500 text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink"
            )}
          >
            <Heart size={12} aria-hidden="true" /> {t("Populaire")}
          </Link>
        </div>
        </div>
      </div>


      <div className="mt-4 text-sm text-ink-muted">
        {lotInitial.total} deck{lotInitial.total !== 1 ? "s" : ""}
        {legendFilter && <span>{" "}{t("pour")}{" "}<strong className="text-arcane">{legendFilter}</strong></span>}
        {cat && <span> &middot; {cat === "bestof" ? t("Best of") : cat === "all" ? t("Toutes les listes") : cat}</span>}
        {setFilter && <span> &middot; <strong>{setFilter}</strong></span>}
        {tournamentFilter && <span> &middot; <strong>{TOURNAMENT_FILTERS.find((t) => t.ctx === tournamentFilter)?.label ?? tournamentFilter}</strong></span>}
      </div>

      {lotInitial.total === 0 ? (
        <p className="mt-12 text-center text-ink-muted">{t("Aucun deck ne correspond à ces filtres. Essayez d’en retirer un.")}</p>
      ) : (
        <>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => {
            const bannerUrl = getBannerUrl(deck.legendName);
            return (
              <article key={deck.id} className="card-hover rounded-card border border-hairline overflow-hidden group relative">
                <Link href={`/decks/${deck.slug}`} className="absolute inset-0 z-10" aria-label={`${t("Voir le deck")} ${displayLegendName(deck.legendName)}`} />
                <div className="relative flex h-44 flex-col justify-end">
                  {bannerUrl ? (
                    <Image src={bannerUrl} alt={deck.legendName} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} />
                  ) : (
                    <div className="absolute inset-0 bg-surface-raised" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />
                  {(() => {
                    const cov = coverageByDeck.get(deck.id);
                    if (!cov) return null;
                    const ok = cov.missing === 0;
                    return (
                      <span
                        className={cn(
                          "absolute right-2 top-2 z-20 rounded-full px-2 py-0.5 text-[11px] font-bold shadow",
                          ok ? "bg-emerald-500/90 text-white" : "bg-canvas/85 text-amber-300 ring-1 ring-amber-400/40",
                        )}
                        title={ok ? t("Jouable avec votre collection") : `${t("Il vous manque")} ${cov.missing} ${t(cov.missing > 1 ? "cartes" : "carte")}`}
                      >
                        {ok ? `✓ ${t("Complet")}` : `${cov.owned}/${cov.required}`}
                      </span>
                    );
                  })()}
                  <div className="relative p-4">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-xl font-bold leading-tight text-ink drop-shadow-md" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                          {displayLegendName(deck.legendName)}
                        </div>
                        {/* Halo sombre porté par le TEXTE, pas par un voile sur
                            l'image : les dégradés des bannières ont été allégés
                            exprès. Sans lui, « RQ Utrecht 2026 » en or disparaît
                            sur les arts dorés (Sett, Azir). */}
                        <div
                          className="texte-sur-art mt-1 space-y-0.5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {deck.tournamentTier && (
                              <span
                                // Classe littérale et pas `var(--color-tier-*)` en style
                                // inline : avec `@theme inline`, Tailwind n'émet pas ces
                                // variables, le fond du badge était donc transparent.
                                // Les tokens sont réglés pour servir de texte sur fond
                                // sombre, donc en remplissage le libellé passe en encre.
                                className={cn(
                                  "inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[11px] font-black uppercase leading-none tracking-wide text-canvas shadow-sm ring-1 ring-black/20",
                                  TIER_BG[deck.tournamentTier] ?? "bg-ink-muted",
                                )}
                                // Pas de halo ici : la pastille a un fond plein.
                                // Hérité du conteneur, il bavait autour du texte
                                // sombre posé sur l'or.
                                style={{ textShadow: "none" }}
                                title={`Tier ${deck.tournamentTier}`}
                              >
                                Tier {deck.tournamentTier}
                              </span>
                            )}
                            {deck.tournamentContext && (() => {
                              const cc = getTournamentCountryCode(deck.tournamentContext);
                              return (
                                // Blanc et pas or : l'or sur une armure dorée
                                // (Azir, Sett) ne se lit pas. Le sens « tournoi »
                                // reste porté par le drapeau et la pastille Best of.
                                <span className="flex min-w-0 items-center gap-1 text-white/90">
                                  {cc && <CountryBadge code={cc} />}
                                  <span className="truncate">{deck.tournamentContext}</span>
                                </span>
                              );
                            })()}
                          </div>
                          {(deck.placement || deck.playerName || deck.authorName) && (
                            <div className="flex items-center gap-2">
                              {deck.placement && <span className="shrink-0 font-semibold text-ink">{deck.placement}</span>}
                              {(deck.playerName || deck.authorName) && <span className="truncate text-white/90">{t("par")} {deck.playerName || deck.authorName}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative z-20 flex shrink-0 items-center gap-1">
                        <DeckLikeButton slug={deck.slug} initialLikes={deck.likes} compact />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">{deck.setTag}</span>
                        {deck.featured && (
                          <span className="rounded-full bg-gold/80 px-2 py-0.5 text-[10px] font-bold text-canvas">
                            Best of
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <DecksProgressifs initial={{ ...lotInitial, decks: [] }} filtres={filtres} />
        </>
      )}
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
