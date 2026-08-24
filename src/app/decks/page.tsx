export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "@/components/lien";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Hammer, Users, Trophy, Star, Eye, Heart, ArrowRight } from "lucide-react";
import { cn, formatDate, displayLegendName } from "@/lib/utils";
import { DeckLegendFilter } from "@/components/deck-legend-filter";
import { DeckFiltreSelect } from "@/components/deck-filtre-select";
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
import { metaTraduite, tr } from "@/lib/i18n-server";
import { construireWhere, lireFiltresDecks, listerDecks, listerLegendes } from "@/lib/deck-listing";
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
  { key: "deckbuilder", label: "Créer son deck", href: "/deckbuilder", icon: Hammer, color: "violet" as const, isLink: true },
  { key: "community", label: "Communautaires", href: "/decks?cat=community", icon: Users, color: "arcane" as const, isLink: false },
  { key: "bestof", label: "Best of", href: "/decks?cat=bestof", icon: Star, color: "gold" as const, isLink: false },
  { key: "all", label: "Toutes les listes", href: "/decks?cat=all", icon: Trophy, color: "violet" as const, isLink: false },
  // Pas d'onglet « Avec guide » : aucun deck publié ne porte de guide aujourd'hui,
  // l'onglet ne menait qu'à une page vide.
] as const;

const COLOR_CLASSES = {
  violet: { base: "bg-violet-dark text-white hover:opacity-90", active: "bg-violet-dark text-white ring-2 ring-violet/40 ring-offset-1 ring-offset-canvas" },
  arcane: { base: "bg-arcane text-canvas hover:opacity-90", active: "bg-arcane text-canvas ring-2 ring-arcane/40 ring-offset-1 ring-offset-canvas" },
  gold: { base: "bg-gold text-canvas hover:opacity-90", active: "bg-gold text-canvas ring-2 ring-gold/40 ring-offset-1 ring-offset-canvas" },
};

const SET_STYLES: Record<string, { badge: string; active: string }> = {
  Vendetta: {
    badge: "bg-rose-600 text-canvas",
    active: "bg-rose-500 text-canvas",
  },
  Unleashed: {
    badge: "bg-arcane text-canvas",
    active: "bg-arcane text-canvas",
  },
  Spiritforged: {
    badge: "bg-emerald-600 text-canvas",
    active: "bg-emerald-500 text-canvas",
  },
  Origins: {
    badge: "bg-amber-600 text-canvas",
    active: "bg-amber-500 text-canvas",
  },
};

export default async function DecksPage({ searchParams }: PageProps) {
  const t = await tr();
  const params = await searchParams;
  const cat = params.cat;
  const legendFilter = params.legend;
  const setFilter = params.set;
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
      const base: Record<string, string> = { cat: "community" };
      if (legendFilter) base.legend = legendFilter;
      if (domainFilter) base.domain = domainFilter;
      if (tagFilter) base.tag = tagFilter;
      if (sortParam) base.sort = sortParam;
      for (const [k, v] of Object.entries(overrides)) {
        if (v === null) delete base[k];
        else base[k] = v;
      }
      const qs = Object.entries(base).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
      return `/decks?${qs}`;
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Decks Riftbound - Decklists compétitives")}</h1>
        <p className="mt-2 text-ink-secondary">{t("Decklists des Regional Qualifiers et tournois officiels Riftbound, builds compétitifs et decks communautaires, classés par Légende - avec guides et explications en français.")}</p>
      {/* Texte d'entrée : /decks n'avait que des filtres, Google renvoyait l'accueil
          sur « riftbound deck » (86 impressions, 1 clic, GSC juillet 2026). */}
      <p className="mt-3 max-w-3xl text-sm text-ink-secondary">
        On garde ici le meilleur deck de chaque Légende par tournoi, les decks avec
        guide et ceux de la communauté. Pour toutes les listes d&apos;un tournoi, allez sur
        sa page dans les{" "}
        <Link href="/tournois" className="text-arcane hover:underline">tournois</Link>.
        Pour savoir quoi jouer, commencez par la{" "}
        <Link href="/tier-list" className="text-arcane hover:underline">tier list Riftbound</Link>{" "}
        puis choisissez votre{" "}
        <Link href="/legendes" className="text-arcane hover:underline">{t("Légende")}</Link>. Tu
        peux aussi partir d&apos;une liste et la modifier dans le{" "}
        <Link href="/deckbuilder" className="text-arcane hover:underline">deckbuilder</Link>.
      </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/decks" className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors", !cat ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-secondary hover:text-ink")}>{t("Tous")}</Link>
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isActive = !c.isLink && cat === c.key;
            const colors = COLOR_CLASSES[c.color];
            return (
              <Link key={c.key} href={c.href} className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors", isActive ? colors.active : colors.base)}>
                <Icon size={15} /> {t(c.label)}
              </Link>
            );
          })}
        </div>

        {/* Domain filters */}
        <div className="mt-3 flex flex-wrap gap-1.5">
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
          {TAG_OPTIONS.map((t) => (
            <Link key={t} href={comLink({ tag: tagFilter === t ? null : t })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-colors capitalize", tagFilter === t ? "bg-violet-dark text-white" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              {t}
            </Link>
          ))}
        </div>

        {/* Legend filter + sort */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Suspense>
            <DeckLegendFilter legends={comLegends.map((l) => l.legendName)} />
          </Suspense>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-ink-muted">Tri :</span>
            <Link href={comLink({ sort: null })} className={cn("rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", !sortParam ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink")}>{t("Récent")}</Link>
            <Link href={comLink({ sort: "popular" })} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", sortParam === "popular" ? "bg-red-500 text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              <Heart size={10} /> Populaire
            </Link>
            <Link href={comLink({ sort: "views" })} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", sortParam === "views" ? "bg-blue-500 text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink")}>
              <Eye size={10} /> Vues
            </Link>
          </div>
        </div>

        <div className="mt-4 text-sm text-ink-muted">
          {communityDecks.length} deck{communityDecks.length !== 1 ? "s" : ""} communautaire{communityDecks.length !== 1 ? "s" : ""}
          {legendFilter && <span>{" "}{t("pour")}{" "}<strong className="text-arcane">{legendFilter}</strong></span>}
          {domainFilter && <span> &middot; <strong>{domainFilter}</strong></span>}
          {tagFilter && <span> &middot; <strong className="capitalize">{tagFilter}</strong></span>}
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
                  <div className="relative flex min-h-[7rem] flex-1 flex-col justify-end">
                    {bannerUrl ? (
                      <Image src={bannerUrl} alt={deck.legendName} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} />
                    ) : (
                      <div className="absolute inset-0 bg-surface-raised" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-canvas/70 via-canvas/30 to-transparent" />
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
                          title={ok ? "Jouable avec votre collection" : `Il vous manque ${cov.missing} carte${cov.missing > 1 ? "s" : ""}`}
                        >
                          {ok ? "✓ Complet" : `${cov.owned}/${cov.required}`}
                        </span>
                      );
                    })()}
                    <div className="relative z-10 p-3">
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <div className="line-clamp-2 text-lg font-bold leading-tight text-ink drop-shadow-md" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                            {deck.title}
                          </div>
                          <div
                            className="texte-sur-art mt-0.5 flex flex-wrap items-center gap-2 text-xs"
                          >
                            <span className="text-arcane-light">{displayLegendName(deck.legendName)}</span>
                            <span className="text-white/80">par {deck.authorName}</span>
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
                          <span className="text-white/75">{formatDate(deck.createdAt)}</span>
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
      return { ctx, label: info?.shortName ?? ctx, date: info?.date ?? "", set: info?.set };
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

  // Entrée par Légende : sans Légende choisie et sans recherche, la page montre
  // QUI jouer avant de dérouler 51 bannières presque identiques.
  const vueLegendes = !filtres.legend && !search;
  const lignesLegendes = vueLegendes ? await listerLegendes(filtres) : [];

  const ownedOnly = filtres.owned;
  const decks = lotInitial.decks;
  const coverageByDeck = new Map(decks.map((deck) => [deck.id, deck.coverage]));
  const legendNames = legends.map((l) => l.legendName);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Decks Riftbound - Decklists compétitives")}</h1>
      <p className="mt-2 text-ink-secondary">{t("Decklists des Regional Qualifiers et tournois officiels Riftbound, builds compétitifs et decks communautaires, classés par Légende - avec guides et explications en français.")}</p>
      {/* Texte d'entrée : /decks n'avait que des filtres, Google renvoyait l'accueil
          sur « riftbound deck » (86 impressions, 1 clic, GSC juillet 2026). */}
      <p className="mt-3 max-w-3xl text-sm text-ink-secondary">
        On garde ici le meilleur deck de chaque Légende par tournoi, les decks avec
        guide et ceux de la communauté. Pour toutes les listes d&apos;un tournoi, allez sur
        sa page dans les{" "}
        <Link href="/tournois" className="text-arcane hover:underline">tournois</Link>.
        Pour savoir quoi jouer, commencez par la{" "}
        <Link href="/tier-list" className="text-arcane hover:underline">tier list Riftbound</Link>{" "}
        puis choisissez votre{" "}
        <Link href="/legendes" className="text-arcane hover:underline">{t("Légende")}</Link>. Tu
        peux aussi partir d&apos;une liste et la modifier dans le{" "}
        <Link href="/deckbuilder" className="text-arcane hover:underline">deckbuilder</Link>.
      </p>

      {/* Recherche : formulaire GET, les filtres en cours partent en champs cachés
          pour ne pas être perdus à la soumission. */}
      <form method="get" action="/decks" className="mt-5 flex max-w-lg gap-2">
        {cat && <input type="hidden" name="cat" value={cat} />}
        {setFilter && <input type="hidden" name="set" value={setFilter} />}
        {tournamentFilter && <input type="hidden" name="tournament" value={tournamentFilter} />}
        {legendFilter && <input type="hidden" name="legend" value={legendFilter} />}
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder={t("Chercher un deck, une Légende, un joueur ou une carte")}
          aria-label={t("Chercher un deck, une Légende, un joueur ou une carte")}
          className="min-w-0 flex-1 rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-arcane"
        />
        <button type="submit" className="rounded-full bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">
          {t("Chercher")}
        </button>
      </form>
      {search && (
        <p className="mt-2 text-sm text-ink-secondary">{t("Résultats pour")}{" "}<strong>{search}</strong>.{" "}
          <Link href="/decks" className="text-arcane hover:underline">{t("Tout afficher")}</Link>
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Link
          href="/decks"
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            !cat && !setFilter ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-secondary hover:text-ink",
          )}
        >{t("Tous")}</Link>
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = !c.isLink && cat === c.key;
          const colors = COLOR_CLASSES[c.color];
          return (
            <Link
              key={c.key}
              href={c.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                isActive ? colors.active : colors.base,
              )}
            >
              <Icon size={15} /> {t(c.label)}
            </Link>
          );
        })}
      </div>

      {/* Filtre collection : n'apparaît qu'une fois connecté (sinon aucune
          couverture à calculer). Garde tous les autres filtres dans l'URL. */}
      {sessionUser && (
        <div className="mt-3">
          <Link
            href={`/decks${(() => { const q = [!ownedOnly && "owned=1", cat && `cat=${cat}`, setFilter && `set=${setFilter}`, tournamentFilter && `tournament=${encodeURIComponent(tournamentFilter)}`, legendFilter && `legend=${encodeURIComponent(legendFilter)}`].filter(Boolean).join("&"); return q ? `?${q}` : ""; })()}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              ownedOnly ? "bg-emerald-500 text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink",
            )}
          >
            <Hammer size={12} /> {ownedOnly ? "Voir tous les decks" : "Decks que je peux jouer avec mes cartes"}
          </Link>
        </div>
      )}

      {/* Une seule ligne de filtres. Avant, trois rangées de pastilles construisaient
          leur lien à la main : changer de set effaçait le tournoi en cours, et
          l'ensemble tenait en moins de hauteur qu'une carte de deck. */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Suspense>
          <DeckLegendFilter legends={legendNames} />
        </Suspense>
        <Suspense>
          <DeckFiltreSelect
            nom="set"
            libelle={t("Filtrer par set")}
            toutes="Tous les sets"
            options={(["Vendetta", "Unleashed", "Spiritforged", "Origins"] as const).map((s) => ({ valeur: s, libelle: s }))}
          />
        </Suspense>
        <Suspense>
          <DeckFiltreSelect
            nom="tournament"
            libelle={t("Filtrer par tournoi")}
            toutes="Tous les tournois"
            options={TOURNAMENT_FILTERS.map((tf) => ({ valeur: tf.ctx, libelle: tf.label }))}
          />
        </Suspense>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-ink-muted">{t("Tri")}</span>
          <Link
            href={`/decks${(() => { const q = [cat && `cat=${cat}`, setFilter && `set=${setFilter}`, tournamentFilter && `tournament=${encodeURIComponent(tournamentFilter)}`, legendFilter && `legend=${encodeURIComponent(legendFilter)}`].filter(Boolean).join("&"); return q ? `?${q}` : ""; })()}`}
            className={cn("inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold transition-colors",
              sortParam !== "popular" ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink"
            )}
          >{t("Récents")}</Link>
          <Link
            href={`/decks?${["sort=popular", cat && `cat=${cat}`, setFilter && `set=${setFilter}`, tournamentFilter && `tournament=${encodeURIComponent(tournamentFilter)}`, legendFilter && `legend=${encodeURIComponent(legendFilter)}`].filter(Boolean).join("&")}`}
            className={cn("inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors",
              sortParam === "popular" ? "bg-red-500 text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink"
            )}
          >
            <Heart size={12} aria-hidden="true" /> {t("Populaire")}
          </Link>
        </div>
      </div>


      <div className="mt-4 text-sm text-ink-muted">
        {lotInitial.total} deck{lotInitial.total !== 1 ? "s" : ""}
        {legendFilter && <span>{" "}{t("pour")}{" "}<strong className="text-arcane">{legendFilter}</strong></span>}
        {cat && <span> &middot; {cat === "bestof" ? t("Best of") : cat === "all" ? t("Toutes les listes") : cat}</span>}
        {setFilter && <span> &middot; <strong>{setFilter}</strong></span>}
        {tournamentFilter && <span> &middot; <strong>{TOURNAMENT_FILTERS.find((t) => t.ctx === tournamentFilter)?.label ?? tournamentFilter}</strong></span>}
      </div>

      {vueLegendes ? (
        lignesLegendes.length === 0 ? (
          <p className="mt-12 text-center text-ink-muted">{t("Aucun deck ne correspond à ces filtres. Essayez d’en retirer un.")}</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lignesLegendes.map((ligne) => {
              const banniere = getBannerUrl(ligne.legendName);
              return (
                <Link
                  key={ligne.legendName}
                  href={`/decks?${new URLSearchParams({ ...(cat ? { cat } : {}), ...(setFilter ? { set: setFilter } : {}), ...(tournamentFilter ? { tournament: tournamentFilter } : {}), legend: ligne.legendName }).toString()}`}
                  className="card-hover group relative flex min-h-[72px] items-center gap-3 overflow-hidden rounded-card border border-hairline bg-surface px-3 py-2"
                >
                  {banniere && (
                    <Image
                      src={banniere}
                      alt=""
                      fill
                      className="object-cover opacity-30 transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={60}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/80 to-canvas/30" />
                  {ligne.tier && (
                    <span
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-canvas",
                        TIER_BG[ligne.tier] ?? "bg-surface-raised",
                      )}
                    >
                      {ligne.tier}
                    </span>
                  )}
                  <span className="relative z-10 min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                      {displayLegendName(ligne.legendName)}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {ligne.decks} {ligne.decks > 1 ? t("listes") : t("liste")}
                      {ligne.titres > 0 && (
                        <> &middot; {ligne.titres} {ligne.titres > 1 ? t("titres") : t("titre")}</>
                      )}
                    </span>
                  </span>
                  <ArrowRight size={16} className="relative z-10 shrink-0 text-ink-muted" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        )
      ) : lotInitial.total === 0 ? (
        <p className="mt-12 text-center text-ink-muted">{t("Aucun deck ne correspond à ces filtres. Essayez d’en retirer un.")}</p>
      ) : (
        <>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => {
            const bannerUrl = getBannerUrl(deck.legendName);
            const style = SET_STYLES[deck.setTag];
            return (
              <article key={deck.id} className="card-hover rounded-card border border-hairline overflow-hidden group relative">
                <Link href={`/decks/${deck.slug}`} className="absolute inset-0 z-10" aria-label={`Voir le deck ${displayLegendName(deck.legendName)}`} />
                <div className="relative flex flex-col justify-end" style={{ height: 128 }}>
                  {bannerUrl ? (
                    <Image src={bannerUrl} alt={deck.legendName} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} />
                  ) : (
                    <div className="absolute inset-0 bg-surface-raised" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-canvas/70 via-canvas/30 to-transparent" />
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
                        title={ok ? "Jouable avec votre collection" : `Il vous manque ${cov.missing} carte${cov.missing > 1 ? "s" : ""}`}
                      >
                        {ok ? "✓ Complet" : `${cov.owned}/${cov.required}`}
                      </span>
                    );
                  })()}
                  <div className="relative p-3">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-lg font-bold leading-tight text-ink drop-shadow-md" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
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
                              {(deck.playerName || deck.authorName) && <span className="truncate text-white/90">par {deck.playerName || deck.authorName}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative z-20 flex shrink-0 items-center gap-1">
                        <DeckLikeButton slug={deck.slug} initialLikes={deck.likes} compact />
                        {style && (
                          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", style.badge)}>
                            {deck.setTag}
                          </span>
                        )}
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
