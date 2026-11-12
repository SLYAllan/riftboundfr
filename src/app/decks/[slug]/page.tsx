export const revalidate = 300;

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify, displayLegendName } from "@/lib/utils";
import { afficherPlacement } from "@/lib/deck-listing-params";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { encodeDeckBase64 } from "@/lib/deck-codec";
import { legendHref as legendPageHref } from "@/lib/legend-fiche";
import Link from "@/components/lien";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getTournamentCountryCode, getTournamentInfo } from "@/lib/tournament-flags";
import { getBannerUrl } from "@/lib/banners";
import { energieMoyenne } from "@/lib/deck-chiffres";
import { DeckStatsPanel } from "@/components/deck-stats-panel";
import { CountryBadge } from "@/components/country-badge";
import { DeckLikeButton } from "@/components/deck-like-button";
import { ShareDecklistButton } from "@/components/share-decklist-button";
import { DeckCoveragePanel } from "@/components/collection/deck-coverage-panel";
import { cartesDeck, chiffrerDeck, lienAchatDeck } from "@/lib/cardnexus";
import { interdictionsParDate } from "@/lib/bans";
import type { Metadata } from "next";
import type { DecklistCard, DeckSection } from "@/types";
import { tr, metaTraduite, langueCourante } from "@/lib/i18n-server";
import { etiquetteLocale } from "@/lib/i18n";

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

// Descriptions écrites par les scripts d'import : « 9th au Showdown (date) par X. Calm/Fury. »
// ou « Meilleur classement … : 65th par X. » Elles répètent la ligne au-dessus du titre ;
// une description écrite à la main, elle, reste.
const DESCRIPTION_GENEREE = /^(\d+(st|nd|rd|th|e|er) au |Meilleur classement )/;
import { jsonLdHtml, urlLangue, langueSchema } from "@/lib/json-ld";
import { cache, type ReactNode } from "react";
import Image from "next/image";
import { BoutonLien } from "@/components/bouton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Une seule requête pour la page ET ses métadonnées : Next appelle
// generateMetadata puis le composant, et la même ligne partait deux fois en
// base à chaque visite. `cache` de React les réunit le temps d'une requête.
const chargerDeck = cache((slug: string) =>
  prisma.deck.findUnique({
    where: { slug },
    include: {
      cards: { include: { card: true }, orderBy: [{ section: "asc" }, { card: { name: "asc" } }] },
      sourceArticle: { select: { slug: true, title: true } },
    },
  }),
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const deck = await chargerDeck(slug);
  if (!deck) return { title: "Deck introuvable" };
  const legend = displayLegendName(deck.legendName);
  const title = `Deck ${deck.title}`;
  const rawDesc =
    deck.description ||
    `Decklist ${legend}${deck.playerName ? ` par ${deck.playerName}` : ""}${deck.tournamentContext ? ` - ${deck.tournamentContext}` : ""}. Guide complet : gameplan, mulligan et matchups.`;
  const description = rawDesc.length > 155 ? `${rawDesc.slice(0, 152).trimEnd()}…` : rawDesc;
  const image = `/api/decklist-image?slug=${slug}`;
  return metaTraduite({
    title,
    description,
    alternates: { canonical: `/decks/${slug}` },
    openGraph: { type: "article", siteName: "Riftbound France", locale: "fr_FR", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  });
}

export default async function DeckDetailPage({ params }: PageProps) {
  const t = await tr();
  const langue = await langueCourante();
  const { slug } = await params;
  const deck = await chargerDeck(slug);
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

  // Decks liés (même Légende) : retient les visiteurs organiques qui repartent après la liste.
  const relatedDecks = await prisma.deck.findMany({
    where: { published: true, legendName: deck.legendName, NOT: { id: deck.id } },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, slug: true, title: true, playerName: true, placement: true, tournamentContext: true },
  });

  // Lien vers la page de la Légende : c'est le chemin interne des pages deck vers
  // /legendes, qui vise les requêtes "deck <légende>". Toujours valide, puisque ce deck
  // est publié et que toute Légende avec un deck publié a une page.
  const legendHref = legendPageHref(deck.legendName);
  const legendCard = deck.cards.find((dc) => dc.section === "legend");
  // Champion = carte supertype "Champion" qui n'est PAS la Légende (certaines Légendes,
  // ex. Annie, ont elles aussi supertype "Champion" → on distingue par type).
  const championCard = deck.cards.find((dc) => dc.section === "legend" && dc.card.supertype === "Champion" && dc.card.type !== "Legend");
  const actualLegend = deck.cards.find((dc) => dc.section === "legend" && dc.card.type === "Legend") ?? legendCard;
  const deckbuilderCode = encodeDeckBase64({
    legend: actualLegend ? { cardId: actualLegend.card.riftboundId, quantity: 1 } : null,
    champion: championCard ? { cardId: championCard.card.riftboundId, quantity: championCard.quantity } : null,
    main: deck.cards.filter((dc) => dc.section === "main").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
    rune: deck.cards.filter((dc) => dc.section === "rune").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
    battlefield: deck.cards.filter((dc) => dc.section === "battlefield").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
    side: deck.cards.filter((dc) => dc.section === "side").map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity })),
  });

  // Chaque carte porte déjà son étiquette « Banni » dans la liste, plus bas. Sans
  // l'encadré, on lisait le titre, le joueur et le rang d'une liste gagnante, et
  // on partait la monter sans voir qu'elle ne se jouait plus.
  const interdictions = interdictionsParDate(deck.cards.map((dc) => dc.card.name));

  // JSON-LD d'entité (M14) : deck = CreativeWork citable.
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";
  const deckJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: deck.title,
    url: urlLangue(SITE, `/decks/${slug}`, langue),
    about: `Deck Riftbound ${displayLegendName(deck.legendName)} (${deck.format})`,
    inLanguage: langueSchema(langue),
    isPartOf: { "@type": "WebSite", name: "Riftbound France", url: urlLangue(SITE, "/", langue) },
  };

  // Les mêmes cartes pour le prix affiché et pour le lien du panier, en haut comme
  // dans le panneau du bas.
  const cartesAchat = cartesDeck(deck.cards);
  const prix = chiffrerDeck(cartesAchat);
  const lienAchat = lienAchatDeck(cartesAchat);

  // Une seule ligne sous le titre, séparée par des points : la Légende, le joueur, la
  // place et le tournoi tenaient sur deux lignes, puis revenaient dans la description.
  const pastilleSet = (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      setTag === "Unleashed" ? "bg-arcane text-canvas"
        : setTag === "Spiritforged" ? "bg-emerald-500 text-canvas"
        : setTag === "Origins" ? "bg-amber-500 text-canvas"
        : "bg-surface-raised text-ink-secondary"
    }`}>
      {setTag}
    </span>
  );
  const cc = deck.tournamentContext ? getTournamentCountryCode(deck.tournamentContext) : null;
  const morceaux: Array<[string, ReactNode]> = [
    ["legende", (
      <span>
        {legendHref ? (
          <Link href={legendHref} className="py-1 text-base font-semibold text-arcane hover:underline">
            {displayLegendName(deck.legendName)}
          </Link>
        ) : (
          <span className="text-base font-semibold text-arcane">{displayLegendName(deck.legendName)}</span>
        )}
        {" "}{pastilleSet}
      </span>
    )],
  ];
  if (deck.playerName || deck.authorName) morceaux.push(["joueur", <span>{t("par")}{" "}<strong className="text-ink-secondary">{deck.playerName || deck.authorName}</strong></span>]);
  if (deck.placement) morceaux.push(["place", <span>{afficherPlacement(deck.placement, langue)}{deck.record && <span className="ml-1 text-arcane">({deck.record})</span>}</span>]);
  if (deck.tournamentContext) morceaux.push(["tournoi", (
    <Link href={`/tournois/${slugify(deck.tournamentContext)}`} className="py-1 transition-colors hover:text-arcane">
      {cc && <><CountryBadge code={cc} />{" "}</>}{deck.tournamentContext}
    </Link>
  )]);
  // Le niveau d'un tournoi (P, S, A) n'est pas un tier de Légende : pastille cerclée
  // sans couleur, pour ne pas reprendre l'or, le bleu ou le violet des tiers.
  if (deck.tournamentTier) morceaux.push(["tier", (
    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-ink ring-1 ring-hairline-field ring-inset">
      {deck.tournamentTier} Tier
    </span>
  )]);
  if (deck.sourceUrl) morceaux.push(["source", <a href={deck.sourceUrl} target="_blank" rel="noopener noreferrer" className="py-1 text-arcane hover:underline">Source</a>]);

  // L'illustration de la Légende en fond d'en-tête, et quatre chiffres lisibles d'un
  // coup d'œil : ils n'existaient que dans la vue « statistiques » de la liste.
  const banniere = getBannerUrl(deck.legendName);
  const principal = decklistCards.filter((c) => c.section === "main");
  const moyenne = energieMoyenne(principal);
  const joueursTournoi = deck.tournamentContext ? getTournamentInfo(deck.tournamentContext)?.playerCount ?? null : null;
  const locale = etiquetteLocale(langue);
  const chiffres: [string, string][] = [
    ...(deck.placement ? [[afficherPlacement(deck.placement, langue), t("au classement final")] as [string, string]] : []),
    ...(joueursTournoi ? [[joueursTournoi.toLocaleString(locale), t("joueurs au tournoi")] as [string, string]] : []),
    [String(principal.reduce((n, c) => n + c.quantity, 0)), t("cartes au deck principal")],
    ...(moyenne != null ? [[moyenne.toLocaleString(locale, { maximumFractionDigits: 1 }), t("énergie moyenne")] as [string, string]] : []),
  ];
  const achat = lienAchat && prix.total > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(deckJsonLd) }} />
      <Breadcrumbs
        items={[
          { name: "Decks", href: "/decks" },
          { name: deck.title, href: `/decks/${slug}` },
        ]}
      />
      <header className="relative mt-6 overflow-clip rounded-card border border-hairline bg-surface">
        {banniere && (
          <Image
            src={banniere}
            alt=""
            width={700}
            height={300}
            priority
            sizes="(max-width: 1024px) 100vw, 820px"
            className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-45 sm:w-2/3 [mask-image:linear-gradient(to_left,black_25%,transparent)]"
          />
        )}
        <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{deck.title}</h1>
            {/* Texte courant et pas flex : en flex, un morceau trop long partait seul à
                la ligne avec son point devant, isolé. */}
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              {morceaux.map(([cle, contenu], i) => (
                <span key={cle}>
                  {i > 0 && <span aria-hidden="true" className="mx-2">&middot;</span>}
                  {contenu}
                </span>
              ))}
            </p>
            {deck.description && !DESCRIPTION_GENEREE.test(deck.description) && <p className="mt-4 text-ink-secondary">{deck.description}</p>}
            {interdictions.length > 0 && (
              <p className="mt-4 max-w-3xl rounded-lg border border-red-500/30 bg-surface px-4 py-3 text-sm text-ink-secondary">
                <strong className="text-red-400">{t("Liste injouable aujourd’hui.")}</strong>
                {interdictions.map(({ date, cartes }) => (
                  <span key={date}>
                    {" "}{new Intl.ListFormat(etiquetteLocale(langue), { type: "conjunction" }).format(cartes)}{" "}
                    {t(cartes.length > 1 ? "sont interdites depuis le" : "est interdite depuis le")} {t(date)}.
                  </span>
                ))}
                {deck.tournamentContext && <>{" "}{t("La liste reste affichée telle qu’elle a été jouée.")}</>}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <DeckLikeButton slug={deck.slug} initialLikes={deck.likes} />
              <ShareDecklistButton
                slug={deck.slug}
                deckTitle={deck.title}
                legendName={displayLegendName(deck.legendName)}
                playerName={deck.playerName ?? deck.authorName ?? undefined}
                tournamentContext={deck.tournamentContext ?? undefined}
              />
              <Link
                href={`/decks/compare?a=${encodeURIComponent(deckbuilderCode)}`}
                rel="nofollow"
                className="inline-flex min-h-11 items-center rounded-lg border border-hairline bg-surface px-4 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-raised hover:text-ink"
              >
                {t("Comparer ce deck")}
              </Link>
            </div>
          </div>
          {/* Le même prix et le même lien que le panneau du bas, remontés : le lien
              d'achat tombait à 3 ou 4 écrans du haut. Un vrai lien écrit par le
              serveur, jamais un bouton qui attend une réponse (Safari sur iPhone). */}
          {achat && (
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="text-xs text-ink-muted">{t("À partir de")}</div>
                <div className="text-2xl font-bold leading-tight text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{euros.format(prix.total)}</div>
              </div>
              <BoutonLien href={lienAchat} target="_blank" rel="sponsored nofollow noopener" variante="achat" className="w-full sm:w-auto">
                <Image src="/cardnexus/mini-blanc.svg" alt="CardNexus" width={101} height={100} className="h-5 w-5" />
                <span className="whitespace-nowrap">{t("Acheter ce deck")}</span>
              </BoutonLien>
            </div>
          )}
        </div>
        <dl className="relative grid grid-cols-2 border-t border-hairline sm:grid-cols-4">
          {chiffres.map(([valeur, libelle]) => (
            <div key={libelle} className="border-hairline px-5 py-3 sm:border-r sm:last:border-r-0">
              <dd className="text-xl font-bold tabular-nums text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{valeur}</dd>
              <dt className="text-xs text-ink-muted">{libelle}</dt>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          <DecklistInteractive
            cards={decklistCards}
            deckName={deck.title}
            legendName={deck.legendName}
            playerName={deck.playerName ?? deck.authorName ?? undefined}
            context={deck.tournamentContext ?? undefined}
            // La page porte déjà le titre, la Légende, le joueur et le tournoi
            // dans son h1 et sa sous-ligne : l'en-tête complet les répétait mot
            // pour mot juste en dessous.
            compact
            pageDeck
            showCopyCode
            showExportPng
            sourceArticleSlug={deck.sourceArticle?.slug}
            deckbuilderCode={deckbuilderCode}
          />

          <div className="mt-6">
            <DeckCoveragePanel
              prix={prix}
              lienAchat={lienAchat}
              items={decklistCards.map((c) => ({
                cardId: c.cardId,
                quantity: c.quantity,
                section: c.section,
                name: c.name,
              }))}
            />
          </div>
        </div>

        {/* Colonne qui suit la lecture sur ordinateur : l'achat et les graphiques
            restent sous les yeux pendant toute la liste. La cellule s'étire sur la
            hauteur de la liste, sinon le bloc collant n'aurait nulle part où glisser. */}
        <aside aria-label={t("Résumé du deck")}>
          <div className="grid gap-4 lg:sticky lg:top-22">
            {achat && (
              <div className="hidden rounded-card border border-hairline bg-surface p-4 lg:block">
                <div className="text-xs text-ink-muted">{t("À partir de")}</div>
                <div className="text-xl font-bold leading-tight text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{euros.format(prix.total)}</div>
                <BoutonLien href={lienAchat} target="_blank" rel="sponsored nofollow noopener" variante="achat" className="mt-3 w-full">{t("Acheter ce deck")}</BoutonLien>
              </div>
            )}
            <DeckStatsPanel cards={decklistCards} />
          </div>
        </aside>
      </div>

      {deck.guide && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{t("Guide du deck")}</h2>
          <div className="mt-4"><MarkdownRenderer content={deck.guide} /></div>
        </div>
      )}

      {relatedDecks.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              Autres decks {displayLegendName(deck.legendName)}
            </h2>
            <Link href="/decks" className="inline-flex min-h-6 items-center text-sm text-arcane hover:text-arcane-light">{t("Tous les decks")}</Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedDecks.map((rd) => (
              <Link
                key={rd.id}
                href={`/decks/${rd.slug}`}
                // min-w-0 : sans lui, une cellule de grille garde la largeur de son
                // texte le plus long, truncate ne s'applique pas et la page déborde.
                className="min-w-0 rounded-card border border-hairline bg-surface px-4 py-3 transition-colors hover:bg-surface-raised/50"
              >
                <div className="truncate text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{rd.title}</div>
                <div className="mt-1 truncate text-xs text-ink-muted">
                  {[rd.playerName, rd.placement && afficherPlacement(rd.placement, langue), rd.tournamentContext].filter(Boolean).join(" · ")}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Téléphone : le bouton d'achat reste à portée de pouce pendant toute la liste.
          Un vrai lien, comme en haut. */}
      {achat && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-hairline bg-surface-glass px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <div>
            <div className="text-xs text-ink-muted">{t("À partir de")}</div>
            <div className="text-lg font-bold leading-tight text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{euros.format(prix.total)}</div>
          </div>
          <BoutonLien href={lienAchat} target="_blank" rel="sponsored nofollow noopener" variante="achat">{t("Acheter ce deck")}</BoutonLien>
        </div>
      )}
    </div>
  );
}
