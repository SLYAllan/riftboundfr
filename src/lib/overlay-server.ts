import "server-only";
import { prisma } from "@/lib/prisma";
import { defaultOverlayState, makeToken, applyStateUpdate, recalerMedias, type OverlayStateData } from "@/lib/overlay";

export async function getOrCreateOverlayState(userId: string) {
  const existing = await prisma.overlayState.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.overlayState.create({
    data: { userId, token: makeToken(), state: defaultOverlayState() as object },
  });
}

export async function getStateByToken(token: string): Promise<OverlayStateData | null> {
  const row = await prisma.overlayState.findUnique({ where: { token } });
  return row ? (row.state as unknown as OverlayStateData) : null;
}

export async function saveState(userId: string, patch: Partial<OverlayStateData> & { players?: unknown }) {
  const row = await getOrCreateOverlayState(userId);
  const merged = applyStateUpdate(row.state as unknown as OverlayStateData, patch as never);
  await prisma.overlayState.update({ where: { userId }, data: { state: merged as object } });
  return merged;
}

/**
 * Écriture par le jeton, pour le compagnon : celui qui tient la manette n'est pas
 * forcément connecté à Discord. On applique un PATCH, jamais l'état entier — le
 * streamer peut être en train de changer autre chose depuis son tableau de bord,
 * et le dernier arrivé écraserait tout le reste.
 */
export async function saveStateByToken(token: string, patch: Partial<OverlayStateData> & { players?: unknown }) {
  const row = await prisma.overlayState.findUnique({ where: { token } });
  if (!row) return null;
  const merged = applyStateUpdate(row.state as unknown as OverlayStateData, patch as never);
  await prisma.overlayState.update({ where: { token }, data: { state: merged as object } });
  return merged;
}

export async function regenerateToken(userId: string) {
  const row = await getOrCreateOverlayState(userId);
  const token = makeToken();
  // Les images envoyées sont servies sous le jeton : sans ce recalage, « Nouveau
  // lien » laissait leurs adresses pointer dans le vide.
  const etat = row.state as unknown as OverlayStateData;
  const suivant = { ...etat, event: recalerMedias(etat.event, row.token, token) };
  await prisma.overlayState.update({ where: { userId }, data: { token, state: suivant as object } });
  return token;
}
