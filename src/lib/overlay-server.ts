import "server-only";
import { prisma } from "@/lib/prisma";
import { defaultOverlayState, makeToken, applyStateUpdate, type OverlayStateData } from "@/lib/overlay";

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

export async function regenerateToken(userId: string) {
  await getOrCreateOverlayState(userId);
  const token = makeToken();
  await prisma.overlayState.update({ where: { userId }, data: { token } });
  return token;
}
