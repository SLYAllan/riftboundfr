import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { buildOwnedByName, type OwnedByName } from "@/lib/collection";

// Map cardId -> quantité TOTALE possédée (somme sur tous les classeurs de l'user),
// pour hydrater le client (deck coverage, badges "possédée").
export async function getCollectionMap(userId: string): Promise<Record<string, number>> {
  const items = await prisma.collectionItem.findMany({
    where: { userId, quantity: { gt: 0 } },
    select: { cardId: true, quantity: true },
  });
  const map: Record<string, number> = {};
  for (const i of items) map[i.cardId] = (map[i.cardId] ?? 0) + i.quantity;
  return map;
}

// Items bruts de l'user (binderId, cardId, quantity) pour calculs côté dashboard.
export async function getCollectionItems(userId: string) {
  return prisma.collectionItem.findMany({
    where: { userId, quantity: { gt: 0 } },
    select: { binderId: true, cardId: true, quantity: true },
  });
}

// Map cardId -> quantité dans UN classeur précis.
export async function getBinderQuantities(binderId: string): Promise<Record<string, number>> {
  const items = await prisma.collectionItem.findMany({
    where: { binderId, quantity: { gt: 0 } },
    select: { cardId: true, quantity: true },
  });
  return Object.fromEntries(items.map((i) => [i.cardId, i.quantity]));
}

export interface BinderSummary {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  shareSlug: string | null;
  color: string | null;
  position: number;
  distinct: number; // nb de cartes distinctes possédées
  copies: number; // nb total d'exemplaires
}

export async function withBinderLock<T>(
  userId: string,
  action: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;
    return action(tx);
  });
}

// Classeurs d'un user avec compteurs (cartes distinctes + exemplaires).
export async function getBinders(userId: string): Promise<BinderSummary[]> {
  const binders = await prisma.binder.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    include: {
      items: { where: { quantity: { gt: 0 } }, select: { quantity: true } },
    },
  });
  return binders.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    isPublic: b.isPublic,
    shareSlug: b.shareSlug,
    color: b.color,
    position: b.position,
    distinct: b.items.length,
    copies: b.items.reduce((s, i) => s + i.quantity, 0),
  }));
}

// Retourne le classeur par défaut de l'user (le premier), en le créant si besoin.
export async function getOrCreateDefaultBinder(userId: string) {
  return withBinderLock(userId, async (tx) => {
    const existing = await tx.binder.findFirst({
      where: { userId },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });
    if (existing) return existing;
    return tx.binder.create({
      data: { userId, name: "Ma collection", description: "Classeur par défaut", position: 0 },
    });
  });
}

// Quantités possédées agrégées par cleanName, pour le calcul de couverture
// (l'alt-art compte pour la carte jouable). Somme sur tous les classeurs.
export async function getOwnedByName(userId: string): Promise<OwnedByName> {
  const items = await prisma.collectionItem.findMany({
    where: { userId, quantity: { gt: 0 } },
    select: { quantity: true, card: { select: { cleanName: true, name: true } } },
  });
  return buildOwnedByName(items);
}
