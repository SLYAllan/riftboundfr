import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Sonde de disponibilité.
 *
 * Par défaut elle répond 200 dès que le serveur sert, et DIT dans son corps si
 * la base répond. Elle ne rend pas 503 sur une base momentanément injoignable,
 * exprès : c'est le HEALTHCHECK de l'image qui la lit, et rendre la santé du
 * conteneur dépendante de la base recréerait la boucle de redémarrage du
 * 16 août — un accroc d'une seconde ferait remplacer un conteneur qui, lui,
 * sait servir en dégradé (`safeQuery`). Le schéma vide ou incomplet, le vrai cas
 * sans retour, est refusé plus tôt, au démarrage.
 *
 * `?base=1` durcit la réponse : 503 si la base ne répond pas. C'est la forme à
 * pointer depuis une supervision extérieure, qui veut être réveillée.
 */
export async function GET(req: Request) {
  const exigerBase = new URL(req.url).searchParams.get("base") === "1";
  let base: "ok" | "injoignable" = "ok";
  try {
    await prisma.card.count();
  } catch {
    base = "injoignable";
  }
  return NextResponse.json(
    { etat: "ok", base },
    { status: base === "ok" || !exigerBase ? 200 : 503 },
  );
}
