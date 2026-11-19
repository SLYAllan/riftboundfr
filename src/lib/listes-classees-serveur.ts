import { cartesDeck } from "./cardnexus";
import type { ListeClassee } from "./listes-classees";
import { prisma } from "./prisma";
import { getTournamentInfo } from "./tournament-flags";

/**
 * Toutes les listes de tournoi classées d'un set, avec leurs cartes. Des milliers
 * de listes : chaque page met en cache son RÉSULTAT, jamais ce tableau, qui
 * dépasse la taille qu'accepte le cache de Next.
 */
export async function listesClassees(set: string): Promise<ListeClassee[]> {
  const decks = await prisma.deck.findMany({
    where: { published: true, setTag: set, placement: { not: null }, tournamentContext: { not: null } },
    select: {
      slug: true,
      legendName: true,
      playerName: true,
      placement: true,
      tournamentContext: true,
      cards: { select: { quantity: true, card: { select: { riftboundId: true, name: true } } } },
    },
  });
  return decks.map((d) => {
    const info = getTournamentInfo(d.tournamentContext!);
    return {
      slug: d.slug,
      legende: d.legendName,
      joueur: d.playerName,
      placement: d.placement!,
      tournoi: d.tournamentContext!,
      date: info?.date,
      joueurs: info?.playerCount,
      noms: d.cards.map((c) => c.card.name),
      cartes: cartesDeck(d.cards),
    };
  });
}
