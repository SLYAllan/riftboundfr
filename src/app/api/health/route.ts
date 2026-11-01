import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { achatDisponible, cartesDeck } from "@/lib/cardnexus";
import { SET_EN_COURS } from "@/lib/tournament-order";

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
 *
 * `?achat=1` rend 503 si aucune des dernières listes du set en cours n'a de lien
 * d'achat. Forme à part, jamais lue par le HEALTHCHECK : une clé CardNexus morte
 * coûte des ventes, elle ne justifie pas de remplacer le conteneur.
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const exigerBase = params.get("base") === "1";
  const exigerAchat = params.get("achat") === "1";
  let base: "ok" | "injoignable" = "ok";
  let achat: "ok" | "perdu" | undefined;
  try {
    await prisma.card.count();
    if (exigerAchat) {
      const decks = await prisma.deck.findMany({
        where: { published: true, setTag: SET_EN_COURS },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { cards: { select: { quantity: true, card: { select: { riftboundId: true, name: true } } } } },
      });
      achat = achatDisponible(decks.map((d) => cartesDeck(d.cards))) ? "ok" : "perdu";
    }
  } catch (cause) {
    // Sans la raison, un 503 ne dit pas si la base est tombée ou si l'appli n'a plus
    // de connexion libre : c'était le cas des coupures de 2 minutes du 17 octobre.
    console.error("[sante] base injoignable :", cause instanceof Error ? cause.message : cause);
    base = "injoignable";
  }
  const enPanne = (exigerBase && base !== "ok") || (exigerAchat && achat !== "ok");
  return NextResponse.json({ etat: "ok", base, ...(achat ? { achat } : {}) }, { status: enPanne ? 503 : 200 });
}
