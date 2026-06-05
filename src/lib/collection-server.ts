import { prisma } from "@/lib/prisma";
import { buildOwnedByName, type OwnedByName } from "@/lib/collection";

// Map cardId -> quantité, pour hydrater le client.
export async function getCollectionMap(userId: string): Promise<Record<string, number>> {
  const items = await prisma.collectionItem.findMany({
    where: { userId, quantity: { gt: 0 } },
    select: { cardId: true, quantity: true },
  });
  return Object.fromEntries(items.map((i) => [i.cardId, i.quantity]));
}

// Quantités possédées agrégées par cleanName, pour le calcul de couverture
// (l'alt-art compte pour la carte jouable).
export async function getOwnedByName(userId: string): Promise<OwnedByName> {
  const items = await prisma.collectionItem.findMany({
    where: { userId, quantity: { gt: 0 } },
    select: { quantity: true, card: { select: { cleanName: true, name: true } } },
  });
  return buildOwnedByName(items);
}
