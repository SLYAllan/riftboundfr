export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { displayLegendName } from "@/lib/utils";
import { decodeDeck, encodeDeckBase64 } from "@/lib/deck-codec";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { DeckStatsPanel } from "@/components/deck-stats-panel";
import { DeckCoveragePanel } from "@/components/collection/deck-coverage-panel";
import { CommentsSection } from "@/components/comments";
import { CommunityDeckGuide } from "./guide-editor";
import { VersionHistory } from "./version-history";
import { UpdateDeckButton } from "./update-deck";
import { LikeButton } from "./like-button";
import { VisibilityToggle } from "./visibility-toggle";
import { ShareDecklistButton } from "@/components/share-decklist-button";
import { getUserFromSession } from "@/lib/session";
import { BoutonSuivre } from "@/components/bouton-suivre";
import { estAbonne } from "@/lib/abonnements";
import Link from "@/components/lien";
import type { Metadata } from "next";
import type { DecklistCard, DeckSection } from "@/types";
import { findCard } from "@/lib/card-printing";
import { resolveDeckCards, deckIdentifiers, deckCoverageItems } from "@/lib/deck-cards";
import { diffDecks, resumerVersion } from "@/lib/deck-diff";
import { chargerPrix, chiffrerDeck, lienAchatDeck } from "@/lib/cardnexus";
import { tr, metaTraduite, langueCourante } from "@/lib/i18n-server";
import { etiquetteLocale } from "@/lib/i18n";
import { energieMoyenne } from "@/lib/deck-chiffres";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AvisInterdictions, BarreAchat, EncartAchat, EnTeteDeck, type MorceauLigne } from "@/components/page-deck";
import { cache } from "react";

interface PageProps {
  params: Promise<{ code: string }>;
}

// Une seule requête pour la page ET ses métadonnées : Next appelle
// generateMetadata puis le composant, et la même ligne partait deux fois en
// base à chaque visite. `cache` de React les réunit le temps d'une requête.
const chargerDeckPartage = cache((code: string) =>
  prisma.communityDeck.findUnique({
    where: { shareCode: code },
    include: { history: { orderBy: { version: "desc" }, take: 10 } },
  }),
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const deck = await chargerDeckPartage(code);
  if (!deck) return { title: "Deck introuvable" };
  const title = `${deck.title} - ${displayLegendName(deck.legendName)}`;
  const description = deck.description || `Deck ${deck.title} par ${deck.authorName}`;
  // L'aperçu de lien demande le format large de la route de l'image de deck : le carré
  // complet pesait 4,4 Mo et mettait 5 à 7 secondes à sortir. Le nom du site et le
  // bloc pour X sont ajoutés par `metaTraduite`.
  const image = `/api/decklist-image?share=${code}&format=apercu`;
  return metaTraduite({
    title,
    description,
    openGraph: {
      title,
      description: deck.description || `${displayLegendName(deck.legendName)}, un deck de ${deck.authorName} à copier en un clic.`,
      type: "article",
      images: [image],
    },
  });
}

export default async function CommunityDeckPage({ params }: PageProps) {
  const t = await tr();
  const locale = etiquetteLocale(await langueCourante());
  const { code } = await params;

  const deck = await chargerDeckPartage(code);
  if (!deck) notFound();

  await prisma.communityDeck.update({
    where: { id: deck.id },
    data: { views: { increment: 1 } },
  });

  const decoded = decodeDeck(deck.deckCode);
  if (!decoded) notFound();

  const { map: cardMap, missing } = await resolveDeckCards(deckIdentifiers(decoded));

  function toListCards(
    entries: { cardId: string; quantity: number }[],
    section: DeckSection,
  ): DecklistCard[] {
    const result: DecklistCard[] = [];
    for (const e of entries) {
      const card = findCard(cardMap, e.cardId);
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

  // Chiffrage : le relevé de prix est indexé par riftboundId, que `decklistCards`
  // ne porte pas (il expose l'id de base pour la collection).
  const cartesChiffrables = deckCoverageItems(decoded).flatMap((i) => {
    const card = findCard(cardMap, i.cardId);
    return card ? [{ riftboundId: card.riftboundId, name: card.name, quantity: i.quantity }] : [];
  });

  // Historique : chaque ligne porte le code d'AVANT la mise à jour, sous son
  // ancien numéro. Le code d'après est donc la ligne plus récente, et le deck
  // courant pour la plus récente de toutes.
  const historique = deck.history.map((h, i) => {
    const avant = decodeDeck(h.deckCode);
    const apres = decodeDeck(i === 0 ? deck.deckCode : deck.history[i - 1].deckCode);
    return { ligne: h, changements: avant && apres ? diffDecks(avant, apres) : [] };
  });
  // Les cartes sorties du deck ne sont plus dans `cardMap` : il faut les
  // résoudre à part. Un identifiant introuvable s'affiche tel quel, jamais
  // escamoté.
  const { map: cartesHistorique } = await resolveDeckCards(
    [...new Set(historique.flatMap((v) => v.changements.map((c) => c.cardId)))],
  );

  // Coût et courbe d'une mise à jour se déduisent du seul diff : inutile de
  // relire chaque version entière. Le prix est celui de l'impression la moins
  // chère, comme partout ailleurs sur le site.
  const releve = chargerPrix();
  const infosCartes = new Map(
    [...cartesHistorique.values()].map((c) => [
      c.id,
      { energie: c.energy ?? null, eur: releve?.cards[c.riftboundId]?.eur ?? null },
    ]),
  );

  const user = await getUserFromSession();
  // Suivre ce deck : la cloche préviendra à chaque nouvelle version publiée par
  // son auteur. Inutile pour l'auteur lui-même, qui vient de la publier.
  const abonnements = user
    ? await prisma.abonnement.findMany({ where: { userId: user.id }, select: { genre: true, cible: true } })
    : [];

  function toRiftboundId(id: string) {
    const c = cardMap.get(id) ?? cardMap.get(id.toLowerCase());
    return c ? c.riftboundId : id;
  }
  const deckbuilderCode = encodeDeckBase64({
    legend: decoded.legend ? { cardId: toRiftboundId(decoded.legend.cardId), quantity: 1 } : null,
    champion: decoded.champion ? { cardId: toRiftboundId(decoded.champion.cardId), quantity: decoded.champion.quantity } : null,
    main: decoded.main.map((e) => ({ cardId: toRiftboundId(e.cardId), quantity: e.quantity })),
    rune: decoded.rune.map((e) => ({ cardId: toRiftboundId(e.cardId), quantity: e.quantity })),
    battlefield: decoded.battlefield.map((e) => ({ cardId: toRiftboundId(e.cardId), quantity: e.quantity })),
    side: decoded.side.map((e) => ({ cardId: toRiftboundId(e.cardId), quantity: e.quantity })),
  });

  const prix = chiffrerDeck(cartesChiffrables);
  const lienAchat = lienAchatDeck(cartesChiffrables);
  const estAuteur = !!user && deck.userId === user.id;

  // Même en-tête que /decks/[slug] : la Légende et l'auteur sur une ligne, puis les
  // chiffres. Pas de lien vers la fiche Légende : une Légende que personne n'a jouée
  // en tournoi n'en a pas, et le lien mènerait à une page introuvable.
  const ligne: MorceauLigne[] = [
    { cle: "legende", contenu: <span className="text-base font-semibold text-arcane">{displayLegendName(deck.legendName)}</span> },
    { cle: "auteur", contenu: <span>{t("par")}{" "}<strong className="text-ink-secondary">{deck.authorName}</strong></span> },
  ];
  // La date vient de la dernière version, pas de `updatedAt` : le compteur de vues
  // réécrit ce champ à chaque visite, et la page disait « mis à jour aujourd'hui ».
  const majLe = deck.history[0]?.createdAt;
  if (deck.version > 1 && majLe) {
    ligne.push({ cle: "version", contenu: <span>Version {deck.version}, mis à jour le {majLe.toLocaleDateString(locale)}</span> });
  }
  const principal = decklistCards.filter((c) => c.section === "main");
  const moyenne = energieMoyenne(principal);
  const chiffres: [string, string][] = [
    [String(principal.reduce((n, c) => n + c.quantity, 0)), t("cartes au deck principal")],
    ...(moyenne != null ? [[moyenne.toLocaleString(locale, { maximumFractionDigits: 1 }), t("énergie moyenne")] as [string, string]] : []),
    [deck.views.toLocaleString(locale), t("vues")],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:pb-8">
      <Breadcrumbs
        items={[
          { name: "Decks", href: "/decks" },
          { name: "Decks communautaires", href: "/decks?cat=community" },
          { name: deck.title, href: `/d/${code}` },
        ]}
      />
      <EnTeteDeck legendName={deck.legendName} titre={deck.title} ligne={ligne} chiffres={chiffres}>
        {deck.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {deck.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-violet-dark px-2.5 py-0.5 text-xs font-semibold text-white">
                {tag}
              </span>
            ))}
          </div>
        )}
        {deck.description && <p className="mt-4 text-ink-secondary">{deck.description}</p>}
        <AvisInterdictions noms={decklistCards.map((c) => c.name)} jouee={false} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <LikeButton shareCode={deck.shareCode} initialLikes={deck.likes} isLoggedIn={!!user} />
          {estAuteur && <VisibilityToggle shareCode={deck.shareCode} initialIsPublic={deck.isPublic} />}
          <ShareDecklistButton
            shareCode={deck.shareCode}
            deckTitle={deck.title}
            legendName={displayLegendName(deck.legendName)}
            playerName={deck.authorName}
          />
          <Link
            href={`/decks/compare?a=${encodeURIComponent(deckbuilderCode)}`}
            rel="nofollow"
            className="inline-flex min-h-11 items-center rounded-lg border border-hairline bg-surface px-4 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-raised hover:text-ink"
          >
            {t("Comparer ce deck")}
          </Link>
          <UpdateDeckButton shareCode={deck.shareCode} ownerId={deck.userId} />
          {deck.userId !== user?.id && (
            <BoutonSuivre
              genre="deck"
              cible={deck.shareCode}
              connecte={!!user}
              suiviInitial={estAbonne(abonnements, "deck", deck.shareCode)}
              libelle="Suivre ce deck"
              libelleSuivi="Deck suivi"
            />
          )}
        </div>
      </EnTeteDeck>

      {/* Une carte que la base ne reconnaît pas était retirée sans rien dire :
          la réserve tombait de 10 à 9 et personne ne voyait pourquoi. */}
      {missing.length > 0 && (
        <p role="status" className="mt-6 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-ink">
          {missing.length === 1
            ? `Une carte de ce deck n'a pas été reconnue et n'est pas affichée : ${missing[0]}.`
            : `${missing.length} cartes de ce deck n'ont pas été reconnues et ne sont pas affichées : ${missing.join(", ")}.`}
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          <DecklistInteractive
            cards={decklistCards}
            deckName={deck.title}
            legendName={deck.legendName}
            playerName={deck.authorName}
            // Même raison que sur /decks/[slug] : le h1 et la sous-ligne au-dessus
            // disent déjà le titre, la Légende et l'auteur.
            compact
            pageDeck
            showCopyCode
            showExportPng
            deckbuilderCode={deckbuilderCode}
          />

          {/* Sous la liste et pas dans la colonne : ouvert, l'historique dépasse la
              hauteur de l'écran, et la colonne collante en aurait caché le bas. */}
          <div className="mt-6">
            <VersionHistory
              currentVersion={deck.version}
              shareCode={deck.shareCode}
              // Le bouton de retour arrière n'existe que pour l'auteur : la route
              // refuse déjà les autres (403), mais montrer un bouton qui échoue
              // n'aide personne.
              estAuteur={estAuteur}
              history={historique.map(({ ligne: h, changements }) => ({
                id: h.id,
                version: h.version,
                changelog: h.changelog,
                createdAt: h.createdAt.toISOString(),
                deckCode: h.deckCode,
                resume: resumerVersion(
                  changements.map((c) => ({ ...c, cardId: findCard(cartesHistorique, c.cardId)?.id ?? c.cardId })),
                  infosCartes,
                ),
                changements: changements.map((c) => ({
                  nom: findCard(cartesHistorique, c.cardId)?.name ?? c.cardId,
                  section: c.section,
                  avant: c.avant,
                  apres: c.apres,
                })),
              }))}
            />
          </div>

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

        {/* Colonne qui suit la lecture sur ordinateur, comme sur /decks/[slug]. */}
        <aside aria-label={t("Résumé du deck")}>
          <div className="grid gap-4 lg:sticky lg:top-22">
            <EncartAchat total={prix.total} lien={lienAchat} />
            <DeckStatsPanel cards={decklistCards} />
          </div>
        </aside>
      </div>

      <CommunityDeckGuide
        shareCode={deck.shareCode}
        initialGuide={deck.guide}
        ownerId={deck.userId}
      />

      <CommentsSection communityDeckId={deck.id} />

      <BarreAchat total={prix.total} lien={lienAchat} />
    </div>
  );
}
