import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decodeDeck } from "@/lib/deck-codec";
import { deckCoverageItems, resolveDeckCards } from "@/lib/deck-cards";
import { findCard } from "@/lib/card-printing";
import { lienPanier, lignesListe } from "@/lib/cardnexus";

export const dynamic = "force-dynamic";

const API = "https://public-api.cardnexus.com/v1";

// Une liste CardNexus par deck, créée à la première demande et réutilisée ensuite.
// Sans ce cache, chaque clic créerait une liste de plus sur le compte. Il vit le
// temps du conteneur : au pire on recrée une liste après un redémarrage, ce qui
// est sans conséquence — mieux que d'ajouter une colonne en base pour ça.
const listesConnues = new Map<string, string>();

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
      quantity: dc.quantity,
    })),
  };
}

/** Les cartes d'un deck partagé par code. Passe par resolveDeckCards, jamais par une requête à la main. */
async function cartesDuCode(code: string, titre = "Deck Riftbound France") {
  const deck = decodeDeck(code);
  if (!deck) return null;
  const items = deckCoverageItems(deck);
  const { map } = await resolveDeckCards(items.map((i) => i.cardId));
  const cartes = [];
  for (const i of items) {
    const carte = findCard(map, i.cardId);
    if (carte) cartes.push({ riftboundId: carte.riftboundId, name: carte.name, quantity: i.quantity });
  }
  return { titre, cartes };
}

/**
 * Envoie le visiteur sur le « Cart Wizard » de CardNexus, panier déjà composé.
 *
 * L'API panier de CardNexus ne remplit que le panier du porteur de la clé, donc
 * jamais celui d'un visiteur. Le chemin qui marche : créer une liste publique
 * sur notre compte, puis ouvrir le Cart Wizard dessus — il compare les vendeurs
 * et compose le panier le moins cher, frais de port compris, sans que le
 * visiteur ait besoin d'un compte.
 */
export async function GET(request: Request) {
  const cle = process.env.CARDNEXUS_API_KEY;
  if (!cle) {
    return NextResponse.json({ error: "Achat indisponible : clé CardNexus absente." }, { status: 503 });
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

  const reference = slug ?? (share ? `share:${share}` : `code:${code}`);
  const dejaVue = listesConnues.get(reference);
  if (dejaVue) return NextResponse.redirect(lienPanier(dejaVue), 302);

  let deck: Awaited<ReturnType<typeof cartesDuDeck>> = null;
  if (slug) {
    deck = await cartesDuDeck(slug);
  } else if (share) {
    const cd = await prisma.communityDeck.findUnique({ where: { shareCode: share } });
    if (cd?.isPublic) deck = await cartesDuCode(cd.deckCode, cd.title);
  } else {
    deck = await cartesDuCode(code!);
  }
  if (!deck) return NextResponse.json({ error: "Deck introuvable." }, { status: 404 });

  const { items } = lignesListe(deck.cartes);
  if (items.length === 0) {
    return NextResponse.json({ error: "Aucune carte de ce deck n'est au catalogue CardNexus." }, { status: 404 });
  }

  const entetes = { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" };
  const creation = await fetch(`${API}/lists`, {
    method: "POST",
    headers: entetes,
    body: JSON.stringify({
      name: deck.titre.slice(0, 100),
      game: "riftbound",
      status: "toComplete",
      isPublic: true,
      currency: "EUR",
      description: "Liste composée par Riftbound France.",
    }),
  });
  if (!creation.ok) {
    return NextResponse.json({ error: "CardNexus a refusé la création de la liste." }, { status: 502 });
  }
  const { id } = (await creation.json()) as { id: string };

  const ajout = await fetch(`${API}/lists/${id}/items`, {
    method: "POST",
    headers: entetes,
    body: JSON.stringify({ items }),
  });
  if (!ajout.ok) {
    return NextResponse.json({ error: "CardNexus a refusé les cartes du deck." }, { status: 502 });
  }

  listesConnues.set(reference, id);
  return NextResponse.redirect(lienPanier(id), 302);
}
