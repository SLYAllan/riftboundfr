import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Requête qui laisse la page s'afficher en dégradé si la base répond mal.
 *
 * Elle ne disait rien : une base tombée ressemblait à une page vide ou à un
 * tournoi sans decks, et personne ne pouvait le distinguer d'un vrai manque de
 * données. Le contexte part au journal du serveur, jamais à l'écran.
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T, contexte = "requête"): Promise<T> {
  try {
    return await fn();
  } catch (cause) {
    console.error(`[base] ${contexte} : repli sur la valeur par défaut.`, cause instanceof Error ? cause.message : cause);
    return fallback;
  }
}
