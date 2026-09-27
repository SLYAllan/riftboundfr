import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeDeck } from "@/lib/deck-codec";
import { deckCoverageItems, resolveDeckCards } from "@/lib/deck-cards";
import { findCard } from "@/lib/card-printing";
import { lienPanier, lignesListe, type Carte } from "@/lib/cardnexus";
import { getUserFromSession } from "@/lib/session";
import { getOwnedByName } from "@/lib/collection-server";
import { computeDeckCoverage, type DeckCardLike } from "@/lib/collection";
import { rateLimit, tooMany } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// `cleanName` ne sert pas à l'achat mais au calcul des cartes manquantes : c'est
// la clé qui fait qu'une illustration alternative déjà possédée compte comme la
// carte de base.
type CarteDeck = Carte & { cleanName: string | null };

/** Les cartes d'un deck publié, dans la forme attendue par `lignesListe`. */
async function cartesDuDeck(slug: string) {
  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: { cards: { include: { card: true } } },
  });
  if (!deck || !deck.published) return null;
  return {
    titre: deck.title,
    cartes: deck.cards.map((dc) => ({
      riftboundId: dc.card.riftboundId,
      name: dc.card.name,
      cleanName: dc.card.cleanName,
      quantity: dc.quantity,
    })),
  };
}

/** Les cartes d'un deck partagé par code. Passe par resolveDeckCards, jamais par une requête à la main. */
async function cartesDuCode(code: string, titre = "Deck Riftbound France") {
  const deck = decodeDeck(code);
  if (!deck) return null;
  const items = deckCoverageItems(deck);
  const { map, missing } = await resolveDeckCards(items.map((i) => i.cardId));
  if (missing.length > 0) return null;
  const cartes: CarteDeck[] = [];
  for (const i of items) {
    const carte = findCard(map, i.cardId);
    if (carte) {
      cartes.push({
        riftboundId: carte.riftboundId,
        name: carte.name,
        cleanName: carte.cleanName,
        quantity: i.quantity,
      });
    }
  }
  return { titre, cartes };
}

/**
 * Ce qu'il manque au joueur connecté pour ce deck, et rien d'autre.
 *
 * Acheter un deck entier quand on en possède déjà les trois quarts fait payer
 * trois fois la même carte. Le calcul est le même que celui de l'encart « Ma
 * collection » (`computeDeckCoverage`) : une carte jouée au deck principal et en
 * réserve compte une fois, et posséder n'importe quelle impression suffit.
 */
async function cartesManquantes(cartes: CarteDeck[], userId: string): Promise<CarteDeck[]> {
  const possedees = await getOwnedByName(userId);
  const lignes: DeckCardLike[] = cartes.map((c) => ({
    // La couverture recopie `cardId` dans ses entrées : y mettre le riftboundId
    // permet de retrouver la carte au retour sans deuxième requête.
    cardId: c.riftboundId,
    name: c.name,
    cleanName: c.cleanName,
    section: "main",
    quantity: c.quantity,
  }));
  const parNom = new Map(cartes.map((c) => [c.riftboundId, c]));
  return computeDeckCoverage(possedees, lignes)
    .entries.filter((e) => e.missing > 0)
    .map((e) => ({
      riftboundId: e.cardId,
      name: e.name,
      cleanName: parNom.get(e.cardId)?.cleanName ?? null,
      quantity: e.missing,
    }));
}

/**
 * Envoie le visiteur sur le « Cart Wizard » de CardNexus, panier déjà composé.
 *
 * Le lien porte les cartes lui-même (voir `lienPanier`). La route ne sert plus
 * qu'à calculer ces cartes côté serveur : le deck entier, ou seulement ce qui
 * manque à la collection du joueur connecté.
 */
// Un GET arrive quand l'adresse est collée, rouverte ou rechargée depuis
// l'onglet que le bouton a ouvert. Il répondait 405 : il renvoie maintenant à la
// page du deck, sans lire la base, où le bouton refait le POST.
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const share = searchParams.get("share");
  const page = slug ? `/decks/${encodeURIComponent(slug)}` : share ? `/d/${encodeURIComponent(share)}` : "/decks";
  return NextResponse.redirect(new URL(page, request.url), 303);
}

// POST et pas GET : une route qui lit la base et la session n'a rien à faire
// dans l'exploration des robots. Avant, elle créait aussi une liste sur le
// compte d'Allan, et les robots en avaient créé 12 100 en suivant le lien.
export async function POST(request: Request) {
  if (!rateLimit(request, { bucket: "cardnexus-panier", limit: 10 })) {
    return tooMany();
  }

  // Mêmes entrées que /api/decklist-image, pour qu'un deck se désigne partout de
  // la même façon : slug d'un deck publié, code de partage communautaire, ou code
  // de deck brut.
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const share = searchParams.get("share");
  const code = searchParams.get("code");
  if (!slug && !share && !code) {
    return NextResponse.json({ error: "Préciser ?slug=, ?share= ou ?code=." }, { status: 400 });
  }

  // « Il me manque quoi » plutôt que « le deck entier ». Réservé aux comptes
  // connectés : sans collection, il n'y a rien à retrancher.
  const seulementManquantes = searchParams.get("manquantes") === "1";
  const user = seulementManquantes ? await getUserFromSession() : null;
  if (seulementManquantes && !user) {
    return NextResponse.json({ error: "Connectez-vous pour n’acheter que les cartes qui vous manquent." }, { status: 401 });
  }

  let deck: Awaited<ReturnType<typeof cartesDuDeck>> = null;
  if (slug) {
    deck = await cartesDuDeck(slug);
  } else if (share) {
    // Pas de filtre sur `isPublic` : un deck non listé reste lisible par qui a le
    // lien, c'est tout le principe du code de partage. La page /d/<code> l'affiche
    // déjà, ses cartes comprises ; refuser l'achat ici ne cachait rien et cassait
    // le bouton pour tous les decks non listés.
    const cd = await prisma.communityDeck.findUnique({ where: { shareCode: share } });
    if (cd) deck = await cartesDuCode(cd.deckCode, cd.title);
  } else {
    deck = await cartesDuCode(code!);
  }
  if (!deck) return NextResponse.json({ error: "Deck introuvable." }, { status: 404 });

  const cartes = user ? await cartesManquantes(deck.cartes, user.id) : deck.cartes;
  if (cartes.length === 0) {
    return NextResponse.json({ error: "Tu possèdes déjà toutes les cartes de ce deck." }, { status: 404 });
  }

  const { items, absentes } = lignesListe(cartes);
  if (absentes.length > 0) {
    return NextResponse.json({ error: "Certaines cartes du deck ne sont pas au catalogue CardNexus." }, { status: 404 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Aucune carte de ce deck n'est au catalogue CardNexus." }, { status: 404 });
  }

  return NextResponse.redirect(lienPanier(items), 303);
}
